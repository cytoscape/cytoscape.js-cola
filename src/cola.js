const assign = require('./assign');
const defaults = require('./defaults');
const cola = require('webcola') || ( typeof window !== 'undefined' ? window.cola : null );
const raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
const isString = function(o){ return typeof o === typeof ''; };
const isNumber = function(o){ return typeof o === typeof 0; };
const isObject = function(o){ return o != null && typeof o === typeof {}; };
const isFunction = function(o){ return o != null && typeof o === typeof function(){}; };
const nop = function(){};

const getOptVal = function( val, ele ){
  if( isFunction(val) ){
    let fn = val;
    return fn.apply( ele, [ ele ] );
  } else {
    return val;
  }
};

// constructor
// options : object containing layout options
function ColaLayout( options ){
  this.options = assign( {}, defaults, options );
}

// runs the layout
ColaLayout.prototype.run = function(){
  let layout = this;
  let options = this.options;

  layout.manuallyStopped = false;

  let cy = options.cy; // cy is automatically populated for us in the constructor
  let eles = options.eles;
  let nodes = eles.nodes();
  let edges = eles.edges();
  let ready = false;

  let isPresent = function(node) {
    return this.getElementById(node.id()).length;
  };

  let parentNodes = nodes.stdFilter(function(node) {
    return node.children().some(isPresent.bind(nodes));
  });
  let nonparentNodes = nodes.subtract(parentNodes);

  let bb = options.boundingBox || { x1: 0, y1: 0, w: cy.width(), h: cy.height() };
  if( bb.x2 === undefined ){ bb.x2 = bb.x1 + bb.w; }
  if( bb.w === undefined ){ bb.w = bb.x2 - bb.x1; }
  if( bb.y2 === undefined ){ bb.y2 = bb.y1 + bb.h; }
  if( bb.h === undefined ){ bb.h = bb.y2 - bb.y1; }

  let updateNodePositions = function(){
    for( let i = 0; i < nodes.length; i++ ){
      let node = nodes[i];
      let dimensions = node.layoutDimensions( options );
      let scratch = node.scratch('cola');

      // update node dims
      if( !scratch.updatedDims ){
        let padding = getOptVal( options.nodeSpacing, node );

        scratch.width = dimensions.w + 2*padding;
        scratch.height = dimensions.h + 2*padding;
      }
    }

    nodes.positions(function(node, i){
      // Perform 2.x and 1.x backwards compatibility check
      if( isNumber(node) ){
        node = i;
      }
      let scratch = node.scratch().cola;
      let retPos;

      if( !node.grabbed() && isPresent.call(nonparentNodes, node) ){
        retPos = {
          x: bb.x1 + scratch.x,
          y: bb.y1 + scratch.y
        };

        if( !isNumber(retPos.x) || !isNumber(retPos.y) ){
          retPos = undefined;
        }
      }

      return retPos;
    });

    nodes.updateCompoundBounds(); // because the way this layout sets positions is buggy for some reason; ref #878

    if( !ready ){
      onReady();
      ready = true;
    }

    if( options.fit ){
      cy.fit( options.padding );
    }
  };

  let onDone = function(){
    if( options.ungrabifyWhileSimulating ){
      grabbableNodes.grabify();
    }

    cy.off('destroy', destroyHandler);

    nodes.off('grab free position', grabHandler);
    nodes.off('lock unlock', lockHandler);

    // trigger layoutstop when the layout stops (e.g. finishes)
    layout.one('layoutstop', options.stop);
    layout.trigger({ type: 'layoutstop', layout: layout });
  };

  let onReady = function(){
    // trigger layoutready when each node has had its position set at least once
    layout.one('layoutready', options.ready);
    layout.trigger({ type: 'layoutready', layout: layout });
  };

  let ticksPerFrame = options.refresh;

  if( options.refresh < 0 ){
    ticksPerFrame = 1;
  } else {
    ticksPerFrame = Math.max( 1, ticksPerFrame ); // at least 1
  }

  let adaptor = layout.adaptor = cola.adaptor({
    trigger: function( e ){ // on sim event
      let TICK = cola.EventType ? cola.EventType.tick : null;
      let END = cola.EventType ? cola.EventType.end : null;

      switch( e.type ){
        case 'tick':
        case TICK:
          if( options.animate ){
            updateNodePositions();
          }
          break;

        case 'end':
        case END:
          updateNodePositions();
          if( !options.infinite ){ onDone(); }
          break;
      }
    },

    kick: function(){ // kick off the simulation
      //let skip = 0;

      let inftick = function(){
        if( layout.manuallyStopped ){
          onDone();

          return true;
        }

        let ret = adaptor.tick();

        if( ret && options.infinite ){ // resume layout if done
          adaptor.resume(); // resume => new kick
        }

        return ret; // allow regular finish b/c of new kick
      };

      let multitick = function(){ // multiple ticks in a row
        let ret;

        for( let i = 0; i < ticksPerFrame && !ret; i++ ){
          ret = ret || inftick(); // pick up true ret vals => sim done
        }

        return ret;
      };

      if( options.animate ){
        let frame = function(){
          if( multitick() ){ return; }

          raf( frame );
        };

        raf( frame );
      } else {
        while( !inftick() ){
          // keep going...
        }
      }
    },

    on: nop, // dummy; not needed

    drag: nop // not needed for our case
  });
  layout.adaptor = adaptor;

  // if set no grabbing during layout
  let grabbableNodes = nodes.filter(':grabbable');
  if( options.ungrabifyWhileSimulating ){
    grabbableNodes.ungrabify();
  }

  let destroyHandler;
  cy.one('destroy', destroyHandler = function(){
    layout.stop();
  });

  // handle node dragging
  let grabHandler;
  nodes.on('grab free position', grabHandler = function(e){
    let node = this;
    let scrCola = node.scratch().cola;
    let pos = node.position();
    let nodeIsTarget = e.cyTarget === node || e.target === node;

    if( !nodeIsTarget ){ return; }

    switch( e.type ){
      case 'grab':
        adaptor.dragstart( scrCola );
        break;
      case 'free':
        adaptor.dragend( scrCola );
        break;
      case 'position':
        // only update when different (i.e. manual .position() call or drag) so we don't loop needlessly
        if( scrCola.px !== pos.x - bb.x1 || scrCola.py !== pos.y - bb.y1 ){
          scrCola.px = pos.x - bb.x1;
          scrCola.py = pos.y - bb.y1;
        }
        break;
    }

  });

  let lockHandler;
  nodes.on('lock unlock', lockHandler = function(){
    let node = this;
    let scrCola = node.scratch().cola;

    scrCola.fixed = node.locked();

    if( node.locked() ){
      adaptor.dragstart( scrCola );
    } else {
      adaptor.dragend( scrCola );
    }
  });

  // add nodes to cola
  adaptor.nodes( nonparentNodes.map(function( node, i ){
    let padding = getOptVal( options.nodeSpacing, node );
    let pos = node.position();
    let dimensions = node.layoutDimensions( options );

    let struct = node.scratch().cola = {
      x: options.randomize || pos.x === undefined ? Math.round( Math.random() * bb.w ) : pos.x,
      y: options.randomize || pos.y === undefined ? Math.round( Math.random() * bb.h ) : pos.y,
      width: dimensions.w + 2*padding,
      height: dimensions.h + 2*padding,
      index: i,
      fixed: node.locked()
    };

    return struct;
  }) );

  // the constraints to be added on nodes
  let constraints = [];

  if( options.alignment ){ // then set alignment constraints

    let offsetsX = [];
    let offsetsY = [];

    nonparentNodes.forEach(function( node ){
      let align = getOptVal( options.alignment, node );
      let scrCola = node.scratch().cola;
      let index = scrCola.index;

      if( !align ){ return; }

      if( align.x != null ){
        offsetsX.push({
          node: index,
          offset: align.x
        });
      }

      if( align.y != null ){
        offsetsY.push({
          node: index,
          offset: align.y
        });
      }
    });

    if( offsetsX.length > 0 ){
      constraints.push({
        type: 'alignment',
        axis: 'x',
        offsets: offsetsX
      });
    }

    if( offsetsY.length > 0 ){
      constraints.push({
        type: 'alignment',
        axis: 'y',
        offsets: offsetsY
      });
    }

  }

  // if gapInequalities variable is set add each inequality constraint to list of constraints
  if ( options.gapInequalities ) {
    options.gapInequalities.forEach( inequality => {

      // for the constraints to be passed to cola layout adaptor use indices of nodes,
      // not the nodes themselves
      let leftIndex = inequality.left.scratch().cola.index;
      let rightIndex = inequality.right.scratch().cola.index;

      constraints.push({
        axis: inequality.axis,
        left: leftIndex,
        right: rightIndex,
        gap: inequality.gap,
        equality: inequality.equality
      });

    } );
  }

  // add constraints if any
  if ( constraints.length > 0 ) {
      adaptor.constraints( constraints );
  }

  // add compound nodes to cola
  adaptor.groups( parentNodes.map(function( node, i ){ // add basic group incl leaf nodes
    let optPadding = getOptVal( options.nodeSpacing, node );
    let getPadding = function(d){
      return parseFloat( node.style('padding-'+d) );
    };

    let pleft = getPadding('left') + optPadding;
    let pright = getPadding('right') + optPadding;
    let ptop = getPadding('top') + optPadding;
    let pbottom = getPadding('bottom') + optPadding;

    node.scratch().cola = {
      index: i,

      padding: Math.max( pleft, pright, ptop, pbottom ),

      // leaves should only contain direct descendants (children),
      // not the leaves of nested compound nodes or any nodes that are compounds themselves
      leaves: node.children()
      .intersection(nonparentNodes)
      .map(function( child ){
        return child[0].scratch().cola.index;
      }),

      fixed: node.locked()
    };

    return node;
  }).map(function( node ){ // add subgroups
    node.scratch().cola.groups = node.children()
    .intersection(parentNodes)
    .map(function( child ){
      return child.scratch().cola.index;
    });

    return node.scratch().cola;
  }) );

  // get the edge length setting mechanism
  let length;
  let lengthFnName;
  if( options.edgeLength != null ){
    length = options.edgeLength;
    lengthFnName = 'linkDistance';
  } else if( options.edgeSymDiffLength != null ){
    length = options.edgeSymDiffLength;
    lengthFnName = 'symmetricDiffLinkLengths';
  } else if( options.edgeJaccardLength != null ){
    length = options.edgeJaccardLength;
    lengthFnName = 'jaccardLinkLengths';
  } else {
    length = 100;
    lengthFnName = 'linkDistance';
  }

  let lengthGetter = function( link ){
    return link.calcLength;
  };

  // add the edges to cola
  adaptor.links( edges.stdFilter(function( edge ){
    return isPresent.call(nonparentNodes, edge.source()) && isPresent.call(nonparentNodes, edge.target());
  }).map(function( edge ){
    let c = edge.scratch().cola = {
      source: edge.source()[0].scratch().cola.index,
      target: edge.target()[0].scratch().cola.index
    };

    if( length != null ){
      c.calcLength = getOptVal( length, edge );
    }

    return c;
  }) );

  adaptor.size([ bb.w, bb.h ]);

  if( length != null ){
    adaptor[ lengthFnName ]( lengthGetter );
  }

  // set the flow of cola
  if( options.flow ){
    let flow;
    let defAxis = 'y';
    let defMinSep = 50;

    if( isString(options.flow) ){
      flow = {
        axis: options.flow,
        minSeparation: defMinSep
      };
    } else if( isNumber(options.flow) ){
      flow = {
        axis: defAxis,
        minSeparation: options.flow
      };
    } else if( isObject(options.flow) ){
      flow = options.flow;

      flow.axis = flow.axis || defAxis;
      flow.minSeparation = flow.minSeparation != null ? flow.minSeparation : defMinSep;
    } else { // e.g. options.flow: true
      flow = {
        axis: defAxis,
        minSeparation: defMinSep
      };
    }

    adaptor.flowLayout( flow.axis , flow.minSeparation );
  }

  layout.trigger({ type: 'layoutstart', layout: layout });

  adaptor
    .avoidOverlaps( options.avoidOverlap )
    .handleDisconnected( options.handleDisconnected )
    .start( options.unconstrIter, options.userConstIter, options.allConstIter)
  ;

  if( !options.infinite ){
    setTimeout(function(){
      if( !layout.manuallyStopped ){
        adaptor.stop();
      }
    }, options.maxSimulationTime);
  }

  return this; // chaining
};

// called on continuous layouts to stop them before they finish
ColaLayout.prototype.stop = function(){
  if( this.adaptor ){
    this.manuallyStopped = true;
    this.adaptor.stop();
  }

  return this; // chaining
};

module.exports = ColaLayout;
