(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["cytoscapeCola"] = factory();
	else
		root["cytoscapeCola"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var assign = __webpack_require__(14);
var defaults = __webpack_require__(15);
var cola = __webpack_require__(16) || (typeof window !== 'undefined' ? window.cola : null);
var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
var isString = function isString(o) {
  return (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === _typeof('');
};
var isNumber = function isNumber(o) {
  return (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === _typeof(0);
};
var isObject = function isObject(o) {
  return o != null && (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === _typeof({});
};
var isFunction = function isFunction(o) {
  return o != null && (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === _typeof(function () {});
};
var nop = function nop() {};

var getOptVal = function getOptVal(val, ele) {
  if (isFunction(val)) {
    var fn = val;
    return fn.apply(ele, [ele]);
  } else {
    return val;
  }
};

// constructor
// options : object containing layout options
function ColaLayout(options) {
  this.options = assign({}, defaults, options);
}

// runs the layout
ColaLayout.prototype.run = function () {
  var layout = this;
  var options = this.options;

  layout.manuallyStopped = false;

  var cy = options.cy; // cy is automatically populated for us in the constructor
  var eles = options.eles;
  var nodes = eles.nodes();
  var edges = eles.edges();
  var ready = false;

  var bb = options.boundingBox || { x1: 0, y1: 0, w: cy.width(), h: cy.height() };
  if (bb.x2 === undefined) {
    bb.x2 = bb.x1 + bb.w;
  }
  if (bb.w === undefined) {
    bb.w = bb.x2 - bb.x1;
  }
  if (bb.y2 === undefined) {
    bb.y2 = bb.y1 + bb.h;
  }
  if (bb.h === undefined) {
    bb.h = bb.y2 - bb.y1;
  }

  var updateNodePositions = function updateNodePositions() {
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var dimensions = node.layoutDimensions(options);
      var scratch = node.scratch('cola');

      // update node dims
      if (!scratch.updatedDims) {
        var padding = getOptVal(options.nodeSpacing, node);

        scratch.width = dimensions.w + 2 * padding;
        scratch.height = dimensions.h + 2 * padding;
      }
    }

    nodes.positions(function (node, i) {
      // Perform 2.x and 1.x backwards compatibility check
      if (isNumber(node)) {
        node = i;
      }
      var scratch = node.scratch().cola;
      var retPos = void 0;

      if (!node.grabbed() && !node.isParent()) {
        retPos = {
          x: bb.x1 + scratch.x,
          y: bb.y1 + scratch.y
        };

        if (!isNumber(retPos.x) || !isNumber(retPos.y)) {
          retPos = undefined;
        }
      }

      return retPos;
    });

    nodes.updateCompoundBounds(); // because the way this layout sets positions is buggy for some reason; ref #878

    if (!ready) {
      onReady();
      ready = true;
    }

    if (options.fit) {
      cy.fit(options.padding);
    }
  };

  var onDone = function onDone() {
    if (options.ungrabifyWhileSimulating) {
      grabbableNodes.grabify();
    }

    cy.off('destroy', destroyHandler);

    nodes.off('grab free position', grabHandler);
    nodes.off('lock unlock', lockHandler);

    // trigger layoutstop when the layout stops (e.g. finishes)
    layout.one('layoutstop', options.stop);
    layout.trigger({ type: 'layoutstop', layout: layout });
  };

  var onReady = function onReady() {
    // trigger layoutready when each node has had its position set at least once
    layout.one('layoutready', options.ready);
    layout.trigger({ type: 'layoutready', layout: layout });
  };

  var ticksPerFrame = options.refresh;

  if (options.refresh < 0) {
    ticksPerFrame = 1;
  } else {
    ticksPerFrame = Math.max(1, ticksPerFrame); // at least 1
  }

  var adaptor = layout.adaptor = cola.adaptor({
    trigger: function trigger(e) {
      // on sim event
      var TICK = cola.EventType ? cola.EventType.tick : null;
      var END = cola.EventType ? cola.EventType.end : null;

      switch (e.type) {
        case 'tick':
        case TICK:
          if (options.animate) {
            updateNodePositions();
          }
          break;

        case 'end':
        case END:
          updateNodePositions();
          if (!options.infinite) {
            onDone();
          }
          break;
      }
    },

    kick: function kick() {
      // kick off the simulation
      //let skip = 0;

      var inftick = function inftick() {
        if (layout.manuallyStopped) {
          onDone();

          return true;
        }

        var ret = adaptor.tick();

        if (ret && options.infinite) {
          // resume layout if done
          adaptor.resume(); // resume => new kick
        }

        return ret; // allow regular finish b/c of new kick
      };

      var multitick = function multitick() {
        // multiple ticks in a row
        var ret = void 0;

        for (var i = 0; i < ticksPerFrame && !ret; i++) {
          ret = ret || inftick(); // pick up true ret vals => sim done
        }

        return ret;
      };

      if (options.animate) {
        var frame = function frame() {
          if (multitick()) {
            return;
          }

          raf(frame);
        };

        raf(frame);
      } else {
        while (!inftick()) {
          // keep going...
        }
      }
    },

    on: nop, // dummy; not needed

    drag: nop // not needed for our case
  });
  layout.adaptor = adaptor;

  // if set no grabbing during layout
  var grabbableNodes = nodes.filter(':grabbable');
  if (options.ungrabifyWhileSimulating) {
    grabbableNodes.ungrabify();
  }

  var destroyHandler = void 0;
  cy.one('destroy', destroyHandler = function destroyHandler() {
    layout.stop();
  });

  // handle node dragging
  var grabHandler = void 0;
  nodes.on('grab free position', grabHandler = function grabHandler(e) {
    var node = this;
    var scrCola = node.scratch().cola;
    var pos = node.position();
    var nodeIsTarget = e.cyTarget === node || e.target === node;

    if (!nodeIsTarget) {
      return;
    }

    switch (e.type) {
      case 'grab':
        adaptor.dragstart(scrCola);
        break;
      case 'free':
        adaptor.dragend(scrCola);
        break;
      case 'position':
        // only update when different (i.e. manual .position() call or drag) so we don't loop needlessly
        if (scrCola.px !== pos.x - bb.x1 || scrCola.py !== pos.y - bb.y1) {
          scrCola.px = pos.x - bb.x1;
          scrCola.py = pos.y - bb.y1;
        }
        break;
    }
  });

  var lockHandler = void 0;
  nodes.on('lock unlock', lockHandler = function lockHandler() {
    var node = this;
    var scrCola = node.scratch().cola;

    scrCola.fixed = node.locked();

    if (node.locked()) {
      adaptor.dragstart(scrCola);
    } else {
      adaptor.dragend(scrCola);
    }
  });

  var nonparentNodes = nodes.stdFilter(function (node) {
    return !node.isParent();
  });

  // add nodes to cola
  adaptor.nodes(nonparentNodes.map(function (node, i) {
    var padding = getOptVal(options.nodeSpacing, node);
    var pos = node.position();
    var dimensions = node.layoutDimensions(options);

    var struct = node.scratch().cola = {
      x: options.randomize || pos.x === undefined ? Math.round(Math.random() * bb.w) : pos.x,
      y: options.randomize || pos.y === undefined ? Math.round(Math.random() * bb.h) : pos.y,
      width: dimensions.w + 2 * padding,
      height: dimensions.h + 2 * padding,
      index: i,
      fixed: node.locked()
    };

    return struct;
  }));

  // the constraints to be added on nodes
  var constraints = [];

  if (options.alignment) {
    // then set alignment constraints

    var offsetsX = [];
    var offsetsY = [];

    nonparentNodes.forEach(function (node) {
      var align = getOptVal(options.alignment, node);
      var scrCola = node.scratch().cola;
      var index = scrCola.index;

      if (!align) {
        return;
      }

      if (align.x != null) {
        offsetsX.push({
          node: index,
          offset: align.x
        });
      }

      if (align.y != null) {
        offsetsY.push({
          node: index,
          offset: align.y
        });
      }
    });

    if (offsetsX.length > 0) {
      constraints.push({
        type: 'alignment',
        axis: 'x',
        offsets: offsetsX
      });
    }

    if (offsetsY.length > 0) {
      constraints.push({
        type: 'alignment',
        axis: 'y',
        offsets: offsetsY
      });
    }
  }

  // if gapInequalities variable is set add each inequality constraint to list of constraints
  if (options.gapInequalities) {
    options.gapInequalities.forEach(function (inequality) {

      // for the constraints to be passed to cola layout adaptor use indices of nodes,
      // not the nodes themselves
      var leftIndex = inequality.left.scratch().cola.index;
      var rightIndex = inequality.right.scratch().cola.index;

      constraints.push({
        axis: inequality.axis,
        left: leftIndex,
        right: rightIndex,
        gap: inequality.gap,
        equality: inequality.equality
      });
    });
  }

  // add constraints if any
  if (constraints.length > 0) {
    adaptor.constraints(constraints);
  }

  // add compound nodes to cola
  adaptor.groups(nodes.stdFilter(function (node) {
    return node.isParent();
  }).map(function (node, i) {
    // add basic group incl leaf nodes
    var optPadding = getOptVal(options.nodeSpacing, node);
    var getPadding = function getPadding(d) {
      return parseFloat(node.style('padding-' + d));
    };

    var pleft = getPadding('left') + optPadding;
    var pright = getPadding('right') + optPadding;
    var ptop = getPadding('top') + optPadding;
    var pbottom = getPadding('bottom') + optPadding;

    node.scratch().cola = {
      index: i,

      padding: Math.max(pleft, pright, ptop, pbottom),

      // leaves should only contain direct descendants (children),
      // not the leaves of nested compound nodes or any nodes that are compounds themselves
      leaves: node.children().stdFilter(function (child) {
        return !child.isParent();
      }).map(function (child) {
        return child[0].scratch().cola.index;
      }),

      fixed: node.locked()
    };

    return node;
  }).map(function (node) {
    // add subgroups
    node.scratch().cola.groups = node.children().stdFilter(function (child) {
      return child.isParent();
    }).map(function (child) {
      return child.scratch().cola.index;
    });

    return node.scratch().cola;
  }));

  // get the edge length setting mechanism
  var length = void 0;
  var lengthFnName = void 0;
  if (options.edgeLength != null) {
    length = options.edgeLength;
    lengthFnName = 'linkDistance';
  } else if (options.edgeSymDiffLength != null) {
    length = options.edgeSymDiffLength;
    lengthFnName = 'symmetricDiffLinkLengths';
  } else if (options.edgeJaccardLength != null) {
    length = options.edgeJaccardLength;
    lengthFnName = 'jaccardLinkLengths';
  } else {
    length = 100;
    lengthFnName = 'linkDistance';
  }

  var lengthGetter = function lengthGetter(link) {
    return link.calcLength;
  };

  // add the edges to cola
  adaptor.links(edges.stdFilter(function (edge) {
    return !edge.source().isParent() && !edge.target().isParent();
  }).map(function (edge) {
    var c = edge.scratch().cola = {
      source: edge.source()[0].scratch().cola.index,
      target: edge.target()[0].scratch().cola.index
    };

    if (length != null) {
      c.calcLength = getOptVal(length, edge);
    }

    return c;
  }));

  adaptor.size([bb.w, bb.h]);

  if (length != null) {
    adaptor[lengthFnName](lengthGetter);
  }

  // set the flow of cola
  if (options.flow) {
    var flow = void 0;
    var defAxis = 'y';
    var defMinSep = 50;

    if (isString(options.flow)) {
      flow = {
        axis: options.flow,
        minSeparation: defMinSep
      };
    } else if (isNumber(options.flow)) {
      flow = {
        axis: defAxis,
        minSeparation: options.flow
      };
    } else if (isObject(options.flow)) {
      flow = options.flow;

      flow.axis = flow.axis || defAxis;
      flow.minSeparation = flow.minSeparation != null ? flow.minSeparation : defMinSep;
    } else {
      // e.g. options.flow: true
      flow = {
        axis: defAxis,
        minSeparation: defMinSep
      };
    }

    adaptor.flowLayout(flow.axis, flow.minSeparation);
  }

  layout.trigger({ type: 'layoutstart', layout: layout });

  adaptor.avoidOverlaps(options.avoidOverlap).handleDisconnected(options.handleDisconnected).start(options.unconstrIter, options.userConstIter, options.allConstIter);

  if (!options.infinite) {
    setTimeout(function () {
      if (!layout.manuallyStopped) {
        adaptor.stop();
      }
    }, options.maxSimulationTime);
  }

  return this; // chaining
};

// called on continuous layouts to stop them before they finish
ColaLayout.prototype.stop = function () {
  if (this.adaptor) {
    this.manuallyStopped = true;
    this.adaptor.stop();
  }

  return this; // chaining
};

module.exports = ColaLayout;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var impl = __webpack_require__(0);

// registers the extension on a cytoscape lib ref
var register = function register(cytoscape) {
  if (!cytoscape) {
    return;
  } // can't register if cytoscape unspecified

  cytoscape('layout', 'cola', impl); // register with cytoscape.js
};

if (typeof cytoscape !== 'undefined') {
  // expose to global cytoscape (i.e. window.cytoscape)
  register(cytoscape);
}

module.exports = register;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var powergraph = __webpack_require__(11);
var linklengths_1 = __webpack_require__(6);
var descent_1 = __webpack_require__(5);
var rectangle_1 = __webpack_require__(3);
var shortestpaths_1 = __webpack_require__(4);
var geom_1 = __webpack_require__(8);
var handledisconnected_1 = __webpack_require__(10);
var EventType;
(function (EventType) {
    EventType[EventType["start"] = 0] = "start";
    EventType[EventType["tick"] = 1] = "tick";
    EventType[EventType["end"] = 2] = "end";
})(EventType = exports.EventType || (exports.EventType = {}));
;
function isGroup(g) {
    return typeof g.leaves !== 'undefined' || typeof g.groups !== 'undefined';
}
var Layout = (function () {
    function Layout() {
        var _this = this;
        this._canvasSize = [1, 1];
        this._linkDistance = 20;
        this._defaultNodeSize = 10;
        this._linkLengthCalculator = null;
        this._linkType = null;
        this._avoidOverlaps = false;
        this._handleDisconnected = true;
        this._running = false;
        this._nodes = [];
        this._groups = [];
        this._rootGroup = null;
        this._links = [];
        this._constraints = [];
        this._distanceMatrix = null;
        this._descent = null;
        this._directedLinkConstraints = null;
        this._threshold = 0.01;
        this._visibilityGraph = null;
        this._groupCompactness = 1e-6;
        this.event = null;
        this.linkAccessor = {
            getSourceIndex: Layout.getSourceIndex,
            getTargetIndex: Layout.getTargetIndex,
            setLength: Layout.setLinkLength,
            getType: function (l) { return typeof _this._linkType === "function" ? _this._linkType(l) : 0; }
        };
    }
    Layout.prototype.on = function (e, listener) {
        if (!this.event)
            this.event = {};
        if (typeof e === 'string') {
            this.event[EventType[e]] = listener;
        }
        else {
            this.event[e] = listener;
        }
        return this;
    };
    Layout.prototype.trigger = function (e) {
        if (this.event && typeof this.event[e.type] !== 'undefined') {
            this.event[e.type](e);
        }
    };
    Layout.prototype.kick = function () {
        while (!this.tick())
            ;
    };
    Layout.prototype.tick = function () {
        if (this._alpha < this._threshold) {
            this._running = false;
            this.trigger({ type: EventType.end, alpha: this._alpha = 0, stress: this._lastStress });
            return true;
        }
        var n = this._nodes.length, m = this._links.length;
        var o, i;
        this._descent.locks.clear();
        for (i = 0; i < n; ++i) {
            o = this._nodes[i];
            if (o.fixed) {
                if (typeof o.px === 'undefined' || typeof o.py === 'undefined') {
                    o.px = o.x;
                    o.py = o.y;
                }
                var p = [o.px, o.py];
                this._descent.locks.add(i, p);
            }
        }
        var s1 = this._descent.rungeKutta();
        if (s1 === 0) {
            this._alpha = 0;
        }
        else if (typeof this._lastStress !== 'undefined') {
            this._alpha = s1;
        }
        this._lastStress = s1;
        this.updateNodePositions();
        this.trigger({ type: EventType.tick, alpha: this._alpha, stress: this._lastStress });
        return false;
    };
    Layout.prototype.updateNodePositions = function () {
        var x = this._descent.x[0], y = this._descent.x[1];
        var o, i = this._nodes.length;
        while (i--) {
            o = this._nodes[i];
            o.x = x[i];
            o.y = y[i];
        }
    };
    Layout.prototype.nodes = function (v) {
        if (!v) {
            if (this._nodes.length === 0 && this._links.length > 0) {
                var n = 0;
                this._links.forEach(function (l) {
                    n = Math.max(n, l.source, l.target);
                });
                this._nodes = new Array(++n);
                for (var i = 0; i < n; ++i) {
                    this._nodes[i] = {};
                }
            }
            return this._nodes;
        }
        this._nodes = v;
        return this;
    };
    Layout.prototype.groups = function (x) {
        var _this = this;
        if (!x)
            return this._groups;
        this._groups = x;
        this._rootGroup = {};
        this._groups.forEach(function (g) {
            if (typeof g.padding === "undefined")
                g.padding = 1;
            if (typeof g.leaves !== "undefined") {
                g.leaves.forEach(function (v, i) {
                    if (typeof v === 'number')
                        (g.leaves[i] = _this._nodes[v]).parent = g;
                });
            }
            if (typeof g.groups !== "undefined") {
                g.groups.forEach(function (gi, i) {
                    if (typeof gi === 'number')
                        (g.groups[i] = _this._groups[gi]).parent = g;
                });
            }
        });
        this._rootGroup.leaves = this._nodes.filter(function (v) { return typeof v.parent === 'undefined'; });
        this._rootGroup.groups = this._groups.filter(function (g) { return typeof g.parent === 'undefined'; });
        return this;
    };
    Layout.prototype.powerGraphGroups = function (f) {
        var g = powergraph.getGroups(this._nodes, this._links, this.linkAccessor, this._rootGroup);
        this.groups(g.groups);
        f(g);
        return this;
    };
    Layout.prototype.avoidOverlaps = function (v) {
        if (!arguments.length)
            return this._avoidOverlaps;
        this._avoidOverlaps = v;
        return this;
    };
    Layout.prototype.handleDisconnected = function (v) {
        if (!arguments.length)
            return this._handleDisconnected;
        this._handleDisconnected = v;
        return this;
    };
    Layout.prototype.flowLayout = function (axis, minSeparation) {
        if (!arguments.length)
            axis = 'y';
        this._directedLinkConstraints = {
            axis: axis,
            getMinSeparation: typeof minSeparation === 'number' ? function () { return minSeparation; } : minSeparation
        };
        return this;
    };
    Layout.prototype.links = function (x) {
        if (!arguments.length)
            return this._links;
        this._links = x;
        return this;
    };
    Layout.prototype.constraints = function (c) {
        if (!arguments.length)
            return this._constraints;
        this._constraints = c;
        return this;
    };
    Layout.prototype.distanceMatrix = function (d) {
        if (!arguments.length)
            return this._distanceMatrix;
        this._distanceMatrix = d;
        return this;
    };
    Layout.prototype.size = function (x) {
        if (!x)
            return this._canvasSize;
        this._canvasSize = x;
        return this;
    };
    Layout.prototype.defaultNodeSize = function (x) {
        if (!x)
            return this._defaultNodeSize;
        this._defaultNodeSize = x;
        return this;
    };
    Layout.prototype.groupCompactness = function (x) {
        if (!x)
            return this._groupCompactness;
        this._groupCompactness = x;
        return this;
    };
    Layout.prototype.linkDistance = function (x) {
        if (!x) {
            return this._linkDistance;
        }
        this._linkDistance = typeof x === "function" ? x : +x;
        this._linkLengthCalculator = null;
        return this;
    };
    Layout.prototype.linkType = function (f) {
        this._linkType = f;
        return this;
    };
    Layout.prototype.convergenceThreshold = function (x) {
        if (!x)
            return this._threshold;
        this._threshold = typeof x === "function" ? x : +x;
        return this;
    };
    Layout.prototype.alpha = function (x) {
        if (!arguments.length)
            return this._alpha;
        else {
            x = +x;
            if (this._alpha) {
                if (x > 0)
                    this._alpha = x;
                else
                    this._alpha = 0;
            }
            else if (x > 0) {
                if (!this._running) {
                    this._running = true;
                    this.trigger({ type: EventType.start, alpha: this._alpha = x });
                    this.kick();
                }
            }
            return this;
        }
    };
    Layout.prototype.getLinkLength = function (link) {
        return typeof this._linkDistance === "function" ? +(this._linkDistance(link)) : this._linkDistance;
    };
    Layout.setLinkLength = function (link, length) {
        link.length = length;
    };
    Layout.prototype.getLinkType = function (link) {
        return typeof this._linkType === "function" ? this._linkType(link) : 0;
    };
    Layout.prototype.symmetricDiffLinkLengths = function (idealLength, w) {
        var _this = this;
        if (w === void 0) { w = 1; }
        this.linkDistance(function (l) { return idealLength * l.length; });
        this._linkLengthCalculator = function () { return linklengths_1.symmetricDiffLinkLengths(_this._links, _this.linkAccessor, w); };
        return this;
    };
    Layout.prototype.jaccardLinkLengths = function (idealLength, w) {
        var _this = this;
        if (w === void 0) { w = 1; }
        this.linkDistance(function (l) { return idealLength * l.length; });
        this._linkLengthCalculator = function () { return linklengths_1.jaccardLinkLengths(_this._links, _this.linkAccessor, w); };
        return this;
    };
    Layout.prototype.start = function (initialUnconstrainedIterations, initialUserConstraintIterations, initialAllConstraintsIterations, gridSnapIterations, keepRunning) {
        var _this = this;
        if (initialUnconstrainedIterations === void 0) { initialUnconstrainedIterations = 0; }
        if (initialUserConstraintIterations === void 0) { initialUserConstraintIterations = 0; }
        if (initialAllConstraintsIterations === void 0) { initialAllConstraintsIterations = 0; }
        if (gridSnapIterations === void 0) { gridSnapIterations = 0; }
        if (keepRunning === void 0) { keepRunning = true; }
        var i, j, n = this.nodes().length, N = n + 2 * this._groups.length, m = this._links.length, w = this._canvasSize[0], h = this._canvasSize[1];
        var x = new Array(N), y = new Array(N);
        var G = null;
        var ao = this._avoidOverlaps;
        this._nodes.forEach(function (v, i) {
            v.index = i;
            if (typeof v.x === 'undefined') {
                v.x = w / 2, v.y = h / 2;
            }
            x[i] = v.x, y[i] = v.y;
        });
        if (this._linkLengthCalculator)
            this._linkLengthCalculator();
        var distances;
        if (this._distanceMatrix) {
            distances = this._distanceMatrix;
        }
        else {
            distances = (new shortestpaths_1.Calculator(N, this._links, Layout.getSourceIndex, Layout.getTargetIndex, function (l) { return _this.getLinkLength(l); })).DistanceMatrix();
            G = descent_1.Descent.createSquareMatrix(N, function () { return 2; });
            this._links.forEach(function (l) {
                if (typeof l.source == "number")
                    l.source = _this._nodes[l.source];
                if (typeof l.target == "number")
                    l.target = _this._nodes[l.target];
            });
            this._links.forEach(function (e) {
                var u = Layout.getSourceIndex(e), v = Layout.getTargetIndex(e);
                G[u][v] = G[v][u] = e.weight || 1;
            });
        }
        var D = descent_1.Descent.createSquareMatrix(N, function (i, j) {
            return distances[i][j];
        });
        if (this._rootGroup && typeof this._rootGroup.groups !== 'undefined') {
            var i = n;
            var addAttraction = function (i, j, strength, idealDistance) {
                G[i][j] = G[j][i] = strength;
                D[i][j] = D[j][i] = idealDistance;
            };
            this._groups.forEach(function (g) {
                addAttraction(i, i + 1, _this._groupCompactness, 0.1);
                x[i] = 0, y[i++] = 0;
                x[i] = 0, y[i++] = 0;
            });
        }
        else
            this._rootGroup = { leaves: this._nodes, groups: [] };
        var curConstraints = this._constraints || [];
        if (this._directedLinkConstraints) {
            this.linkAccessor.getMinSeparation = this._directedLinkConstraints.getMinSeparation;
            curConstraints = curConstraints.concat(linklengths_1.generateDirectedEdgeConstraints(n, this._links, this._directedLinkConstraints.axis, (this.linkAccessor)));
        }
        this.avoidOverlaps(false);
        this._descent = new descent_1.Descent([x, y], D);
        this._descent.locks.clear();
        for (var i = 0; i < n; ++i) {
            var o = this._nodes[i];
            if (o.fixed) {
                o.px = o.x;
                o.py = o.y;
                var p = [o.x, o.y];
                this._descent.locks.add(i, p);
            }
        }
        this._descent.threshold = this._threshold;
        this.initialLayout(initialUnconstrainedIterations, x, y);
        if (curConstraints.length > 0)
            this._descent.project = new rectangle_1.Projection(this._nodes, this._groups, this._rootGroup, curConstraints).projectFunctions();
        this._descent.run(initialUserConstraintIterations);
        this.separateOverlappingComponents(w, h);
        this.avoidOverlaps(ao);
        if (ao) {
            this._nodes.forEach(function (v, i) { v.x = x[i], v.y = y[i]; });
            this._descent.project = new rectangle_1.Projection(this._nodes, this._groups, this._rootGroup, curConstraints, true).projectFunctions();
            this._nodes.forEach(function (v, i) { x[i] = v.x, y[i] = v.y; });
        }
        this._descent.G = G;
        this._descent.run(initialAllConstraintsIterations);
        if (gridSnapIterations) {
            this._descent.snapStrength = 1000;
            this._descent.snapGridSize = this._nodes[0].width;
            this._descent.numGridSnapNodes = n;
            this._descent.scaleSnapByMaxH = n != N;
            var G0 = descent_1.Descent.createSquareMatrix(N, function (i, j) {
                if (i >= n || j >= n)
                    return G[i][j];
                return 0;
            });
            this._descent.G = G0;
            this._descent.run(gridSnapIterations);
        }
        this.updateNodePositions();
        this.separateOverlappingComponents(w, h);
        return keepRunning ? this.resume() : this;
    };
    Layout.prototype.initialLayout = function (iterations, x, y) {
        if (this._groups.length > 0 && iterations > 0) {
            var n = this._nodes.length;
            var edges = this._links.map(function (e) { return ({ source: e.source.index, target: e.target.index }); });
            var vs = this._nodes.map(function (v) { return ({ index: v.index }); });
            this._groups.forEach(function (g, i) {
                vs.push({ index: g.index = n + i });
            });
            this._groups.forEach(function (g, i) {
                if (typeof g.leaves !== 'undefined')
                    g.leaves.forEach(function (v) { return edges.push({ source: g.index, target: v.index }); });
                if (typeof g.groups !== 'undefined')
                    g.groups.forEach(function (gg) { return edges.push({ source: g.index, target: gg.index }); });
            });
            new Layout()
                .size(this.size())
                .nodes(vs)
                .links(edges)
                .avoidOverlaps(false)
                .linkDistance(this.linkDistance())
                .symmetricDiffLinkLengths(5)
                .convergenceThreshold(1e-4)
                .start(iterations, 0, 0, 0, false);
            this._nodes.forEach(function (v) {
                x[v.index] = vs[v.index].x;
                y[v.index] = vs[v.index].y;
            });
        }
        else {
            this._descent.run(iterations);
        }
    };
    Layout.prototype.separateOverlappingComponents = function (width, height) {
        var _this = this;
        if (!this._distanceMatrix && this._handleDisconnected) {
            var x_1 = this._descent.x[0], y_1 = this._descent.x[1];
            this._nodes.forEach(function (v, i) { v.x = x_1[i], v.y = y_1[i]; });
            var graphs = handledisconnected_1.separateGraphs(this._nodes, this._links);
            handledisconnected_1.applyPacking(graphs, width, height, this._defaultNodeSize);
            this._nodes.forEach(function (v, i) {
                _this._descent.x[0][i] = v.x, _this._descent.x[1][i] = v.y;
                if (v.bounds) {
                    v.bounds.setXCentre(v.x);
                    v.bounds.setYCentre(v.y);
                }
            });
        }
    };
    Layout.prototype.resume = function () {
        return this.alpha(0.1);
    };
    Layout.prototype.stop = function () {
        return this.alpha(0);
    };
    Layout.prototype.prepareEdgeRouting = function (nodeMargin) {
        if (nodeMargin === void 0) { nodeMargin = 0; }
        this._visibilityGraph = new geom_1.TangentVisibilityGraph(this._nodes.map(function (v) {
            return v.bounds.inflate(-nodeMargin).vertices();
        }));
    };
    Layout.prototype.routeEdge = function (edge, ah, draw) {
        if (ah === void 0) { ah = 5; }
        var lineData = [];
        var vg2 = new geom_1.TangentVisibilityGraph(this._visibilityGraph.P, { V: this._visibilityGraph.V, E: this._visibilityGraph.E }), port1 = { x: edge.source.x, y: edge.source.y }, port2 = { x: edge.target.x, y: edge.target.y }, start = vg2.addPoint(port1, edge.source.index), end = vg2.addPoint(port2, edge.target.index);
        vg2.addEdgeIfVisible(port1, port2, edge.source.index, edge.target.index);
        if (typeof draw !== 'undefined') {
            draw(vg2);
        }
        var sourceInd = function (e) { return e.source.id; }, targetInd = function (e) { return e.target.id; }, length = function (e) { return e.length(); }, spCalc = new shortestpaths_1.Calculator(vg2.V.length, vg2.E, sourceInd, targetInd, length), shortestPath = spCalc.PathFromNodeToNode(start.id, end.id);
        if (shortestPath.length === 1 || shortestPath.length === vg2.V.length) {
            var route = rectangle_1.makeEdgeBetween(edge.source.innerBounds, edge.target.innerBounds, ah);
            lineData = [route.sourceIntersection, route.arrowStart];
        }
        else {
            var n = shortestPath.length - 2, p = vg2.V[shortestPath[n]].p, q = vg2.V[shortestPath[0]].p, lineData = [edge.source.innerBounds.rayIntersection(p.x, p.y)];
            for (var i = n; i >= 0; --i)
                lineData.push(vg2.V[shortestPath[i]].p);
            lineData.push(rectangle_1.makeEdgeTo(q, edge.target.innerBounds, ah));
        }
        return lineData;
    };
    Layout.getSourceIndex = function (e) {
        return typeof e.source === 'number' ? e.source : e.source.index;
    };
    Layout.getTargetIndex = function (e) {
        return typeof e.target === 'number' ? e.target : e.target.index;
    };
    Layout.linkId = function (e) {
        return Layout.getSourceIndex(e) + "-" + Layout.getTargetIndex(e);
    };
    Layout.dragStart = function (d) {
        if (isGroup(d)) {
            Layout.storeOffset(d, Layout.dragOrigin(d));
        }
        else {
            Layout.stopNode(d);
            d.fixed |= 2;
        }
    };
    Layout.stopNode = function (v) {
        v.px = v.x;
        v.py = v.y;
    };
    Layout.storeOffset = function (d, origin) {
        if (typeof d.leaves !== 'undefined') {
            d.leaves.forEach(function (v) {
                v.fixed |= 2;
                Layout.stopNode(v);
                v._dragGroupOffsetX = v.x - origin.x;
                v._dragGroupOffsetY = v.y - origin.y;
            });
        }
        if (typeof d.groups !== 'undefined') {
            d.groups.forEach(function (g) { return Layout.storeOffset(g, origin); });
        }
    };
    Layout.dragOrigin = function (d) {
        if (isGroup(d)) {
            return {
                x: d.bounds.cx(),
                y: d.bounds.cy()
            };
        }
        else {
            return d;
        }
    };
    Layout.drag = function (d, position) {
        if (isGroup(d)) {
            if (typeof d.leaves !== 'undefined') {
                d.leaves.forEach(function (v) {
                    d.bounds.setXCentre(position.x);
                    d.bounds.setYCentre(position.y);
                    v.px = v._dragGroupOffsetX + position.x;
                    v.py = v._dragGroupOffsetY + position.y;
                });
            }
            if (typeof d.groups !== 'undefined') {
                d.groups.forEach(function (g) { return Layout.drag(g, position); });
            }
        }
        else {
            d.px = position.x;
            d.py = position.y;
        }
    };
    Layout.dragEnd = function (d) {
        if (isGroup(d)) {
            if (typeof d.leaves !== 'undefined') {
                d.leaves.forEach(function (v) {
                    Layout.dragEnd(v);
                    delete v._dragGroupOffsetX;
                    delete v._dragGroupOffsetY;
                });
            }
            if (typeof d.groups !== 'undefined') {
                d.groups.forEach(Layout.dragEnd);
            }
        }
        else {
            d.fixed &= ~6;
        }
    };
    Layout.mouseOver = function (d) {
        d.fixed |= 4;
        d.px = d.x, d.py = d.y;
    };
    Layout.mouseOut = function (d) {
        d.fixed &= ~4;
    };
    return Layout;
}());
exports.Layout = Layout;
//# sourceMappingURL=layout.js.map

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var vpsc_1 = __webpack_require__(7);
var rbtree_1 = __webpack_require__(13);
function computeGroupBounds(g) {
    g.bounds = typeof g.leaves !== "undefined" ?
        g.leaves.reduce(function (r, c) { return c.bounds.union(r); }, Rectangle.empty()) :
        Rectangle.empty();
    if (typeof g.groups !== "undefined")
        g.bounds = g.groups.reduce(function (r, c) { return computeGroupBounds(c).union(r); }, g.bounds);
    g.bounds = g.bounds.inflate(g.padding);
    return g.bounds;
}
exports.computeGroupBounds = computeGroupBounds;
var Rectangle = (function () {
    function Rectangle(x, X, y, Y) {
        this.x = x;
        this.X = X;
        this.y = y;
        this.Y = Y;
    }
    Rectangle.empty = function () { return new Rectangle(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY); };
    Rectangle.prototype.cx = function () { return (this.x + this.X) / 2; };
    Rectangle.prototype.cy = function () { return (this.y + this.Y) / 2; };
    Rectangle.prototype.overlapX = function (r) {
        var ux = this.cx(), vx = r.cx();
        if (ux <= vx && r.x < this.X)
            return this.X - r.x;
        if (vx <= ux && this.x < r.X)
            return r.X - this.x;
        return 0;
    };
    Rectangle.prototype.overlapY = function (r) {
        var uy = this.cy(), vy = r.cy();
        if (uy <= vy && r.y < this.Y)
            return this.Y - r.y;
        if (vy <= uy && this.y < r.Y)
            return r.Y - this.y;
        return 0;
    };
    Rectangle.prototype.setXCentre = function (cx) {
        var dx = cx - this.cx();
        this.x += dx;
        this.X += dx;
    };
    Rectangle.prototype.setYCentre = function (cy) {
        var dy = cy - this.cy();
        this.y += dy;
        this.Y += dy;
    };
    Rectangle.prototype.width = function () {
        return this.X - this.x;
    };
    Rectangle.prototype.height = function () {
        return this.Y - this.y;
    };
    Rectangle.prototype.union = function (r) {
        return new Rectangle(Math.min(this.x, r.x), Math.max(this.X, r.X), Math.min(this.y, r.y), Math.max(this.Y, r.Y));
    };
    Rectangle.prototype.lineIntersections = function (x1, y1, x2, y2) {
        var sides = [[this.x, this.y, this.X, this.y],
            [this.X, this.y, this.X, this.Y],
            [this.X, this.Y, this.x, this.Y],
            [this.x, this.Y, this.x, this.y]];
        var intersections = [];
        for (var i = 0; i < 4; ++i) {
            var r = Rectangle.lineIntersection(x1, y1, x2, y2, sides[i][0], sides[i][1], sides[i][2], sides[i][3]);
            if (r !== null)
                intersections.push({ x: r.x, y: r.y });
        }
        return intersections;
    };
    Rectangle.prototype.rayIntersection = function (x2, y2) {
        var ints = this.lineIntersections(this.cx(), this.cy(), x2, y2);
        return ints.length > 0 ? ints[0] : null;
    };
    Rectangle.prototype.vertices = function () {
        return [
            { x: this.x, y: this.y },
            { x: this.X, y: this.y },
            { x: this.X, y: this.Y },
            { x: this.x, y: this.Y }
        ];
    };
    Rectangle.lineIntersection = function (x1, y1, x2, y2, x3, y3, x4, y4) {
        var dx12 = x2 - x1, dx34 = x4 - x3, dy12 = y2 - y1, dy34 = y4 - y3, denominator = dy34 * dx12 - dx34 * dy12;
        if (denominator == 0)
            return null;
        var dx31 = x1 - x3, dy31 = y1 - y3, numa = dx34 * dy31 - dy34 * dx31, a = numa / denominator, numb = dx12 * dy31 - dy12 * dx31, b = numb / denominator;
        if (a >= 0 && a <= 1 && b >= 0 && b <= 1) {
            return {
                x: x1 + a * dx12,
                y: y1 + a * dy12
            };
        }
        return null;
    };
    Rectangle.prototype.inflate = function (pad) {
        return new Rectangle(this.x - pad, this.X + pad, this.y - pad, this.Y + pad);
    };
    return Rectangle;
}());
exports.Rectangle = Rectangle;
function makeEdgeBetween(source, target, ah) {
    var si = source.rayIntersection(target.cx(), target.cy()) || { x: source.cx(), y: source.cy() }, ti = target.rayIntersection(source.cx(), source.cy()) || { x: target.cx(), y: target.cy() }, dx = ti.x - si.x, dy = ti.y - si.y, l = Math.sqrt(dx * dx + dy * dy), al = l - ah;
    return {
        sourceIntersection: si,
        targetIntersection: ti,
        arrowStart: { x: si.x + al * dx / l, y: si.y + al * dy / l }
    };
}
exports.makeEdgeBetween = makeEdgeBetween;
function makeEdgeTo(s, target, ah) {
    var ti = target.rayIntersection(s.x, s.y);
    if (!ti)
        ti = { x: target.cx(), y: target.cy() };
    var dx = ti.x - s.x, dy = ti.y - s.y, l = Math.sqrt(dx * dx + dy * dy);
    return { x: ti.x - ah * dx / l, y: ti.y - ah * dy / l };
}
exports.makeEdgeTo = makeEdgeTo;
var Node = (function () {
    function Node(v, r, pos) {
        this.v = v;
        this.r = r;
        this.pos = pos;
        this.prev = makeRBTree();
        this.next = makeRBTree();
    }
    return Node;
}());
var Event = (function () {
    function Event(isOpen, v, pos) {
        this.isOpen = isOpen;
        this.v = v;
        this.pos = pos;
    }
    return Event;
}());
function compareEvents(a, b) {
    if (a.pos > b.pos) {
        return 1;
    }
    if (a.pos < b.pos) {
        return -1;
    }
    if (a.isOpen) {
        return -1;
    }
    if (b.isOpen) {
        return 1;
    }
    return 0;
}
function makeRBTree() {
    return new rbtree_1.RBTree(function (a, b) { return a.pos - b.pos; });
}
var xRect = {
    getCentre: function (r) { return r.cx(); },
    getOpen: function (r) { return r.y; },
    getClose: function (r) { return r.Y; },
    getSize: function (r) { return r.width(); },
    makeRect: function (open, close, center, size) { return new Rectangle(center - size / 2, center + size / 2, open, close); },
    findNeighbours: findXNeighbours
};
var yRect = {
    getCentre: function (r) { return r.cy(); },
    getOpen: function (r) { return r.x; },
    getClose: function (r) { return r.X; },
    getSize: function (r) { return r.height(); },
    makeRect: function (open, close, center, size) { return new Rectangle(open, close, center - size / 2, center + size / 2); },
    findNeighbours: findYNeighbours
};
function generateGroupConstraints(root, f, minSep, isContained) {
    if (isContained === void 0) { isContained = false; }
    var padding = root.padding, gn = typeof root.groups !== 'undefined' ? root.groups.length : 0, ln = typeof root.leaves !== 'undefined' ? root.leaves.length : 0, childConstraints = !gn ? []
        : root.groups.reduce(function (ccs, g) { return ccs.concat(generateGroupConstraints(g, f, minSep, true)); }, []), n = (isContained ? 2 : 0) + ln + gn, vs = new Array(n), rs = new Array(n), i = 0, add = function (r, v) { rs[i] = r; vs[i++] = v; };
    if (isContained) {
        var b = root.bounds, c = f.getCentre(b), s = f.getSize(b) / 2, open = f.getOpen(b), close = f.getClose(b), min = c - s + padding / 2, max = c + s - padding / 2;
        root.minVar.desiredPosition = min;
        add(f.makeRect(open, close, min, padding), root.minVar);
        root.maxVar.desiredPosition = max;
        add(f.makeRect(open, close, max, padding), root.maxVar);
    }
    if (ln)
        root.leaves.forEach(function (l) { return add(l.bounds, l.variable); });
    if (gn)
        root.groups.forEach(function (g) {
            var b = g.bounds;
            add(f.makeRect(f.getOpen(b), f.getClose(b), f.getCentre(b), f.getSize(b)), g.minVar);
        });
    var cs = generateConstraints(rs, vs, f, minSep);
    if (gn) {
        vs.forEach(function (v) { v.cOut = [], v.cIn = []; });
        cs.forEach(function (c) { c.left.cOut.push(c), c.right.cIn.push(c); });
        root.groups.forEach(function (g) {
            var gapAdjustment = (g.padding - f.getSize(g.bounds)) / 2;
            g.minVar.cIn.forEach(function (c) { return c.gap += gapAdjustment; });
            g.minVar.cOut.forEach(function (c) { c.left = g.maxVar; c.gap += gapAdjustment; });
        });
    }
    return childConstraints.concat(cs);
}
function generateConstraints(rs, vars, rect, minSep) {
    var i, n = rs.length;
    var N = 2 * n;
    console.assert(vars.length >= n);
    var events = new Array(N);
    for (i = 0; i < n; ++i) {
        var r = rs[i];
        var v = new Node(vars[i], r, rect.getCentre(r));
        events[i] = new Event(true, v, rect.getOpen(r));
        events[i + n] = new Event(false, v, rect.getClose(r));
    }
    events.sort(compareEvents);
    var cs = new Array();
    var scanline = makeRBTree();
    for (i = 0; i < N; ++i) {
        var e = events[i];
        var v = e.v;
        if (e.isOpen) {
            scanline.insert(v);
            rect.findNeighbours(v, scanline);
        }
        else {
            scanline.remove(v);
            var makeConstraint = function (l, r) {
                var sep = (rect.getSize(l.r) + rect.getSize(r.r)) / 2 + minSep;
                cs.push(new vpsc_1.Constraint(l.v, r.v, sep));
            };
            var visitNeighbours = function (forward, reverse, mkcon) {
                var u, it = v[forward].iterator();
                while ((u = it[forward]()) !== null) {
                    mkcon(u, v);
                    u[reverse].remove(v);
                }
            };
            visitNeighbours("prev", "next", function (u, v) { return makeConstraint(u, v); });
            visitNeighbours("next", "prev", function (u, v) { return makeConstraint(v, u); });
        }
    }
    console.assert(scanline.size === 0);
    return cs;
}
function findXNeighbours(v, scanline) {
    var f = function (forward, reverse) {
        var it = scanline.findIter(v);
        var u;
        while ((u = it[forward]()) !== null) {
            var uovervX = u.r.overlapX(v.r);
            if (uovervX <= 0 || uovervX <= u.r.overlapY(v.r)) {
                v[forward].insert(u);
                u[reverse].insert(v);
            }
            if (uovervX <= 0) {
                break;
            }
        }
    };
    f("next", "prev");
    f("prev", "next");
}
function findYNeighbours(v, scanline) {
    var f = function (forward, reverse) {
        var u = scanline.findIter(v)[forward]();
        if (u !== null && u.r.overlapX(v.r) > 0) {
            v[forward].insert(u);
            u[reverse].insert(v);
        }
    };
    f("next", "prev");
    f("prev", "next");
}
function generateXConstraints(rs, vars) {
    return generateConstraints(rs, vars, xRect, 1e-6);
}
exports.generateXConstraints = generateXConstraints;
function generateYConstraints(rs, vars) {
    return generateConstraints(rs, vars, yRect, 1e-6);
}
exports.generateYConstraints = generateYConstraints;
function generateXGroupConstraints(root) {
    return generateGroupConstraints(root, xRect, 1e-6);
}
exports.generateXGroupConstraints = generateXGroupConstraints;
function generateYGroupConstraints(root) {
    return generateGroupConstraints(root, yRect, 1e-6);
}
exports.generateYGroupConstraints = generateYGroupConstraints;
function removeOverlaps(rs) {
    var vs = rs.map(function (r) { return new vpsc_1.Variable(r.cx()); });
    var cs = generateXConstraints(rs, vs);
    var solver = new vpsc_1.Solver(vs, cs);
    solver.solve();
    vs.forEach(function (v, i) { return rs[i].setXCentre(v.position()); });
    vs = rs.map(function (r) { return new vpsc_1.Variable(r.cy()); });
    cs = generateYConstraints(rs, vs);
    solver = new vpsc_1.Solver(vs, cs);
    solver.solve();
    vs.forEach(function (v, i) { return rs[i].setYCentre(v.position()); });
}
exports.removeOverlaps = removeOverlaps;
var IndexedVariable = (function (_super) {
    __extends(IndexedVariable, _super);
    function IndexedVariable(index, w) {
        var _this = _super.call(this, 0, w) || this;
        _this.index = index;
        return _this;
    }
    return IndexedVariable;
}(vpsc_1.Variable));
exports.IndexedVariable = IndexedVariable;
var Projection = (function () {
    function Projection(nodes, groups, rootGroup, constraints, avoidOverlaps) {
        if (rootGroup === void 0) { rootGroup = null; }
        if (constraints === void 0) { constraints = null; }
        if (avoidOverlaps === void 0) { avoidOverlaps = false; }
        var _this = this;
        this.nodes = nodes;
        this.groups = groups;
        this.rootGroup = rootGroup;
        this.avoidOverlaps = avoidOverlaps;
        this.variables = nodes.map(function (v, i) {
            return v.variable = new IndexedVariable(i, 1);
        });
        if (constraints)
            this.createConstraints(constraints);
        if (avoidOverlaps && rootGroup && typeof rootGroup.groups !== 'undefined') {
            nodes.forEach(function (v) {
                if (!v.width || !v.height) {
                    v.bounds = new Rectangle(v.x, v.x, v.y, v.y);
                    return;
                }
                var w2 = v.width / 2, h2 = v.height / 2;
                v.bounds = new Rectangle(v.x - w2, v.x + w2, v.y - h2, v.y + h2);
            });
            computeGroupBounds(rootGroup);
            var i = nodes.length;
            groups.forEach(function (g) {
                _this.variables[i] = g.minVar = new IndexedVariable(i++, typeof g.stiffness !== "undefined" ? g.stiffness : 0.01);
                _this.variables[i] = g.maxVar = new IndexedVariable(i++, typeof g.stiffness !== "undefined" ? g.stiffness : 0.01);
            });
        }
    }
    Projection.prototype.createSeparation = function (c) {
        return new vpsc_1.Constraint(this.nodes[c.left].variable, this.nodes[c.right].variable, c.gap, typeof c.equality !== "undefined" ? c.equality : false);
    };
    Projection.prototype.makeFeasible = function (c) {
        var _this = this;
        if (!this.avoidOverlaps)
            return;
        var axis = 'x', dim = 'width';
        if (c.axis === 'x')
            axis = 'y', dim = 'height';
        var vs = c.offsets.map(function (o) { return _this.nodes[o.node]; }).sort(function (a, b) { return a[axis] - b[axis]; });
        var p = null;
        vs.forEach(function (v) {
            if (p) {
                var nextPos = p[axis] + p[dim];
                if (nextPos > v[axis]) {
                    v[axis] = nextPos;
                }
            }
            p = v;
        });
    };
    Projection.prototype.createAlignment = function (c) {
        var _this = this;
        var u = this.nodes[c.offsets[0].node].variable;
        this.makeFeasible(c);
        var cs = c.axis === 'x' ? this.xConstraints : this.yConstraints;
        c.offsets.slice(1).forEach(function (o) {
            var v = _this.nodes[o.node].variable;
            cs.push(new vpsc_1.Constraint(u, v, o.offset, true));
        });
    };
    Projection.prototype.createConstraints = function (constraints) {
        var _this = this;
        var isSep = function (c) { return typeof c.type === 'undefined' || c.type === 'separation'; };
        this.xConstraints = constraints
            .filter(function (c) { return c.axis === "x" && isSep(c); })
            .map(function (c) { return _this.createSeparation(c); });
        this.yConstraints = constraints
            .filter(function (c) { return c.axis === "y" && isSep(c); })
            .map(function (c) { return _this.createSeparation(c); });
        constraints
            .filter(function (c) { return c.type === 'alignment'; })
            .forEach(function (c) { return _this.createAlignment(c); });
    };
    Projection.prototype.setupVariablesAndBounds = function (x0, y0, desired, getDesired) {
        this.nodes.forEach(function (v, i) {
            if (v.fixed) {
                v.variable.weight = v.fixedWeight ? v.fixedWeight : 1000;
                desired[i] = getDesired(v);
            }
            else {
                v.variable.weight = 1;
            }
            var w = (v.width || 0) / 2, h = (v.height || 0) / 2;
            var ix = x0[i], iy = y0[i];
            v.bounds = new Rectangle(ix - w, ix + w, iy - h, iy + h);
        });
    };
    Projection.prototype.xProject = function (x0, y0, x) {
        if (!this.rootGroup && !(this.avoidOverlaps || this.xConstraints))
            return;
        this.project(x0, y0, x0, x, function (v) { return v.px; }, this.xConstraints, generateXGroupConstraints, function (v) { return v.bounds.setXCentre(x[v.variable.index] = v.variable.position()); }, function (g) {
            var xmin = x[g.minVar.index] = g.minVar.position();
            var xmax = x[g.maxVar.index] = g.maxVar.position();
            var p2 = g.padding / 2;
            g.bounds.x = xmin - p2;
            g.bounds.X = xmax + p2;
        });
    };
    Projection.prototype.yProject = function (x0, y0, y) {
        if (!this.rootGroup && !this.yConstraints)
            return;
        this.project(x0, y0, y0, y, function (v) { return v.py; }, this.yConstraints, generateYGroupConstraints, function (v) { return v.bounds.setYCentre(y[v.variable.index] = v.variable.position()); }, function (g) {
            var ymin = y[g.minVar.index] = g.minVar.position();
            var ymax = y[g.maxVar.index] = g.maxVar.position();
            var p2 = g.padding / 2;
            g.bounds.y = ymin - p2;
            ;
            g.bounds.Y = ymax + p2;
        });
    };
    Projection.prototype.projectFunctions = function () {
        var _this = this;
        return [
            function (x0, y0, x) { return _this.xProject(x0, y0, x); },
            function (x0, y0, y) { return _this.yProject(x0, y0, y); }
        ];
    };
    Projection.prototype.project = function (x0, y0, start, desired, getDesired, cs, generateConstraints, updateNodeBounds, updateGroupBounds) {
        this.setupVariablesAndBounds(x0, y0, desired, getDesired);
        if (this.rootGroup && this.avoidOverlaps) {
            computeGroupBounds(this.rootGroup);
            cs = cs.concat(generateConstraints(this.rootGroup));
        }
        this.solve(this.variables, cs, start, desired);
        this.nodes.forEach(updateNodeBounds);
        if (this.rootGroup && this.avoidOverlaps) {
            this.groups.forEach(updateGroupBounds);
            computeGroupBounds(this.rootGroup);
        }
    };
    Projection.prototype.solve = function (vs, cs, starting, desired) {
        var solver = new vpsc_1.Solver(vs, cs);
        solver.setStartingPositions(starting);
        solver.setDesiredPositions(desired);
        solver.solve();
    };
    return Projection;
}());
exports.Projection = Projection;
//# sourceMappingURL=rectangle.js.map

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var pqueue_1 = __webpack_require__(12);
var Neighbour = (function () {
    function Neighbour(id, distance) {
        this.id = id;
        this.distance = distance;
    }
    return Neighbour;
}());
var Node = (function () {
    function Node(id) {
        this.id = id;
        this.neighbours = [];
    }
    return Node;
}());
var QueueEntry = (function () {
    function QueueEntry(node, prev, d) {
        this.node = node;
        this.prev = prev;
        this.d = d;
    }
    return QueueEntry;
}());
var Calculator = (function () {
    function Calculator(n, es, getSourceIndex, getTargetIndex, getLength) {
        this.n = n;
        this.es = es;
        this.neighbours = new Array(this.n);
        var i = this.n;
        while (i--)
            this.neighbours[i] = new Node(i);
        i = this.es.length;
        while (i--) {
            var e = this.es[i];
            var u = getSourceIndex(e), v = getTargetIndex(e);
            var d = getLength(e);
            this.neighbours[u].neighbours.push(new Neighbour(v, d));
            this.neighbours[v].neighbours.push(new Neighbour(u, d));
        }
    }
    Calculator.prototype.DistanceMatrix = function () {
        var D = new Array(this.n);
        for (var i = 0; i < this.n; ++i) {
            D[i] = this.dijkstraNeighbours(i);
        }
        return D;
    };
    Calculator.prototype.DistancesFromNode = function (start) {
        return this.dijkstraNeighbours(start);
    };
    Calculator.prototype.PathFromNodeToNode = function (start, end) {
        return this.dijkstraNeighbours(start, end);
    };
    Calculator.prototype.PathFromNodeToNodeWithPrevCost = function (start, end, prevCost) {
        var q = new pqueue_1.PriorityQueue(function (a, b) { return a.d <= b.d; }), u = this.neighbours[start], qu = new QueueEntry(u, null, 0), visitedFrom = {};
        q.push(qu);
        while (!q.empty()) {
            qu = q.pop();
            u = qu.node;
            if (u.id === end) {
                break;
            }
            var i = u.neighbours.length;
            while (i--) {
                var neighbour = u.neighbours[i], v = this.neighbours[neighbour.id];
                if (qu.prev && v.id === qu.prev.node.id)
                    continue;
                var viduid = v.id + ',' + u.id;
                if (viduid in visitedFrom && visitedFrom[viduid] <= qu.d)
                    continue;
                var cc = qu.prev ? prevCost(qu.prev.node.id, u.id, v.id) : 0, t = qu.d + neighbour.distance + cc;
                visitedFrom[viduid] = t;
                q.push(new QueueEntry(v, qu, t));
            }
        }
        var path = [];
        while (qu.prev) {
            qu = qu.prev;
            path.push(qu.node.id);
        }
        return path;
    };
    Calculator.prototype.dijkstraNeighbours = function (start, dest) {
        if (dest === void 0) { dest = -1; }
        var q = new pqueue_1.PriorityQueue(function (a, b) { return a.d <= b.d; }), i = this.neighbours.length, d = new Array(i);
        while (i--) {
            var node = this.neighbours[i];
            node.d = i === start ? 0 : Number.POSITIVE_INFINITY;
            node.q = q.push(node);
        }
        while (!q.empty()) {
            var u = q.pop();
            d[u.id] = u.d;
            if (u.id === dest) {
                var path = [];
                var v = u;
                while (typeof v.prev !== 'undefined') {
                    path.push(v.prev.id);
                    v = v.prev;
                }
                return path;
            }
            i = u.neighbours.length;
            while (i--) {
                var neighbour = u.neighbours[i];
                var v = this.neighbours[neighbour.id];
                var t = u.d + neighbour.distance;
                if (u.d !== Number.MAX_VALUE && v.d > t) {
                    v.d = t;
                    v.prev = u;
                    q.reduceKey(v.q, v, function (e, q) { return e.q = q; });
                }
            }
        }
        return d;
    };
    return Calculator;
}());
exports.Calculator = Calculator;
//# sourceMappingURL=shortestpaths.js.map

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Locks = (function () {
    function Locks() {
        this.locks = {};
    }
    Locks.prototype.add = function (id, x) {
        this.locks[id] = x;
    };
    Locks.prototype.clear = function () {
        this.locks = {};
    };
    Locks.prototype.isEmpty = function () {
        for (var l in this.locks)
            return false;
        return true;
    };
    Locks.prototype.apply = function (f) {
        for (var l in this.locks) {
            f(Number(l), this.locks[l]);
        }
    };
    return Locks;
}());
exports.Locks = Locks;
var Descent = (function () {
    function Descent(x, D, G) {
        if (G === void 0) { G = null; }
        this.D = D;
        this.G = G;
        this.threshold = 0.0001;
        this.numGridSnapNodes = 0;
        this.snapGridSize = 100;
        this.snapStrength = 1000;
        this.scaleSnapByMaxH = false;
        this.random = new PseudoRandom();
        this.project = null;
        this.x = x;
        this.k = x.length;
        var n = this.n = x[0].length;
        this.H = new Array(this.k);
        this.g = new Array(this.k);
        this.Hd = new Array(this.k);
        this.a = new Array(this.k);
        this.b = new Array(this.k);
        this.c = new Array(this.k);
        this.d = new Array(this.k);
        this.e = new Array(this.k);
        this.ia = new Array(this.k);
        this.ib = new Array(this.k);
        this.xtmp = new Array(this.k);
        this.locks = new Locks();
        this.minD = Number.MAX_VALUE;
        var i = n, j;
        while (i--) {
            j = n;
            while (--j > i) {
                var d = D[i][j];
                if (d > 0 && d < this.minD) {
                    this.minD = d;
                }
            }
        }
        if (this.minD === Number.MAX_VALUE)
            this.minD = 1;
        i = this.k;
        while (i--) {
            this.g[i] = new Array(n);
            this.H[i] = new Array(n);
            j = n;
            while (j--) {
                this.H[i][j] = new Array(n);
            }
            this.Hd[i] = new Array(n);
            this.a[i] = new Array(n);
            this.b[i] = new Array(n);
            this.c[i] = new Array(n);
            this.d[i] = new Array(n);
            this.e[i] = new Array(n);
            this.ia[i] = new Array(n);
            this.ib[i] = new Array(n);
            this.xtmp[i] = new Array(n);
        }
    }
    Descent.createSquareMatrix = function (n, f) {
        var M = new Array(n);
        for (var i = 0; i < n; ++i) {
            M[i] = new Array(n);
            for (var j = 0; j < n; ++j) {
                M[i][j] = f(i, j);
            }
        }
        return M;
    };
    Descent.prototype.offsetDir = function () {
        var _this = this;
        var u = new Array(this.k);
        var l = 0;
        for (var i = 0; i < this.k; ++i) {
            var x = u[i] = this.random.getNextBetween(0.01, 1) - 0.5;
            l += x * x;
        }
        l = Math.sqrt(l);
        return u.map(function (x) { return x *= _this.minD / l; });
    };
    Descent.prototype.computeDerivatives = function (x) {
        var _this = this;
        var n = this.n;
        if (n < 1)
            return;
        var i;
        var d = new Array(this.k);
        var d2 = new Array(this.k);
        var Huu = new Array(this.k);
        var maxH = 0;
        for (var u = 0; u < n; ++u) {
            for (i = 0; i < this.k; ++i)
                Huu[i] = this.g[i][u] = 0;
            for (var v = 0; v < n; ++v) {
                if (u === v)
                    continue;
                var maxDisplaces = n;
                while (maxDisplaces--) {
                    var sd2 = 0;
                    for (i = 0; i < this.k; ++i) {
                        var dx = d[i] = x[i][u] - x[i][v];
                        sd2 += d2[i] = dx * dx;
                    }
                    if (sd2 > 1e-9)
                        break;
                    var rd = this.offsetDir();
                    for (i = 0; i < this.k; ++i)
                        x[i][v] += rd[i];
                }
                var l = Math.sqrt(sd2);
                var D = this.D[u][v];
                var weight = this.G != null ? this.G[u][v] : 1;
                if (weight > 1 && l > D || !isFinite(D)) {
                    for (i = 0; i < this.k; ++i)
                        this.H[i][u][v] = 0;
                    continue;
                }
                if (weight > 1) {
                    weight = 1;
                }
                var D2 = D * D;
                var gs = 2 * weight * (l - D) / (D2 * l);
                var l3 = l * l * l;
                var hs = 2 * -weight / (D2 * l3);
                if (!isFinite(gs))
                    console.log(gs);
                for (i = 0; i < this.k; ++i) {
                    this.g[i][u] += d[i] * gs;
                    Huu[i] -= this.H[i][u][v] = hs * (l3 + D * (d2[i] - sd2) + l * sd2);
                }
            }
            for (i = 0; i < this.k; ++i)
                maxH = Math.max(maxH, this.H[i][u][u] = Huu[i]);
        }
        var r = this.snapGridSize / 2;
        var g = this.snapGridSize;
        var w = this.snapStrength;
        var k = w / (r * r);
        var numNodes = this.numGridSnapNodes;
        for (var u = 0; u < numNodes; ++u) {
            for (i = 0; i < this.k; ++i) {
                var xiu = this.x[i][u];
                var m = xiu / g;
                var f = m % 1;
                var q = m - f;
                var a = Math.abs(f);
                var dx = (a <= 0.5) ? xiu - q * g :
                    (xiu > 0) ? xiu - (q + 1) * g : xiu - (q - 1) * g;
                if (-r < dx && dx <= r) {
                    if (this.scaleSnapByMaxH) {
                        this.g[i][u] += maxH * k * dx;
                        this.H[i][u][u] += maxH * k;
                    }
                    else {
                        this.g[i][u] += k * dx;
                        this.H[i][u][u] += k;
                    }
                }
            }
        }
        if (!this.locks.isEmpty()) {
            this.locks.apply(function (u, p) {
                for (i = 0; i < _this.k; ++i) {
                    _this.H[i][u][u] += maxH;
                    _this.g[i][u] -= maxH * (p[i] - x[i][u]);
                }
            });
        }
    };
    Descent.dotProd = function (a, b) {
        var x = 0, i = a.length;
        while (i--)
            x += a[i] * b[i];
        return x;
    };
    Descent.rightMultiply = function (m, v, r) {
        var i = m.length;
        while (i--)
            r[i] = Descent.dotProd(m[i], v);
    };
    Descent.prototype.computeStepSize = function (d) {
        var numerator = 0, denominator = 0;
        for (var i = 0; i < this.k; ++i) {
            numerator += Descent.dotProd(this.g[i], d[i]);
            Descent.rightMultiply(this.H[i], d[i], this.Hd[i]);
            denominator += Descent.dotProd(d[i], this.Hd[i]);
        }
        if (denominator === 0 || !isFinite(denominator))
            return 0;
        return 1 * numerator / denominator;
    };
    Descent.prototype.reduceStress = function () {
        this.computeDerivatives(this.x);
        var alpha = this.computeStepSize(this.g);
        for (var i = 0; i < this.k; ++i) {
            this.takeDescentStep(this.x[i], this.g[i], alpha);
        }
        return this.computeStress();
    };
    Descent.copy = function (a, b) {
        var m = a.length, n = b[0].length;
        for (var i = 0; i < m; ++i) {
            for (var j = 0; j < n; ++j) {
                b[i][j] = a[i][j];
            }
        }
    };
    Descent.prototype.stepAndProject = function (x0, r, d, stepSize) {
        Descent.copy(x0, r);
        this.takeDescentStep(r[0], d[0], stepSize);
        if (this.project)
            this.project[0](x0[0], x0[1], r[0]);
        this.takeDescentStep(r[1], d[1], stepSize);
        if (this.project)
            this.project[1](r[0], x0[1], r[1]);
        for (var i = 2; i < this.k; i++)
            this.takeDescentStep(r[i], d[i], stepSize);
    };
    Descent.mApply = function (m, n, f) {
        var i = m;
        while (i-- > 0) {
            var j = n;
            while (j-- > 0)
                f(i, j);
        }
    };
    Descent.prototype.matrixApply = function (f) {
        Descent.mApply(this.k, this.n, f);
    };
    Descent.prototype.computeNextPosition = function (x0, r) {
        var _this = this;
        this.computeDerivatives(x0);
        var alpha = this.computeStepSize(this.g);
        this.stepAndProject(x0, r, this.g, alpha);
        if (this.project) {
            this.matrixApply(function (i, j) { return _this.e[i][j] = x0[i][j] - r[i][j]; });
            var beta = this.computeStepSize(this.e);
            beta = Math.max(0.2, Math.min(beta, 1));
            this.stepAndProject(x0, r, this.e, beta);
        }
    };
    Descent.prototype.run = function (iterations) {
        var stress = Number.MAX_VALUE, converged = false;
        while (!converged && iterations-- > 0) {
            var s = this.rungeKutta();
            converged = Math.abs(stress / s - 1) < this.threshold;
            stress = s;
        }
        return stress;
    };
    Descent.prototype.rungeKutta = function () {
        var _this = this;
        this.computeNextPosition(this.x, this.a);
        Descent.mid(this.x, this.a, this.ia);
        this.computeNextPosition(this.ia, this.b);
        Descent.mid(this.x, this.b, this.ib);
        this.computeNextPosition(this.ib, this.c);
        this.computeNextPosition(this.c, this.d);
        var disp = 0;
        this.matrixApply(function (i, j) {
            var x = (_this.a[i][j] + 2.0 * _this.b[i][j] + 2.0 * _this.c[i][j] + _this.d[i][j]) / 6.0, d = _this.x[i][j] - x;
            disp += d * d;
            _this.x[i][j] = x;
        });
        return disp;
    };
    Descent.mid = function (a, b, m) {
        Descent.mApply(a.length, a[0].length, function (i, j) {
            return m[i][j] = a[i][j] + (b[i][j] - a[i][j]) / 2.0;
        });
    };
    Descent.prototype.takeDescentStep = function (x, d, stepSize) {
        for (var i = 0; i < this.n; ++i) {
            x[i] = x[i] - stepSize * d[i];
        }
    };
    Descent.prototype.computeStress = function () {
        var stress = 0;
        for (var u = 0, nMinus1 = this.n - 1; u < nMinus1; ++u) {
            for (var v = u + 1, n = this.n; v < n; ++v) {
                var l = 0;
                for (var i = 0; i < this.k; ++i) {
                    var dx = this.x[i][u] - this.x[i][v];
                    l += dx * dx;
                }
                l = Math.sqrt(l);
                var d = this.D[u][v];
                if (!isFinite(d))
                    continue;
                var rl = d - l;
                var d2 = d * d;
                stress += rl * rl / d2;
            }
        }
        return stress;
    };
    Descent.zeroDistance = 1e-10;
    return Descent;
}());
exports.Descent = Descent;
var PseudoRandom = (function () {
    function PseudoRandom(seed) {
        if (seed === void 0) { seed = 1; }
        this.seed = seed;
        this.a = 214013;
        this.c = 2531011;
        this.m = 2147483648;
        this.range = 32767;
    }
    PseudoRandom.prototype.getNext = function () {
        this.seed = (this.seed * this.a + this.c) % this.m;
        return (this.seed >> 16) / this.range;
    };
    PseudoRandom.prototype.getNextBetween = function (min, max) {
        return min + this.getNext() * (max - min);
    };
    return PseudoRandom;
}());
exports.PseudoRandom = PseudoRandom;
//# sourceMappingURL=descent.js.map

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function unionCount(a, b) {
    var u = {};
    for (var i in a)
        u[i] = {};
    for (var i in b)
        u[i] = {};
    return Object.keys(u).length;
}
function intersectionCount(a, b) {
    var n = 0;
    for (var i in a)
        if (typeof b[i] !== 'undefined')
            ++n;
    return n;
}
function getNeighbours(links, la) {
    var neighbours = {};
    var addNeighbours = function (u, v) {
        if (typeof neighbours[u] === 'undefined')
            neighbours[u] = {};
        neighbours[u][v] = {};
    };
    links.forEach(function (e) {
        var u = la.getSourceIndex(e), v = la.getTargetIndex(e);
        addNeighbours(u, v);
        addNeighbours(v, u);
    });
    return neighbours;
}
function computeLinkLengths(links, w, f, la) {
    var neighbours = getNeighbours(links, la);
    links.forEach(function (l) {
        var a = neighbours[la.getSourceIndex(l)];
        var b = neighbours[la.getTargetIndex(l)];
        la.setLength(l, 1 + w * f(a, b));
    });
}
function symmetricDiffLinkLengths(links, la, w) {
    if (w === void 0) { w = 1; }
    computeLinkLengths(links, w, function (a, b) { return Math.sqrt(unionCount(a, b) - intersectionCount(a, b)); }, la);
}
exports.symmetricDiffLinkLengths = symmetricDiffLinkLengths;
function jaccardLinkLengths(links, la, w) {
    if (w === void 0) { w = 1; }
    computeLinkLengths(links, w, function (a, b) {
        return Math.min(Object.keys(a).length, Object.keys(b).length) < 1.1 ? 0 : intersectionCount(a, b) / unionCount(a, b);
    }, la);
}
exports.jaccardLinkLengths = jaccardLinkLengths;
function generateDirectedEdgeConstraints(n, links, axis, la) {
    var components = stronglyConnectedComponents(n, links, la);
    var nodes = {};
    components.forEach(function (c, i) {
        return c.forEach(function (v) { return nodes[v] = i; });
    });
    var constraints = [];
    links.forEach(function (l) {
        var ui = la.getSourceIndex(l), vi = la.getTargetIndex(l), u = nodes[ui], v = nodes[vi];
        if (u !== v) {
            constraints.push({
                axis: axis,
                left: ui,
                right: vi,
                gap: la.getMinSeparation(l)
            });
        }
    });
    return constraints;
}
exports.generateDirectedEdgeConstraints = generateDirectedEdgeConstraints;
function stronglyConnectedComponents(numVertices, edges, la) {
    var nodes = [];
    var index = 0;
    var stack = [];
    var components = [];
    function strongConnect(v) {
        v.index = v.lowlink = index++;
        stack.push(v);
        v.onStack = true;
        for (var _i = 0, _a = v.out; _i < _a.length; _i++) {
            var w = _a[_i];
            if (typeof w.index === 'undefined') {
                strongConnect(w);
                v.lowlink = Math.min(v.lowlink, w.lowlink);
            }
            else if (w.onStack) {
                v.lowlink = Math.min(v.lowlink, w.index);
            }
        }
        if (v.lowlink === v.index) {
            var component = [];
            while (stack.length) {
                w = stack.pop();
                w.onStack = false;
                component.push(w);
                if (w === v)
                    break;
            }
            components.push(component.map(function (v) { return v.id; }));
        }
    }
    for (var i = 0; i < numVertices; i++) {
        nodes.push({ id: i, out: [] });
    }
    for (var _i = 0, edges_1 = edges; _i < edges_1.length; _i++) {
        var e = edges_1[_i];
        var v_1 = nodes[la.getSourceIndex(e)], w = nodes[la.getTargetIndex(e)];
        v_1.out.push(w);
    }
    for (var _a = 0, nodes_1 = nodes; _a < nodes_1.length; _a++) {
        var v = nodes_1[_a];
        if (typeof v.index === 'undefined')
            strongConnect(v);
    }
    return components;
}
exports.stronglyConnectedComponents = stronglyConnectedComponents;
//# sourceMappingURL=linklengths.js.map

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var PositionStats = (function () {
    function PositionStats(scale) {
        this.scale = scale;
        this.AB = 0;
        this.AD = 0;
        this.A2 = 0;
    }
    PositionStats.prototype.addVariable = function (v) {
        var ai = this.scale / v.scale;
        var bi = v.offset / v.scale;
        var wi = v.weight;
        this.AB += wi * ai * bi;
        this.AD += wi * ai * v.desiredPosition;
        this.A2 += wi * ai * ai;
    };
    PositionStats.prototype.getPosn = function () {
        return (this.AD - this.AB) / this.A2;
    };
    return PositionStats;
}());
exports.PositionStats = PositionStats;
var Constraint = (function () {
    function Constraint(left, right, gap, equality) {
        if (equality === void 0) { equality = false; }
        this.left = left;
        this.right = right;
        this.gap = gap;
        this.equality = equality;
        this.active = false;
        this.unsatisfiable = false;
        this.left = left;
        this.right = right;
        this.gap = gap;
        this.equality = equality;
    }
    Constraint.prototype.slack = function () {
        return this.unsatisfiable ? Number.MAX_VALUE
            : this.right.scale * this.right.position() - this.gap
                - this.left.scale * this.left.position();
    };
    return Constraint;
}());
exports.Constraint = Constraint;
var Variable = (function () {
    function Variable(desiredPosition, weight, scale) {
        if (weight === void 0) { weight = 1; }
        if (scale === void 0) { scale = 1; }
        this.desiredPosition = desiredPosition;
        this.weight = weight;
        this.scale = scale;
        this.offset = 0;
    }
    Variable.prototype.dfdv = function () {
        return 2.0 * this.weight * (this.position() - this.desiredPosition);
    };
    Variable.prototype.position = function () {
        return (this.block.ps.scale * this.block.posn + this.offset) / this.scale;
    };
    Variable.prototype.visitNeighbours = function (prev, f) {
        var ff = function (c, next) { return c.active && prev !== next && f(c, next); };
        this.cOut.forEach(function (c) { return ff(c, c.right); });
        this.cIn.forEach(function (c) { return ff(c, c.left); });
    };
    return Variable;
}());
exports.Variable = Variable;
var Block = (function () {
    function Block(v) {
        this.vars = [];
        v.offset = 0;
        this.ps = new PositionStats(v.scale);
        this.addVariable(v);
    }
    Block.prototype.addVariable = function (v) {
        v.block = this;
        this.vars.push(v);
        this.ps.addVariable(v);
        this.posn = this.ps.getPosn();
    };
    Block.prototype.updateWeightedPosition = function () {
        this.ps.AB = this.ps.AD = this.ps.A2 = 0;
        for (var i = 0, n = this.vars.length; i < n; ++i)
            this.ps.addVariable(this.vars[i]);
        this.posn = this.ps.getPosn();
    };
    Block.prototype.compute_lm = function (v, u, postAction) {
        var _this = this;
        var dfdv = v.dfdv();
        v.visitNeighbours(u, function (c, next) {
            var _dfdv = _this.compute_lm(next, v, postAction);
            if (next === c.right) {
                dfdv += _dfdv * c.left.scale;
                c.lm = _dfdv;
            }
            else {
                dfdv += _dfdv * c.right.scale;
                c.lm = -_dfdv;
            }
            postAction(c);
        });
        return dfdv / v.scale;
    };
    Block.prototype.populateSplitBlock = function (v, prev) {
        var _this = this;
        v.visitNeighbours(prev, function (c, next) {
            next.offset = v.offset + (next === c.right ? c.gap : -c.gap);
            _this.addVariable(next);
            _this.populateSplitBlock(next, v);
        });
    };
    Block.prototype.traverse = function (visit, acc, v, prev) {
        var _this = this;
        if (v === void 0) { v = this.vars[0]; }
        if (prev === void 0) { prev = null; }
        v.visitNeighbours(prev, function (c, next) {
            acc.push(visit(c));
            _this.traverse(visit, acc, next, v);
        });
    };
    Block.prototype.findMinLM = function () {
        var m = null;
        this.compute_lm(this.vars[0], null, function (c) {
            if (!c.equality && (m === null || c.lm < m.lm))
                m = c;
        });
        return m;
    };
    Block.prototype.findMinLMBetween = function (lv, rv) {
        this.compute_lm(lv, null, function () { });
        var m = null;
        this.findPath(lv, null, rv, function (c, next) {
            if (!c.equality && c.right === next && (m === null || c.lm < m.lm))
                m = c;
        });
        return m;
    };
    Block.prototype.findPath = function (v, prev, to, visit) {
        var _this = this;
        var endFound = false;
        v.visitNeighbours(prev, function (c, next) {
            if (!endFound && (next === to || _this.findPath(next, v, to, visit))) {
                endFound = true;
                visit(c, next);
            }
        });
        return endFound;
    };
    Block.prototype.isActiveDirectedPathBetween = function (u, v) {
        if (u === v)
            return true;
        var i = u.cOut.length;
        while (i--) {
            var c = u.cOut[i];
            if (c.active && this.isActiveDirectedPathBetween(c.right, v))
                return true;
        }
        return false;
    };
    Block.split = function (c) {
        c.active = false;
        return [Block.createSplitBlock(c.left), Block.createSplitBlock(c.right)];
    };
    Block.createSplitBlock = function (startVar) {
        var b = new Block(startVar);
        b.populateSplitBlock(startVar, null);
        return b;
    };
    Block.prototype.splitBetween = function (vl, vr) {
        var c = this.findMinLMBetween(vl, vr);
        if (c !== null) {
            var bs = Block.split(c);
            return { constraint: c, lb: bs[0], rb: bs[1] };
        }
        return null;
    };
    Block.prototype.mergeAcross = function (b, c, dist) {
        c.active = true;
        for (var i = 0, n = b.vars.length; i < n; ++i) {
            var v = b.vars[i];
            v.offset += dist;
            this.addVariable(v);
        }
        this.posn = this.ps.getPosn();
    };
    Block.prototype.cost = function () {
        var sum = 0, i = this.vars.length;
        while (i--) {
            var v = this.vars[i], d = v.position() - v.desiredPosition;
            sum += d * d * v.weight;
        }
        return sum;
    };
    return Block;
}());
exports.Block = Block;
var Blocks = (function () {
    function Blocks(vs) {
        this.vs = vs;
        var n = vs.length;
        this.list = new Array(n);
        while (n--) {
            var b = new Block(vs[n]);
            this.list[n] = b;
            b.blockInd = n;
        }
    }
    Blocks.prototype.cost = function () {
        var sum = 0, i = this.list.length;
        while (i--)
            sum += this.list[i].cost();
        return sum;
    };
    Blocks.prototype.insert = function (b) {
        b.blockInd = this.list.length;
        this.list.push(b);
    };
    Blocks.prototype.remove = function (b) {
        var last = this.list.length - 1;
        var swapBlock = this.list[last];
        this.list.length = last;
        if (b !== swapBlock) {
            this.list[b.blockInd] = swapBlock;
            swapBlock.blockInd = b.blockInd;
        }
    };
    Blocks.prototype.merge = function (c) {
        var l = c.left.block, r = c.right.block;
        var dist = c.right.offset - c.left.offset - c.gap;
        if (l.vars.length < r.vars.length) {
            r.mergeAcross(l, c, dist);
            this.remove(l);
        }
        else {
            l.mergeAcross(r, c, -dist);
            this.remove(r);
        }
    };
    Blocks.prototype.forEach = function (f) {
        this.list.forEach(f);
    };
    Blocks.prototype.updateBlockPositions = function () {
        this.list.forEach(function (b) { return b.updateWeightedPosition(); });
    };
    Blocks.prototype.split = function (inactive) {
        var _this = this;
        this.updateBlockPositions();
        this.list.forEach(function (b) {
            var v = b.findMinLM();
            if (v !== null && v.lm < Solver.LAGRANGIAN_TOLERANCE) {
                b = v.left.block;
                Block.split(v).forEach(function (nb) { return _this.insert(nb); });
                _this.remove(b);
                inactive.push(v);
            }
        });
    };
    return Blocks;
}());
exports.Blocks = Blocks;
var Solver = (function () {
    function Solver(vs, cs) {
        this.vs = vs;
        this.cs = cs;
        this.vs = vs;
        vs.forEach(function (v) {
            v.cIn = [], v.cOut = [];
        });
        this.cs = cs;
        cs.forEach(function (c) {
            c.left.cOut.push(c);
            c.right.cIn.push(c);
        });
        this.inactive = cs.map(function (c) { c.active = false; return c; });
        this.bs = null;
    }
    Solver.prototype.cost = function () {
        return this.bs.cost();
    };
    Solver.prototype.setStartingPositions = function (ps) {
        this.inactive = this.cs.map(function (c) { c.active = false; return c; });
        this.bs = new Blocks(this.vs);
        this.bs.forEach(function (b, i) { return b.posn = ps[i]; });
    };
    Solver.prototype.setDesiredPositions = function (ps) {
        this.vs.forEach(function (v, i) { return v.desiredPosition = ps[i]; });
    };
    Solver.prototype.mostViolated = function () {
        var minSlack = Number.MAX_VALUE, v = null, l = this.inactive, n = l.length, deletePoint = n;
        for (var i = 0; i < n; ++i) {
            var c = l[i];
            if (c.unsatisfiable)
                continue;
            var slack = c.slack();
            if (c.equality || slack < minSlack) {
                minSlack = slack;
                v = c;
                deletePoint = i;
                if (c.equality)
                    break;
            }
        }
        if (deletePoint !== n &&
            (minSlack < Solver.ZERO_UPPERBOUND && !v.active || v.equality)) {
            l[deletePoint] = l[n - 1];
            l.length = n - 1;
        }
        return v;
    };
    Solver.prototype.satisfy = function () {
        if (this.bs == null) {
            this.bs = new Blocks(this.vs);
        }
        this.bs.split(this.inactive);
        var v = null;
        while ((v = this.mostViolated()) && (v.equality || v.slack() < Solver.ZERO_UPPERBOUND && !v.active)) {
            var lb = v.left.block, rb = v.right.block;
            if (lb !== rb) {
                this.bs.merge(v);
            }
            else {
                if (lb.isActiveDirectedPathBetween(v.right, v.left)) {
                    v.unsatisfiable = true;
                    continue;
                }
                var split = lb.splitBetween(v.left, v.right);
                if (split !== null) {
                    this.bs.insert(split.lb);
                    this.bs.insert(split.rb);
                    this.bs.remove(lb);
                    this.inactive.push(split.constraint);
                }
                else {
                    v.unsatisfiable = true;
                    continue;
                }
                if (v.slack() >= 0) {
                    this.inactive.push(v);
                }
                else {
                    this.bs.merge(v);
                }
            }
        }
    };
    Solver.prototype.solve = function () {
        this.satisfy();
        var lastcost = Number.MAX_VALUE, cost = this.bs.cost();
        while (Math.abs(lastcost - cost) > 0.0001) {
            this.satisfy();
            lastcost = cost;
            cost = this.bs.cost();
        }
        return cost;
    };
    Solver.LAGRANGIAN_TOLERANCE = -1e-4;
    Solver.ZERO_UPPERBOUND = -1e-10;
    return Solver;
}());
exports.Solver = Solver;
function removeOverlapInOneDimension(spans, lowerBound, upperBound) {
    var vs = spans.map(function (s) { return new Variable(s.desiredCenter); });
    var cs = [];
    var n = spans.length;
    for (var i = 0; i < n - 1; i++) {
        var left = spans[i], right = spans[i + 1];
        cs.push(new Constraint(vs[i], vs[i + 1], (left.size + right.size) / 2));
    }
    var leftMost = vs[0], rightMost = vs[n - 1], leftMostSize = spans[0].size / 2, rightMostSize = spans[n - 1].size / 2;
    var vLower = null, vUpper = null;
    if (lowerBound) {
        vLower = new Variable(lowerBound, leftMost.weight * 1000);
        vs.push(vLower);
        cs.push(new Constraint(vLower, leftMost, leftMostSize));
    }
    if (upperBound) {
        vUpper = new Variable(upperBound, rightMost.weight * 1000);
        vs.push(vUpper);
        cs.push(new Constraint(rightMost, vUpper, rightMostSize));
    }
    var solver = new Solver(vs, cs);
    solver.solve();
    return {
        newCenters: vs.slice(0, spans.length).map(function (v) { return v.position(); }),
        lowerBound: vLower ? vLower.position() : leftMost.position() - leftMostSize,
        upperBound: vUpper ? vUpper.position() : rightMost.position() + rightMostSize
    };
}
exports.removeOverlapInOneDimension = removeOverlapInOneDimension;
//# sourceMappingURL=vpsc.js.map

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var rectangle_1 = __webpack_require__(3);
var Point = (function () {
    function Point() {
    }
    return Point;
}());
exports.Point = Point;
var LineSegment = (function () {
    function LineSegment(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
    return LineSegment;
}());
exports.LineSegment = LineSegment;
var PolyPoint = (function (_super) {
    __extends(PolyPoint, _super);
    function PolyPoint() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PolyPoint;
}(Point));
exports.PolyPoint = PolyPoint;
function isLeft(P0, P1, P2) {
    return (P1.x - P0.x) * (P2.y - P0.y) - (P2.x - P0.x) * (P1.y - P0.y);
}
exports.isLeft = isLeft;
function above(p, vi, vj) {
    return isLeft(p, vi, vj) > 0;
}
function below(p, vi, vj) {
    return isLeft(p, vi, vj) < 0;
}
function ConvexHull(S) {
    var P = S.slice(0).sort(function (a, b) { return a.x !== b.x ? b.x - a.x : b.y - a.y; });
    var n = S.length, i;
    var minmin = 0;
    var xmin = P[0].x;
    for (i = 1; i < n; ++i) {
        if (P[i].x !== xmin)
            break;
    }
    var minmax = i - 1;
    var H = [];
    H.push(P[minmin]);
    if (minmax === n - 1) {
        if (P[minmax].y !== P[minmin].y)
            H.push(P[minmax]);
    }
    else {
        var maxmin, maxmax = n - 1;
        var xmax = P[n - 1].x;
        for (i = n - 2; i >= 0; i--)
            if (P[i].x !== xmax)
                break;
        maxmin = i + 1;
        i = minmax;
        while (++i <= maxmin) {
            if (isLeft(P[minmin], P[maxmin], P[i]) >= 0 && i < maxmin)
                continue;
            while (H.length > 1) {
                if (isLeft(H[H.length - 2], H[H.length - 1], P[i]) > 0)
                    break;
                else
                    H.length -= 1;
            }
            if (i != minmin)
                H.push(P[i]);
        }
        if (maxmax != maxmin)
            H.push(P[maxmax]);
        var bot = H.length;
        i = maxmin;
        while (--i >= minmax) {
            if (isLeft(P[maxmax], P[minmax], P[i]) >= 0 && i > minmax)
                continue;
            while (H.length > bot) {
                if (isLeft(H[H.length - 2], H[H.length - 1], P[i]) > 0)
                    break;
                else
                    H.length -= 1;
            }
            if (i != minmin)
                H.push(P[i]);
        }
    }
    return H;
}
exports.ConvexHull = ConvexHull;
function clockwiseRadialSweep(p, P, f) {
    P.slice(0).sort(function (a, b) { return Math.atan2(a.y - p.y, a.x - p.x) - Math.atan2(b.y - p.y, b.x - p.x); }).forEach(f);
}
exports.clockwiseRadialSweep = clockwiseRadialSweep;
function nextPolyPoint(p, ps) {
    if (p.polyIndex === ps.length - 1)
        return ps[0];
    return ps[p.polyIndex + 1];
}
function prevPolyPoint(p, ps) {
    if (p.polyIndex === 0)
        return ps[ps.length - 1];
    return ps[p.polyIndex - 1];
}
function tangent_PointPolyC(P, V) {
    var Vclosed = V.slice(0);
    Vclosed.push(V[0]);
    return { rtan: Rtangent_PointPolyC(P, Vclosed), ltan: Ltangent_PointPolyC(P, Vclosed) };
}
function Rtangent_PointPolyC(P, V) {
    var n = V.length - 1;
    var a, b, c;
    var upA, dnC;
    if (below(P, V[1], V[0]) && !above(P, V[n - 1], V[0]))
        return 0;
    for (a = 0, b = n;;) {
        if (b - a === 1)
            if (above(P, V[a], V[b]))
                return a;
            else
                return b;
        c = Math.floor((a + b) / 2);
        dnC = below(P, V[c + 1], V[c]);
        if (dnC && !above(P, V[c - 1], V[c]))
            return c;
        upA = above(P, V[a + 1], V[a]);
        if (upA) {
            if (dnC)
                b = c;
            else {
                if (above(P, V[a], V[c]))
                    b = c;
                else
                    a = c;
            }
        }
        else {
            if (!dnC)
                a = c;
            else {
                if (below(P, V[a], V[c]))
                    b = c;
                else
                    a = c;
            }
        }
    }
}
function Ltangent_PointPolyC(P, V) {
    var n = V.length - 1;
    var a, b, c;
    var dnA, dnC;
    if (above(P, V[n - 1], V[0]) && !below(P, V[1], V[0]))
        return 0;
    for (a = 0, b = n;;) {
        if (b - a === 1)
            if (below(P, V[a], V[b]))
                return a;
            else
                return b;
        c = Math.floor((a + b) / 2);
        dnC = below(P, V[c + 1], V[c]);
        if (above(P, V[c - 1], V[c]) && !dnC)
            return c;
        dnA = below(P, V[a + 1], V[a]);
        if (dnA) {
            if (!dnC)
                b = c;
            else {
                if (below(P, V[a], V[c]))
                    b = c;
                else
                    a = c;
            }
        }
        else {
            if (dnC)
                a = c;
            else {
                if (above(P, V[a], V[c]))
                    b = c;
                else
                    a = c;
            }
        }
    }
}
function tangent_PolyPolyC(V, W, t1, t2, cmp1, cmp2) {
    var ix1, ix2;
    ix1 = t1(W[0], V);
    ix2 = t2(V[ix1], W);
    var done = false;
    while (!done) {
        done = true;
        while (true) {
            if (ix1 === V.length - 1)
                ix1 = 0;
            if (cmp1(W[ix2], V[ix1], V[ix1 + 1]))
                break;
            ++ix1;
        }
        while (true) {
            if (ix2 === 0)
                ix2 = W.length - 1;
            if (cmp2(V[ix1], W[ix2], W[ix2 - 1]))
                break;
            --ix2;
            done = false;
        }
    }
    return { t1: ix1, t2: ix2 };
}
exports.tangent_PolyPolyC = tangent_PolyPolyC;
function LRtangent_PolyPolyC(V, W) {
    var rl = RLtangent_PolyPolyC(W, V);
    return { t1: rl.t2, t2: rl.t1 };
}
exports.LRtangent_PolyPolyC = LRtangent_PolyPolyC;
function RLtangent_PolyPolyC(V, W) {
    return tangent_PolyPolyC(V, W, Rtangent_PointPolyC, Ltangent_PointPolyC, above, below);
}
exports.RLtangent_PolyPolyC = RLtangent_PolyPolyC;
function LLtangent_PolyPolyC(V, W) {
    return tangent_PolyPolyC(V, W, Ltangent_PointPolyC, Ltangent_PointPolyC, below, below);
}
exports.LLtangent_PolyPolyC = LLtangent_PolyPolyC;
function RRtangent_PolyPolyC(V, W) {
    return tangent_PolyPolyC(V, W, Rtangent_PointPolyC, Rtangent_PointPolyC, above, above);
}
exports.RRtangent_PolyPolyC = RRtangent_PolyPolyC;
var BiTangent = (function () {
    function BiTangent(t1, t2) {
        this.t1 = t1;
        this.t2 = t2;
    }
    return BiTangent;
}());
exports.BiTangent = BiTangent;
var BiTangents = (function () {
    function BiTangents() {
    }
    return BiTangents;
}());
exports.BiTangents = BiTangents;
var TVGPoint = (function (_super) {
    __extends(TVGPoint, _super);
    function TVGPoint() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return TVGPoint;
}(Point));
exports.TVGPoint = TVGPoint;
var VisibilityVertex = (function () {
    function VisibilityVertex(id, polyid, polyvertid, p) {
        this.id = id;
        this.polyid = polyid;
        this.polyvertid = polyvertid;
        this.p = p;
        p.vv = this;
    }
    return VisibilityVertex;
}());
exports.VisibilityVertex = VisibilityVertex;
var VisibilityEdge = (function () {
    function VisibilityEdge(source, target) {
        this.source = source;
        this.target = target;
    }
    VisibilityEdge.prototype.length = function () {
        var dx = this.source.p.x - this.target.p.x;
        var dy = this.source.p.y - this.target.p.y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    return VisibilityEdge;
}());
exports.VisibilityEdge = VisibilityEdge;
var TangentVisibilityGraph = (function () {
    function TangentVisibilityGraph(P, g0) {
        this.P = P;
        this.V = [];
        this.E = [];
        if (!g0) {
            var n = P.length;
            for (var i = 0; i < n; i++) {
                var p = P[i];
                for (var j = 0; j < p.length; ++j) {
                    var pj = p[j], vv = new VisibilityVertex(this.V.length, i, j, pj);
                    this.V.push(vv);
                    if (j > 0)
                        this.E.push(new VisibilityEdge(p[j - 1].vv, vv));
                }
                if (p.length > 1)
                    this.E.push(new VisibilityEdge(p[0].vv, p[p.length - 1].vv));
            }
            for (var i = 0; i < n - 1; i++) {
                var Pi = P[i];
                for (var j = i + 1; j < n; j++) {
                    var Pj = P[j], t = tangents(Pi, Pj);
                    for (var q in t) {
                        var c = t[q], source = Pi[c.t1], target = Pj[c.t2];
                        this.addEdgeIfVisible(source, target, i, j);
                    }
                }
            }
        }
        else {
            this.V = g0.V.slice(0);
            this.E = g0.E.slice(0);
        }
    }
    TangentVisibilityGraph.prototype.addEdgeIfVisible = function (u, v, i1, i2) {
        if (!this.intersectsPolys(new LineSegment(u.x, u.y, v.x, v.y), i1, i2)) {
            this.E.push(new VisibilityEdge(u.vv, v.vv));
        }
    };
    TangentVisibilityGraph.prototype.addPoint = function (p, i1) {
        var n = this.P.length;
        this.V.push(new VisibilityVertex(this.V.length, n, 0, p));
        for (var i = 0; i < n; ++i) {
            if (i === i1)
                continue;
            var poly = this.P[i], t = tangent_PointPolyC(p, poly);
            this.addEdgeIfVisible(p, poly[t.ltan], i1, i);
            this.addEdgeIfVisible(p, poly[t.rtan], i1, i);
        }
        return p.vv;
    };
    TangentVisibilityGraph.prototype.intersectsPolys = function (l, i1, i2) {
        for (var i = 0, n = this.P.length; i < n; ++i) {
            if (i != i1 && i != i2 && intersects(l, this.P[i]).length > 0) {
                return true;
            }
        }
        return false;
    };
    return TangentVisibilityGraph;
}());
exports.TangentVisibilityGraph = TangentVisibilityGraph;
function intersects(l, P) {
    var ints = [];
    for (var i = 1, n = P.length; i < n; ++i) {
        var int = rectangle_1.Rectangle.lineIntersection(l.x1, l.y1, l.x2, l.y2, P[i - 1].x, P[i - 1].y, P[i].x, P[i].y);
        if (int)
            ints.push(int);
    }
    return ints;
}
function tangents(V, W) {
    var m = V.length - 1, n = W.length - 1;
    var bt = new BiTangents();
    for (var i = 0; i < m; ++i) {
        for (var j = 0; j < n; ++j) {
            var v1 = V[i == 0 ? m - 1 : i - 1];
            var v2 = V[i];
            var v3 = V[i + 1];
            var w1 = W[j == 0 ? n - 1 : j - 1];
            var w2 = W[j];
            var w3 = W[j + 1];
            var v1v2w2 = isLeft(v1, v2, w2);
            var v2w1w2 = isLeft(v2, w1, w2);
            var v2w2w3 = isLeft(v2, w2, w3);
            var w1w2v2 = isLeft(w1, w2, v2);
            var w2v1v2 = isLeft(w2, v1, v2);
            var w2v2v3 = isLeft(w2, v2, v3);
            if (v1v2w2 >= 0 && v2w1w2 >= 0 && v2w2w3 < 0
                && w1w2v2 >= 0 && w2v1v2 >= 0 && w2v2v3 < 0) {
                bt.ll = new BiTangent(i, j);
            }
            else if (v1v2w2 <= 0 && v2w1w2 <= 0 && v2w2w3 > 0
                && w1w2v2 <= 0 && w2v1v2 <= 0 && w2v2v3 > 0) {
                bt.rr = new BiTangent(i, j);
            }
            else if (v1v2w2 <= 0 && v2w1w2 > 0 && v2w2w3 <= 0
                && w1w2v2 >= 0 && w2v1v2 < 0 && w2v2v3 >= 0) {
                bt.rl = new BiTangent(i, j);
            }
            else if (v1v2w2 >= 0 && v2w1w2 < 0 && v2w2w3 >= 0
                && w1w2v2 <= 0 && w2v1v2 > 0 && w2v2v3 <= 0) {
                bt.lr = new BiTangent(i, j);
            }
        }
    }
    return bt;
}
exports.tangents = tangents;
function isPointInsidePoly(p, poly) {
    for (var i = 1, n = poly.length; i < n; ++i)
        if (below(poly[i - 1], poly[i], p))
            return false;
    return true;
}
function isAnyPInQ(p, q) {
    return !p.every(function (v) { return !isPointInsidePoly(v, q); });
}
function polysOverlap(p, q) {
    if (isAnyPInQ(p, q))
        return true;
    if (isAnyPInQ(q, p))
        return true;
    for (var i = 1, n = p.length; i < n; ++i) {
        var v = p[i], u = p[i - 1];
        if (intersects(new LineSegment(u.x, u.y, v.x, v.y), q).length > 0)
            return true;
    }
    return false;
}
exports.polysOverlap = polysOverlap;
//# sourceMappingURL=geom.js.map

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var rectangle_1 = __webpack_require__(3);
var vpsc_1 = __webpack_require__(7);
var shortestpaths_1 = __webpack_require__(4);
var NodeWrapper = (function () {
    function NodeWrapper(id, rect, children) {
        this.id = id;
        this.rect = rect;
        this.children = children;
        this.leaf = typeof children === 'undefined' || children.length === 0;
    }
    return NodeWrapper;
}());
exports.NodeWrapper = NodeWrapper;
var Vert = (function () {
    function Vert(id, x, y, node, line) {
        if (node === void 0) { node = null; }
        if (line === void 0) { line = null; }
        this.id = id;
        this.x = x;
        this.y = y;
        this.node = node;
        this.line = line;
    }
    return Vert;
}());
exports.Vert = Vert;
var LongestCommonSubsequence = (function () {
    function LongestCommonSubsequence(s, t) {
        this.s = s;
        this.t = t;
        var mf = LongestCommonSubsequence.findMatch(s, t);
        var tr = t.slice(0).reverse();
        var mr = LongestCommonSubsequence.findMatch(s, tr);
        if (mf.length >= mr.length) {
            this.length = mf.length;
            this.si = mf.si;
            this.ti = mf.ti;
            this.reversed = false;
        }
        else {
            this.length = mr.length;
            this.si = mr.si;
            this.ti = t.length - mr.ti - mr.length;
            this.reversed = true;
        }
    }
    LongestCommonSubsequence.findMatch = function (s, t) {
        var m = s.length;
        var n = t.length;
        var match = { length: 0, si: -1, ti: -1 };
        var l = new Array(m);
        for (var i = 0; i < m; i++) {
            l[i] = new Array(n);
            for (var j = 0; j < n; j++)
                if (s[i] === t[j]) {
                    var v = l[i][j] = (i === 0 || j === 0) ? 1 : l[i - 1][j - 1] + 1;
                    if (v > match.length) {
                        match.length = v;
                        match.si = i - v + 1;
                        match.ti = j - v + 1;
                    }
                    ;
                }
                else
                    l[i][j] = 0;
        }
        return match;
    };
    LongestCommonSubsequence.prototype.getSequence = function () {
        return this.length >= 0 ? this.s.slice(this.si, this.si + this.length) : [];
    };
    return LongestCommonSubsequence;
}());
exports.LongestCommonSubsequence = LongestCommonSubsequence;
var GridRouter = (function () {
    function GridRouter(originalnodes, accessor, groupPadding) {
        if (groupPadding === void 0) { groupPadding = 12; }
        var _this = this;
        this.originalnodes = originalnodes;
        this.groupPadding = groupPadding;
        this.leaves = null;
        this.nodes = originalnodes.map(function (v, i) { return new NodeWrapper(i, accessor.getBounds(v), accessor.getChildren(v)); });
        this.leaves = this.nodes.filter(function (v) { return v.leaf; });
        this.groups = this.nodes.filter(function (g) { return !g.leaf; });
        this.cols = this.getGridLines('x');
        this.rows = this.getGridLines('y');
        this.groups.forEach(function (v) {
            return v.children.forEach(function (c) { return _this.nodes[c].parent = v; });
        });
        this.root = { children: [] };
        this.nodes.forEach(function (v) {
            if (typeof v.parent === 'undefined') {
                v.parent = _this.root;
                _this.root.children.push(v.id);
            }
            v.ports = [];
        });
        this.backToFront = this.nodes.slice(0);
        this.backToFront.sort(function (x, y) { return _this.getDepth(x) - _this.getDepth(y); });
        var frontToBackGroups = this.backToFront.slice(0).reverse().filter(function (g) { return !g.leaf; });
        frontToBackGroups.forEach(function (v) {
            var r = rectangle_1.Rectangle.empty();
            v.children.forEach(function (c) { return r = r.union(_this.nodes[c].rect); });
            v.rect = r.inflate(_this.groupPadding);
        });
        var colMids = this.midPoints(this.cols.map(function (r) { return r.pos; }));
        var rowMids = this.midPoints(this.rows.map(function (r) { return r.pos; }));
        var rowx = colMids[0], rowX = colMids[colMids.length - 1];
        var coly = rowMids[0], colY = rowMids[rowMids.length - 1];
        var hlines = this.rows.map(function (r) { return ({ x1: rowx, x2: rowX, y1: r.pos, y2: r.pos }); })
            .concat(rowMids.map(function (m) { return ({ x1: rowx, x2: rowX, y1: m, y2: m }); }));
        var vlines = this.cols.map(function (c) { return ({ x1: c.pos, x2: c.pos, y1: coly, y2: colY }); })
            .concat(colMids.map(function (m) { return ({ x1: m, x2: m, y1: coly, y2: colY }); }));
        var lines = hlines.concat(vlines);
        lines.forEach(function (l) { return l.verts = []; });
        this.verts = [];
        this.edges = [];
        hlines.forEach(function (h) {
            return vlines.forEach(function (v) {
                var p = new Vert(_this.verts.length, v.x1, h.y1);
                h.verts.push(p);
                v.verts.push(p);
                _this.verts.push(p);
                var i = _this.backToFront.length;
                while (i-- > 0) {
                    var node = _this.backToFront[i], r = node.rect;
                    var dx = Math.abs(p.x - r.cx()), dy = Math.abs(p.y - r.cy());
                    if (dx < r.width() / 2 && dy < r.height() / 2) {
                        p.node = node;
                        break;
                    }
                }
            });
        });
        lines.forEach(function (l, li) {
            _this.nodes.forEach(function (v, i) {
                v.rect.lineIntersections(l.x1, l.y1, l.x2, l.y2).forEach(function (intersect, j) {
                    var p = new Vert(_this.verts.length, intersect.x, intersect.y, v, l);
                    _this.verts.push(p);
                    l.verts.push(p);
                    v.ports.push(p);
                });
            });
            var isHoriz = Math.abs(l.y1 - l.y2) < 0.1;
            var delta = function (a, b) { return isHoriz ? b.x - a.x : b.y - a.y; };
            l.verts.sort(delta);
            for (var i = 1; i < l.verts.length; i++) {
                var u = l.verts[i - 1], v = l.verts[i];
                if (u.node && u.node === v.node && u.node.leaf)
                    continue;
                _this.edges.push({ source: u.id, target: v.id, length: Math.abs(delta(u, v)) });
            }
        });
    }
    GridRouter.prototype.avg = function (a) { return a.reduce(function (x, y) { return x + y; }) / a.length; };
    GridRouter.prototype.getGridLines = function (axis) {
        var columns = [];
        var ls = this.leaves.slice(0, this.leaves.length);
        while (ls.length > 0) {
            var overlapping = ls.filter(function (v) { return v.rect['overlap' + axis.toUpperCase()](ls[0].rect); });
            var col = {
                nodes: overlapping,
                pos: this.avg(overlapping.map(function (v) { return v.rect['c' + axis](); }))
            };
            columns.push(col);
            col.nodes.forEach(function (v) { return ls.splice(ls.indexOf(v), 1); });
        }
        columns.sort(function (a, b) { return a.pos - b.pos; });
        return columns;
    };
    GridRouter.prototype.getDepth = function (v) {
        var depth = 0;
        while (v.parent !== this.root) {
            depth++;
            v = v.parent;
        }
        return depth;
    };
    GridRouter.prototype.midPoints = function (a) {
        var gap = a[1] - a[0];
        var mids = [a[0] - gap / 2];
        for (var i = 1; i < a.length; i++) {
            mids.push((a[i] + a[i - 1]) / 2);
        }
        mids.push(a[a.length - 1] + gap / 2);
        return mids;
    };
    GridRouter.prototype.findLineage = function (v) {
        var lineage = [v];
        do {
            v = v.parent;
            lineage.push(v);
        } while (v !== this.root);
        return lineage.reverse();
    };
    GridRouter.prototype.findAncestorPathBetween = function (a, b) {
        var aa = this.findLineage(a), ba = this.findLineage(b), i = 0;
        while (aa[i] === ba[i])
            i++;
        return { commonAncestor: aa[i - 1], lineages: aa.slice(i).concat(ba.slice(i)) };
    };
    GridRouter.prototype.siblingObstacles = function (a, b) {
        var _this = this;
        var path = this.findAncestorPathBetween(a, b);
        var lineageLookup = {};
        path.lineages.forEach(function (v) { return lineageLookup[v.id] = {}; });
        var obstacles = path.commonAncestor.children.filter(function (v) { return !(v in lineageLookup); });
        path.lineages
            .filter(function (v) { return v.parent !== path.commonAncestor; })
            .forEach(function (v) { return obstacles = obstacles.concat(v.parent.children.filter(function (c) { return c !== v.id; })); });
        return obstacles.map(function (v) { return _this.nodes[v]; });
    };
    GridRouter.getSegmentSets = function (routes, x, y) {
        var vsegments = [];
        for (var ei = 0; ei < routes.length; ei++) {
            var route = routes[ei];
            for (var si = 0; si < route.length; si++) {
                var s = route[si];
                s.edgeid = ei;
                s.i = si;
                var sdx = s[1][x] - s[0][x];
                if (Math.abs(sdx) < 0.1) {
                    vsegments.push(s);
                }
            }
        }
        vsegments.sort(function (a, b) { return a[0][x] - b[0][x]; });
        var vsegmentsets = [];
        var segmentset = null;
        for (var i = 0; i < vsegments.length; i++) {
            var s = vsegments[i];
            if (!segmentset || Math.abs(s[0][x] - segmentset.pos) > 0.1) {
                segmentset = { pos: s[0][x], segments: [] };
                vsegmentsets.push(segmentset);
            }
            segmentset.segments.push(s);
        }
        return vsegmentsets;
    };
    GridRouter.nudgeSegs = function (x, y, routes, segments, leftOf, gap) {
        var n = segments.length;
        if (n <= 1)
            return;
        var vs = segments.map(function (s) { return new vpsc_1.Variable(s[0][x]); });
        var cs = [];
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                if (i === j)
                    continue;
                var s1 = segments[i], s2 = segments[j], e1 = s1.edgeid, e2 = s2.edgeid, lind = -1, rind = -1;
                if (x == 'x') {
                    if (leftOf(e1, e2)) {
                        if (s1[0][y] < s1[1][y]) {
                            lind = j, rind = i;
                        }
                        else {
                            lind = i, rind = j;
                        }
                    }
                }
                else {
                    if (leftOf(e1, e2)) {
                        if (s1[0][y] < s1[1][y]) {
                            lind = i, rind = j;
                        }
                        else {
                            lind = j, rind = i;
                        }
                    }
                }
                if (lind >= 0) {
                    cs.push(new vpsc_1.Constraint(vs[lind], vs[rind], gap));
                }
            }
        }
        var solver = new vpsc_1.Solver(vs, cs);
        solver.solve();
        vs.forEach(function (v, i) {
            var s = segments[i];
            var pos = v.position();
            s[0][x] = s[1][x] = pos;
            var route = routes[s.edgeid];
            if (s.i > 0)
                route[s.i - 1][1][x] = pos;
            if (s.i < route.length - 1)
                route[s.i + 1][0][x] = pos;
        });
    };
    GridRouter.nudgeSegments = function (routes, x, y, leftOf, gap) {
        var vsegmentsets = GridRouter.getSegmentSets(routes, x, y);
        for (var i = 0; i < vsegmentsets.length; i++) {
            var ss = vsegmentsets[i];
            var events = [];
            for (var j = 0; j < ss.segments.length; j++) {
                var s = ss.segments[j];
                events.push({ type: 0, s: s, pos: Math.min(s[0][y], s[1][y]) });
                events.push({ type: 1, s: s, pos: Math.max(s[0][y], s[1][y]) });
            }
            events.sort(function (a, b) { return a.pos - b.pos + a.type - b.type; });
            var open = [];
            var openCount = 0;
            events.forEach(function (e) {
                if (e.type === 0) {
                    open.push(e.s);
                    openCount++;
                }
                else {
                    openCount--;
                }
                if (openCount == 0) {
                    GridRouter.nudgeSegs(x, y, routes, open, leftOf, gap);
                    open = [];
                }
            });
        }
    };
    GridRouter.prototype.routeEdges = function (edges, nudgeGap, source, target) {
        var _this = this;
        var routePaths = edges.map(function (e) { return _this.route(source(e), target(e)); });
        var order = GridRouter.orderEdges(routePaths);
        var routes = routePaths.map(function (e) { return GridRouter.makeSegments(e); });
        GridRouter.nudgeSegments(routes, 'x', 'y', order, nudgeGap);
        GridRouter.nudgeSegments(routes, 'y', 'x', order, nudgeGap);
        GridRouter.unreverseEdges(routes, routePaths);
        return routes;
    };
    GridRouter.unreverseEdges = function (routes, routePaths) {
        routes.forEach(function (segments, i) {
            var path = routePaths[i];
            if (path.reversed) {
                segments.reverse();
                segments.forEach(function (segment) {
                    segment.reverse();
                });
            }
        });
    };
    GridRouter.angleBetween2Lines = function (line1, line2) {
        var angle1 = Math.atan2(line1[0].y - line1[1].y, line1[0].x - line1[1].x);
        var angle2 = Math.atan2(line2[0].y - line2[1].y, line2[0].x - line2[1].x);
        var diff = angle1 - angle2;
        if (diff > Math.PI || diff < -Math.PI) {
            diff = angle2 - angle1;
        }
        return diff;
    };
    GridRouter.isLeft = function (a, b, c) {
        return ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) <= 0;
    };
    GridRouter.getOrder = function (pairs) {
        var outgoing = {};
        for (var i = 0; i < pairs.length; i++) {
            var p = pairs[i];
            if (typeof outgoing[p.l] === 'undefined')
                outgoing[p.l] = {};
            outgoing[p.l][p.r] = true;
        }
        return function (l, r) { return typeof outgoing[l] !== 'undefined' && outgoing[l][r]; };
    };
    GridRouter.orderEdges = function (edges) {
        var edgeOrder = [];
        for (var i = 0; i < edges.length - 1; i++) {
            for (var j = i + 1; j < edges.length; j++) {
                var e = edges[i], f = edges[j], lcs = new LongestCommonSubsequence(e, f);
                var u, vi, vj;
                if (lcs.length === 0)
                    continue;
                if (lcs.reversed) {
                    f.reverse();
                    f.reversed = true;
                    lcs = new LongestCommonSubsequence(e, f);
                }
                if ((lcs.si <= 0 || lcs.ti <= 0) &&
                    (lcs.si + lcs.length >= e.length || lcs.ti + lcs.length >= f.length)) {
                    edgeOrder.push({ l: i, r: j });
                    continue;
                }
                if (lcs.si + lcs.length >= e.length || lcs.ti + lcs.length >= f.length) {
                    u = e[lcs.si + 1];
                    vj = e[lcs.si - 1];
                    vi = f[lcs.ti - 1];
                }
                else {
                    u = e[lcs.si + lcs.length - 2];
                    vi = e[lcs.si + lcs.length];
                    vj = f[lcs.ti + lcs.length];
                }
                if (GridRouter.isLeft(u, vi, vj)) {
                    edgeOrder.push({ l: j, r: i });
                }
                else {
                    edgeOrder.push({ l: i, r: j });
                }
            }
        }
        return GridRouter.getOrder(edgeOrder);
    };
    GridRouter.makeSegments = function (path) {
        function copyPoint(p) {
            return { x: p.x, y: p.y };
        }
        var isStraight = function (a, b, c) { return Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) < 0.001; };
        var segments = [];
        var a = copyPoint(path[0]);
        for (var i = 1; i < path.length; i++) {
            var b = copyPoint(path[i]), c = i < path.length - 1 ? path[i + 1] : null;
            if (!c || !isStraight(a, b, c)) {
                segments.push([a, b]);
                a = b;
            }
        }
        return segments;
    };
    GridRouter.prototype.route = function (s, t) {
        var _this = this;
        var source = this.nodes[s], target = this.nodes[t];
        this.obstacles = this.siblingObstacles(source, target);
        var obstacleLookup = {};
        this.obstacles.forEach(function (o) { return obstacleLookup[o.id] = o; });
        this.passableEdges = this.edges.filter(function (e) {
            var u = _this.verts[e.source], v = _this.verts[e.target];
            return !(u.node && u.node.id in obstacleLookup
                || v.node && v.node.id in obstacleLookup);
        });
        for (var i = 1; i < source.ports.length; i++) {
            var u = source.ports[0].id;
            var v = source.ports[i].id;
            this.passableEdges.push({
                source: u,
                target: v,
                length: 0
            });
        }
        for (var i = 1; i < target.ports.length; i++) {
            var u = target.ports[0].id;
            var v = target.ports[i].id;
            this.passableEdges.push({
                source: u,
                target: v,
                length: 0
            });
        }
        var getSource = function (e) { return e.source; }, getTarget = function (e) { return e.target; }, getLength = function (e) { return e.length; };
        var shortestPathCalculator = new shortestpaths_1.Calculator(this.verts.length, this.passableEdges, getSource, getTarget, getLength);
        var bendPenalty = function (u, v, w) {
            var a = _this.verts[u], b = _this.verts[v], c = _this.verts[w];
            var dx = Math.abs(c.x - a.x), dy = Math.abs(c.y - a.y);
            if (a.node === source && a.node === b.node || b.node === target && b.node === c.node)
                return 0;
            return dx > 1 && dy > 1 ? 1000 : 0;
        };
        var shortestPath = shortestPathCalculator.PathFromNodeToNodeWithPrevCost(source.ports[0].id, target.ports[0].id, bendPenalty);
        var pathPoints = shortestPath.reverse().map(function (vi) { return _this.verts[vi]; });
        pathPoints.push(this.nodes[target.id].ports[0]);
        return pathPoints.filter(function (v, i) {
            return !(i < pathPoints.length - 1 && pathPoints[i + 1].node === source && v.node === source
                || i > 0 && v.node === target && pathPoints[i - 1].node === target);
        });
    };
    GridRouter.getRoutePath = function (route, cornerradius, arrowwidth, arrowheight) {
        var result = {
            routepath: 'M ' + route[0][0].x + ' ' + route[0][0].y + ' ',
            arrowpath: ''
        };
        if (route.length > 1) {
            for (var i = 0; i < route.length; i++) {
                var li = route[i];
                var x = li[1].x, y = li[1].y;
                var dx = x - li[0].x;
                var dy = y - li[0].y;
                if (i < route.length - 1) {
                    if (Math.abs(dx) > 0) {
                        x -= dx / Math.abs(dx) * cornerradius;
                    }
                    else {
                        y -= dy / Math.abs(dy) * cornerradius;
                    }
                    result.routepath += 'L ' + x + ' ' + y + ' ';
                    var l = route[i + 1];
                    var x0 = l[0].x, y0 = l[0].y;
                    var x1 = l[1].x;
                    var y1 = l[1].y;
                    dx = x1 - x0;
                    dy = y1 - y0;
                    var angle = GridRouter.angleBetween2Lines(li, l) < 0 ? 1 : 0;
                    var x2, y2;
                    if (Math.abs(dx) > 0) {
                        x2 = x0 + dx / Math.abs(dx) * cornerradius;
                        y2 = y0;
                    }
                    else {
                        x2 = x0;
                        y2 = y0 + dy / Math.abs(dy) * cornerradius;
                    }
                    var cx = Math.abs(x2 - x);
                    var cy = Math.abs(y2 - y);
                    result.routepath += 'A ' + cx + ' ' + cy + ' 0 0 ' + angle + ' ' + x2 + ' ' + y2 + ' ';
                }
                else {
                    var arrowtip = [x, y];
                    var arrowcorner1, arrowcorner2;
                    if (Math.abs(dx) > 0) {
                        x -= dx / Math.abs(dx) * arrowheight;
                        arrowcorner1 = [x, y + arrowwidth];
                        arrowcorner2 = [x, y - arrowwidth];
                    }
                    else {
                        y -= dy / Math.abs(dy) * arrowheight;
                        arrowcorner1 = [x + arrowwidth, y];
                        arrowcorner2 = [x - arrowwidth, y];
                    }
                    result.routepath += 'L ' + x + ' ' + y + ' ';
                    if (arrowheight > 0) {
                        result.arrowpath = 'M ' + arrowtip[0] + ' ' + arrowtip[1] + ' L ' + arrowcorner1[0] + ' ' + arrowcorner1[1]
                            + ' L ' + arrowcorner2[0] + ' ' + arrowcorner2[1];
                    }
                }
            }
        }
        else {
            var li = route[0];
            var x = li[1].x, y = li[1].y;
            var dx = x - li[0].x;
            var dy = y - li[0].y;
            var arrowtip = [x, y];
            var arrowcorner1, arrowcorner2;
            if (Math.abs(dx) > 0) {
                x -= dx / Math.abs(dx) * arrowheight;
                arrowcorner1 = [x, y + arrowwidth];
                arrowcorner2 = [x, y - arrowwidth];
            }
            else {
                y -= dy / Math.abs(dy) * arrowheight;
                arrowcorner1 = [x + arrowwidth, y];
                arrowcorner2 = [x - arrowwidth, y];
            }
            result.routepath += 'L ' + x + ' ' + y + ' ';
            if (arrowheight > 0) {
                result.arrowpath = 'M ' + arrowtip[0] + ' ' + arrowtip[1] + ' L ' + arrowcorner1[0] + ' ' + arrowcorner1[1]
                    + ' L ' + arrowcorner2[0] + ' ' + arrowcorner2[1];
            }
        }
        return result;
    };
    return GridRouter;
}());
exports.GridRouter = GridRouter;
//# sourceMappingURL=gridrouter.js.map

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var packingOptions = {
    PADDING: 10,
    GOLDEN_SECTION: (1 + Math.sqrt(5)) / 2,
    FLOAT_EPSILON: 0.0001,
    MAX_INERATIONS: 100
};
function applyPacking(graphs, w, h, node_size, desired_ratio) {
    if (desired_ratio === void 0) { desired_ratio = 1; }
    var init_x = 0, init_y = 0, svg_width = w, svg_height = h, desired_ratio = typeof desired_ratio !== 'undefined' ? desired_ratio : 1, node_size = typeof node_size !== 'undefined' ? node_size : 0, real_width = 0, real_height = 0, min_width = 0, global_bottom = 0, line = [];
    if (graphs.length == 0)
        return;
    calculate_bb(graphs);
    apply(graphs, desired_ratio);
    put_nodes_to_right_positions(graphs);
    function calculate_bb(graphs) {
        graphs.forEach(function (g) {
            calculate_single_bb(g);
        });
        function calculate_single_bb(graph) {
            var min_x = Number.MAX_VALUE, min_y = Number.MAX_VALUE, max_x = 0, max_y = 0;
            graph.array.forEach(function (v) {
                var w = typeof v.width !== 'undefined' ? v.width : node_size;
                var h = typeof v.height !== 'undefined' ? v.height : node_size;
                w /= 2;
                h /= 2;
                max_x = Math.max(v.x + w, max_x);
                min_x = Math.min(v.x - w, min_x);
                max_y = Math.max(v.y + h, max_y);
                min_y = Math.min(v.y - h, min_y);
            });
            graph.width = max_x - min_x;
            graph.height = max_y - min_y;
        }
    }
    function put_nodes_to_right_positions(graphs) {
        graphs.forEach(function (g) {
            var center = { x: 0, y: 0 };
            g.array.forEach(function (node) {
                center.x += node.x;
                center.y += node.y;
            });
            center.x /= g.array.length;
            center.y /= g.array.length;
            var corner = { x: center.x - g.width / 2, y: center.y - g.height / 2 };
            var offset = { x: g.x - corner.x + svg_width / 2 - real_width / 2, y: g.y - corner.y + svg_height / 2 - real_height / 2 };
            g.array.forEach(function (node) {
                node.x += offset.x;
                node.y += offset.y;
            });
        });
    }
    function apply(data, desired_ratio) {
        var curr_best_f = Number.POSITIVE_INFINITY;
        var curr_best = 0;
        data.sort(function (a, b) { return b.height - a.height; });
        min_width = data.reduce(function (a, b) {
            return a.width < b.width ? a.width : b.width;
        });
        var left = x1 = min_width;
        var right = x2 = get_entire_width(data);
        var iterationCounter = 0;
        var f_x1 = Number.MAX_VALUE;
        var f_x2 = Number.MAX_VALUE;
        var flag = -1;
        var dx = Number.MAX_VALUE;
        var df = Number.MAX_VALUE;
        while ((dx > min_width) || df > packingOptions.FLOAT_EPSILON) {
            if (flag != 1) {
                var x1 = right - (right - left) / packingOptions.GOLDEN_SECTION;
                var f_x1 = step(data, x1);
            }
            if (flag != 0) {
                var x2 = left + (right - left) / packingOptions.GOLDEN_SECTION;
                var f_x2 = step(data, x2);
            }
            dx = Math.abs(x1 - x2);
            df = Math.abs(f_x1 - f_x2);
            if (f_x1 < curr_best_f) {
                curr_best_f = f_x1;
                curr_best = x1;
            }
            if (f_x2 < curr_best_f) {
                curr_best_f = f_x2;
                curr_best = x2;
            }
            if (f_x1 > f_x2) {
                left = x1;
                x1 = x2;
                f_x1 = f_x2;
                flag = 1;
            }
            else {
                right = x2;
                x2 = x1;
                f_x2 = f_x1;
                flag = 0;
            }
            if (iterationCounter++ > 100) {
                break;
            }
        }
        step(data, curr_best);
    }
    function step(data, max_width) {
        line = [];
        real_width = 0;
        real_height = 0;
        global_bottom = init_y;
        for (var i = 0; i < data.length; i++) {
            var o = data[i];
            put_rect(o, max_width);
        }
        return Math.abs(get_real_ratio() - desired_ratio);
    }
    function put_rect(rect, max_width) {
        var parent = undefined;
        for (var i = 0; i < line.length; i++) {
            if ((line[i].space_left >= rect.height) && (line[i].x + line[i].width + rect.width + packingOptions.PADDING - max_width) <= packingOptions.FLOAT_EPSILON) {
                parent = line[i];
                break;
            }
        }
        line.push(rect);
        if (parent !== undefined) {
            rect.x = parent.x + parent.width + packingOptions.PADDING;
            rect.y = parent.bottom;
            rect.space_left = rect.height;
            rect.bottom = rect.y;
            parent.space_left -= rect.height + packingOptions.PADDING;
            parent.bottom += rect.height + packingOptions.PADDING;
        }
        else {
            rect.y = global_bottom;
            global_bottom += rect.height + packingOptions.PADDING;
            rect.x = init_x;
            rect.bottom = rect.y;
            rect.space_left = rect.height;
        }
        if (rect.y + rect.height - real_height > -packingOptions.FLOAT_EPSILON)
            real_height = rect.y + rect.height - init_y;
        if (rect.x + rect.width - real_width > -packingOptions.FLOAT_EPSILON)
            real_width = rect.x + rect.width - init_x;
    }
    ;
    function get_entire_width(data) {
        var width = 0;
        data.forEach(function (d) { return width += d.width + packingOptions.PADDING; });
        return width;
    }
    function get_real_ratio() {
        return (real_width / real_height);
    }
}
exports.applyPacking = applyPacking;
function separateGraphs(nodes, links) {
    var marks = {};
    var ways = {};
    var graphs = [];
    var clusters = 0;
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        var n1 = link.source;
        var n2 = link.target;
        if (ways[n1.index])
            ways[n1.index].push(n2);
        else
            ways[n1.index] = [n2];
        if (ways[n2.index])
            ways[n2.index].push(n1);
        else
            ways[n2.index] = [n1];
    }
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (marks[node.index])
            continue;
        explore_node(node, true);
    }
    function explore_node(n, is_new) {
        if (marks[n.index] !== undefined)
            return;
        if (is_new) {
            clusters++;
            graphs.push({ array: [] });
        }
        marks[n.index] = clusters;
        graphs[clusters - 1].array.push(n);
        var adjacent = ways[n.index];
        if (!adjacent)
            return;
        for (var j = 0; j < adjacent.length; j++) {
            explore_node(adjacent[j], false);
        }
    }
    return graphs;
}
exports.separateGraphs = separateGraphs;
//# sourceMappingURL=handledisconnected.js.map

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var PowerEdge = (function () {
    function PowerEdge(source, target, type) {
        this.source = source;
        this.target = target;
        this.type = type;
    }
    return PowerEdge;
}());
exports.PowerEdge = PowerEdge;
var Configuration = (function () {
    function Configuration(n, edges, linkAccessor, rootGroup) {
        var _this = this;
        this.linkAccessor = linkAccessor;
        this.modules = new Array(n);
        this.roots = [];
        if (rootGroup) {
            this.initModulesFromGroup(rootGroup);
        }
        else {
            this.roots.push(new ModuleSet());
            for (var i = 0; i < n; ++i)
                this.roots[0].add(this.modules[i] = new Module(i));
        }
        this.R = edges.length;
        edges.forEach(function (e) {
            var s = _this.modules[linkAccessor.getSourceIndex(e)], t = _this.modules[linkAccessor.getTargetIndex(e)], type = linkAccessor.getType(e);
            s.outgoing.add(type, t);
            t.incoming.add(type, s);
        });
    }
    Configuration.prototype.initModulesFromGroup = function (group) {
        var moduleSet = new ModuleSet();
        this.roots.push(moduleSet);
        for (var i = 0; i < group.leaves.length; ++i) {
            var node = group.leaves[i];
            var module = new Module(node.id);
            this.modules[node.id] = module;
            moduleSet.add(module);
        }
        if (group.groups) {
            for (var j = 0; j < group.groups.length; ++j) {
                var child = group.groups[j];
                var definition = {};
                for (var prop in child)
                    if (prop !== "leaves" && prop !== "groups" && child.hasOwnProperty(prop))
                        definition[prop] = child[prop];
                moduleSet.add(new Module(-1 - j, new LinkSets(), new LinkSets(), this.initModulesFromGroup(child), definition));
            }
        }
        return moduleSet;
    };
    Configuration.prototype.merge = function (a, b, k) {
        if (k === void 0) { k = 0; }
        var inInt = a.incoming.intersection(b.incoming), outInt = a.outgoing.intersection(b.outgoing);
        var children = new ModuleSet();
        children.add(a);
        children.add(b);
        var m = new Module(this.modules.length, outInt, inInt, children);
        this.modules.push(m);
        var update = function (s, i, o) {
            s.forAll(function (ms, linktype) {
                ms.forAll(function (n) {
                    var nls = n[i];
                    nls.add(linktype, m);
                    nls.remove(linktype, a);
                    nls.remove(linktype, b);
                    a[o].remove(linktype, n);
                    b[o].remove(linktype, n);
                });
            });
        };
        update(outInt, "incoming", "outgoing");
        update(inInt, "outgoing", "incoming");
        this.R -= inInt.count() + outInt.count();
        this.roots[k].remove(a);
        this.roots[k].remove(b);
        this.roots[k].add(m);
        return m;
    };
    Configuration.prototype.rootMerges = function (k) {
        if (k === void 0) { k = 0; }
        var rs = this.roots[k].modules();
        var n = rs.length;
        var merges = new Array(n * (n - 1));
        var ctr = 0;
        for (var i = 0, i_ = n - 1; i < i_; ++i) {
            for (var j = i + 1; j < n; ++j) {
                var a = rs[i], b = rs[j];
                merges[ctr] = { id: ctr, nEdges: this.nEdges(a, b), a: a, b: b };
                ctr++;
            }
        }
        return merges;
    };
    Configuration.prototype.greedyMerge = function () {
        for (var i = 0; i < this.roots.length; ++i) {
            if (this.roots[i].modules().length < 2)
                continue;
            var ms = this.rootMerges(i).sort(function (a, b) { return a.nEdges == b.nEdges ? a.id - b.id : a.nEdges - b.nEdges; });
            var m = ms[0];
            if (m.nEdges >= this.R)
                continue;
            this.merge(m.a, m.b, i);
            return true;
        }
    };
    Configuration.prototype.nEdges = function (a, b) {
        var inInt = a.incoming.intersection(b.incoming), outInt = a.outgoing.intersection(b.outgoing);
        return this.R - inInt.count() - outInt.count();
    };
    Configuration.prototype.getGroupHierarchy = function (retargetedEdges) {
        var _this = this;
        var groups = [];
        var root = {};
        toGroups(this.roots[0], root, groups);
        var es = this.allEdges();
        es.forEach(function (e) {
            var a = _this.modules[e.source];
            var b = _this.modules[e.target];
            retargetedEdges.push(new PowerEdge(typeof a.gid === "undefined" ? e.source : groups[a.gid], typeof b.gid === "undefined" ? e.target : groups[b.gid], e.type));
        });
        return groups;
    };
    Configuration.prototype.allEdges = function () {
        var es = [];
        Configuration.getEdges(this.roots[0], es);
        return es;
    };
    Configuration.getEdges = function (modules, es) {
        modules.forAll(function (m) {
            m.getEdges(es);
            Configuration.getEdges(m.children, es);
        });
    };
    return Configuration;
}());
exports.Configuration = Configuration;
function toGroups(modules, group, groups) {
    modules.forAll(function (m) {
        if (m.isLeaf()) {
            if (!group.leaves)
                group.leaves = [];
            group.leaves.push(m.id);
        }
        else {
            var g = group;
            m.gid = groups.length;
            if (!m.isIsland() || m.isPredefined()) {
                g = { id: m.gid };
                if (m.isPredefined())
                    for (var prop in m.definition)
                        g[prop] = m.definition[prop];
                if (!group.groups)
                    group.groups = [];
                group.groups.push(m.gid);
                groups.push(g);
            }
            toGroups(m.children, g, groups);
        }
    });
}
var Module = (function () {
    function Module(id, outgoing, incoming, children, definition) {
        if (outgoing === void 0) { outgoing = new LinkSets(); }
        if (incoming === void 0) { incoming = new LinkSets(); }
        if (children === void 0) { children = new ModuleSet(); }
        this.id = id;
        this.outgoing = outgoing;
        this.incoming = incoming;
        this.children = children;
        this.definition = definition;
    }
    Module.prototype.getEdges = function (es) {
        var _this = this;
        this.outgoing.forAll(function (ms, edgetype) {
            ms.forAll(function (target) {
                es.push(new PowerEdge(_this.id, target.id, edgetype));
            });
        });
    };
    Module.prototype.isLeaf = function () {
        return this.children.count() === 0;
    };
    Module.prototype.isIsland = function () {
        return this.outgoing.count() === 0 && this.incoming.count() === 0;
    };
    Module.prototype.isPredefined = function () {
        return typeof this.definition !== "undefined";
    };
    return Module;
}());
exports.Module = Module;
function intersection(m, n) {
    var i = {};
    for (var v in m)
        if (v in n)
            i[v] = m[v];
    return i;
}
var ModuleSet = (function () {
    function ModuleSet() {
        this.table = {};
    }
    ModuleSet.prototype.count = function () {
        return Object.keys(this.table).length;
    };
    ModuleSet.prototype.intersection = function (other) {
        var result = new ModuleSet();
        result.table = intersection(this.table, other.table);
        return result;
    };
    ModuleSet.prototype.intersectionCount = function (other) {
        return this.intersection(other).count();
    };
    ModuleSet.prototype.contains = function (id) {
        return id in this.table;
    };
    ModuleSet.prototype.add = function (m) {
        this.table[m.id] = m;
    };
    ModuleSet.prototype.remove = function (m) {
        delete this.table[m.id];
    };
    ModuleSet.prototype.forAll = function (f) {
        for (var mid in this.table) {
            f(this.table[mid]);
        }
    };
    ModuleSet.prototype.modules = function () {
        var vs = [];
        this.forAll(function (m) {
            if (!m.isPredefined())
                vs.push(m);
        });
        return vs;
    };
    return ModuleSet;
}());
exports.ModuleSet = ModuleSet;
var LinkSets = (function () {
    function LinkSets() {
        this.sets = {};
        this.n = 0;
    }
    LinkSets.prototype.count = function () {
        return this.n;
    };
    LinkSets.prototype.contains = function (id) {
        var result = false;
        this.forAllModules(function (m) {
            if (!result && m.id == id) {
                result = true;
            }
        });
        return result;
    };
    LinkSets.prototype.add = function (linktype, m) {
        var s = linktype in this.sets ? this.sets[linktype] : this.sets[linktype] = new ModuleSet();
        s.add(m);
        ++this.n;
    };
    LinkSets.prototype.remove = function (linktype, m) {
        var ms = this.sets[linktype];
        ms.remove(m);
        if (ms.count() === 0) {
            delete this.sets[linktype];
        }
        --this.n;
    };
    LinkSets.prototype.forAll = function (f) {
        for (var linktype in this.sets) {
            f(this.sets[linktype], Number(linktype));
        }
    };
    LinkSets.prototype.forAllModules = function (f) {
        this.forAll(function (ms, lt) { return ms.forAll(f); });
    };
    LinkSets.prototype.intersection = function (other) {
        var result = new LinkSets();
        this.forAll(function (ms, lt) {
            if (lt in other.sets) {
                var i = ms.intersection(other.sets[lt]), n = i.count();
                if (n > 0) {
                    result.sets[lt] = i;
                    result.n += n;
                }
            }
        });
        return result;
    };
    return LinkSets;
}());
exports.LinkSets = LinkSets;
function intersectionCount(m, n) {
    return Object.keys(intersection(m, n)).length;
}
function getGroups(nodes, links, la, rootGroup) {
    var n = nodes.length, c = new Configuration(n, links, la, rootGroup);
    while (c.greedyMerge())
        ;
    var powerEdges = [];
    var g = c.getGroupHierarchy(powerEdges);
    powerEdges.forEach(function (e) {
        var f = function (end) {
            var g = e[end];
            if (typeof g == "number")
                e[end] = nodes[g];
        };
        f("source");
        f("target");
    });
    return { groups: g, powerEdges: powerEdges };
}
exports.getGroups = getGroups;
//# sourceMappingURL=powergraph.js.map

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var PairingHeap = (function () {
    function PairingHeap(elem) {
        this.elem = elem;
        this.subheaps = [];
    }
    PairingHeap.prototype.toString = function (selector) {
        var str = "", needComma = false;
        for (var i = 0; i < this.subheaps.length; ++i) {
            var subheap = this.subheaps[i];
            if (!subheap.elem) {
                needComma = false;
                continue;
            }
            if (needComma) {
                str = str + ",";
            }
            str = str + subheap.toString(selector);
            needComma = true;
        }
        if (str !== "") {
            str = "(" + str + ")";
        }
        return (this.elem ? selector(this.elem) : "") + str;
    };
    PairingHeap.prototype.forEach = function (f) {
        if (!this.empty()) {
            f(this.elem, this);
            this.subheaps.forEach(function (s) { return s.forEach(f); });
        }
    };
    PairingHeap.prototype.count = function () {
        return this.empty() ? 0 : 1 + this.subheaps.reduce(function (n, h) {
            return n + h.count();
        }, 0);
    };
    PairingHeap.prototype.min = function () {
        return this.elem;
    };
    PairingHeap.prototype.empty = function () {
        return this.elem == null;
    };
    PairingHeap.prototype.contains = function (h) {
        if (this === h)
            return true;
        for (var i = 0; i < this.subheaps.length; i++) {
            if (this.subheaps[i].contains(h))
                return true;
        }
        return false;
    };
    PairingHeap.prototype.isHeap = function (lessThan) {
        var _this = this;
        return this.subheaps.every(function (h) { return lessThan(_this.elem, h.elem) && h.isHeap(lessThan); });
    };
    PairingHeap.prototype.insert = function (obj, lessThan) {
        return this.merge(new PairingHeap(obj), lessThan);
    };
    PairingHeap.prototype.merge = function (heap2, lessThan) {
        if (this.empty())
            return heap2;
        else if (heap2.empty())
            return this;
        else if (lessThan(this.elem, heap2.elem)) {
            this.subheaps.push(heap2);
            return this;
        }
        else {
            heap2.subheaps.push(this);
            return heap2;
        }
    };
    PairingHeap.prototype.removeMin = function (lessThan) {
        if (this.empty())
            return null;
        else
            return this.mergePairs(lessThan);
    };
    PairingHeap.prototype.mergePairs = function (lessThan) {
        if (this.subheaps.length == 0)
            return new PairingHeap(null);
        else if (this.subheaps.length == 1) {
            return this.subheaps[0];
        }
        else {
            var firstPair = this.subheaps.pop().merge(this.subheaps.pop(), lessThan);
            var remaining = this.mergePairs(lessThan);
            return firstPair.merge(remaining, lessThan);
        }
    };
    PairingHeap.prototype.decreaseKey = function (subheap, newValue, setHeapNode, lessThan) {
        var newHeap = subheap.removeMin(lessThan);
        subheap.elem = newHeap.elem;
        subheap.subheaps = newHeap.subheaps;
        if (setHeapNode !== null && newHeap.elem !== null) {
            setHeapNode(subheap.elem, subheap);
        }
        var pairingNode = new PairingHeap(newValue);
        if (setHeapNode !== null) {
            setHeapNode(newValue, pairingNode);
        }
        return this.merge(pairingNode, lessThan);
    };
    return PairingHeap;
}());
exports.PairingHeap = PairingHeap;
var PriorityQueue = (function () {
    function PriorityQueue(lessThan) {
        this.lessThan = lessThan;
    }
    PriorityQueue.prototype.top = function () {
        if (this.empty()) {
            return null;
        }
        return this.root.elem;
    };
    PriorityQueue.prototype.push = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var pairingNode;
        for (var i = 0, arg; arg = args[i]; ++i) {
            pairingNode = new PairingHeap(arg);
            this.root = this.empty() ?
                pairingNode : this.root.merge(pairingNode, this.lessThan);
        }
        return pairingNode;
    };
    PriorityQueue.prototype.empty = function () {
        return !this.root || !this.root.elem;
    };
    PriorityQueue.prototype.isHeap = function () {
        return this.root.isHeap(this.lessThan);
    };
    PriorityQueue.prototype.forEach = function (f) {
        this.root.forEach(f);
    };
    PriorityQueue.prototype.pop = function () {
        if (this.empty()) {
            return null;
        }
        var obj = this.root.min();
        this.root = this.root.removeMin(this.lessThan);
        return obj;
    };
    PriorityQueue.prototype.reduceKey = function (heapNode, newKey, setHeapNode) {
        if (setHeapNode === void 0) { setHeapNode = null; }
        this.root = this.root.decreaseKey(heapNode, newKey, setHeapNode, this.lessThan);
    };
    PriorityQueue.prototype.toString = function (selector) {
        return this.root.toString(selector);
    };
    PriorityQueue.prototype.count = function () {
        return this.root.count();
    };
    return PriorityQueue;
}());
exports.PriorityQueue = PriorityQueue;
//# sourceMappingURL=pqueue.js.map

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var TreeBase = (function () {
    function TreeBase() {
        this.findIter = function (data) {
            var res = this._root;
            var iter = this.iterator();
            while (res !== null) {
                var c = this._comparator(data, res.data);
                if (c === 0) {
                    iter._cursor = res;
                    return iter;
                }
                else {
                    iter._ancestors.push(res);
                    res = res.get_child(c > 0);
                }
            }
            return null;
        };
    }
    TreeBase.prototype.clear = function () {
        this._root = null;
        this.size = 0;
    };
    ;
    TreeBase.prototype.find = function (data) {
        var res = this._root;
        while (res !== null) {
            var c = this._comparator(data, res.data);
            if (c === 0) {
                return res.data;
            }
            else {
                res = res.get_child(c > 0);
            }
        }
        return null;
    };
    ;
    TreeBase.prototype.lowerBound = function (data) {
        return this._bound(data, this._comparator);
    };
    ;
    TreeBase.prototype.upperBound = function (data) {
        var cmp = this._comparator;
        function reverse_cmp(a, b) {
            return cmp(b, a);
        }
        return this._bound(data, reverse_cmp);
    };
    ;
    TreeBase.prototype.min = function () {
        var res = this._root;
        if (res === null) {
            return null;
        }
        while (res.left !== null) {
            res = res.left;
        }
        return res.data;
    };
    ;
    TreeBase.prototype.max = function () {
        var res = this._root;
        if (res === null) {
            return null;
        }
        while (res.right !== null) {
            res = res.right;
        }
        return res.data;
    };
    ;
    TreeBase.prototype.iterator = function () {
        return new Iterator(this);
    };
    ;
    TreeBase.prototype.each = function (cb) {
        var it = this.iterator(), data;
        while ((data = it.next()) !== null) {
            cb(data);
        }
    };
    ;
    TreeBase.prototype.reach = function (cb) {
        var it = this.iterator(), data;
        while ((data = it.prev()) !== null) {
            cb(data);
        }
    };
    ;
    TreeBase.prototype._bound = function (data, cmp) {
        var cur = this._root;
        var iter = this.iterator();
        while (cur !== null) {
            var c = this._comparator(data, cur.data);
            if (c === 0) {
                iter._cursor = cur;
                return iter;
            }
            iter._ancestors.push(cur);
            cur = cur.get_child(c > 0);
        }
        for (var i = iter._ancestors.length - 1; i >= 0; --i) {
            cur = iter._ancestors[i];
            if (cmp(data, cur.data) > 0) {
                iter._cursor = cur;
                iter._ancestors.length = i;
                return iter;
            }
        }
        iter._ancestors.length = 0;
        return iter;
    };
    ;
    return TreeBase;
}());
exports.TreeBase = TreeBase;
var Iterator = (function () {
    function Iterator(tree) {
        this._tree = tree;
        this._ancestors = [];
        this._cursor = null;
    }
    Iterator.prototype.data = function () {
        return this._cursor !== null ? this._cursor.data : null;
    };
    ;
    Iterator.prototype.next = function () {
        if (this._cursor === null) {
            var root = this._tree._root;
            if (root !== null) {
                this._minNode(root);
            }
        }
        else {
            if (this._cursor.right === null) {
                var save;
                do {
                    save = this._cursor;
                    if (this._ancestors.length) {
                        this._cursor = this._ancestors.pop();
                    }
                    else {
                        this._cursor = null;
                        break;
                    }
                } while (this._cursor.right === save);
            }
            else {
                this._ancestors.push(this._cursor);
                this._minNode(this._cursor.right);
            }
        }
        return this._cursor !== null ? this._cursor.data : null;
    };
    ;
    Iterator.prototype.prev = function () {
        if (this._cursor === null) {
            var root = this._tree._root;
            if (root !== null) {
                this._maxNode(root);
            }
        }
        else {
            if (this._cursor.left === null) {
                var save;
                do {
                    save = this._cursor;
                    if (this._ancestors.length) {
                        this._cursor = this._ancestors.pop();
                    }
                    else {
                        this._cursor = null;
                        break;
                    }
                } while (this._cursor.left === save);
            }
            else {
                this._ancestors.push(this._cursor);
                this._maxNode(this._cursor.left);
            }
        }
        return this._cursor !== null ? this._cursor.data : null;
    };
    ;
    Iterator.prototype._minNode = function (start) {
        while (start.left !== null) {
            this._ancestors.push(start);
            start = start.left;
        }
        this._cursor = start;
    };
    ;
    Iterator.prototype._maxNode = function (start) {
        while (start.right !== null) {
            this._ancestors.push(start);
            start = start.right;
        }
        this._cursor = start;
    };
    ;
    return Iterator;
}());
exports.Iterator = Iterator;
var Node = (function () {
    function Node(data) {
        this.data = data;
        this.left = null;
        this.right = null;
        this.red = true;
    }
    Node.prototype.get_child = function (dir) {
        return dir ? this.right : this.left;
    };
    ;
    Node.prototype.set_child = function (dir, val) {
        if (dir) {
            this.right = val;
        }
        else {
            this.left = val;
        }
    };
    ;
    return Node;
}());
var RBTree = (function (_super) {
    __extends(RBTree, _super);
    function RBTree(comparator) {
        var _this = _super.call(this) || this;
        _this._root = null;
        _this._comparator = comparator;
        _this.size = 0;
        return _this;
    }
    RBTree.prototype.insert = function (data) {
        var ret = false;
        if (this._root === null) {
            this._root = new Node(data);
            ret = true;
            this.size++;
        }
        else {
            var head = new Node(undefined);
            var dir = false;
            var last = false;
            var gp = null;
            var ggp = head;
            var p = null;
            var node = this._root;
            ggp.right = this._root;
            while (true) {
                if (node === null) {
                    node = new Node(data);
                    p.set_child(dir, node);
                    ret = true;
                    this.size++;
                }
                else if (RBTree.is_red(node.left) && RBTree.is_red(node.right)) {
                    node.red = true;
                    node.left.red = false;
                    node.right.red = false;
                }
                if (RBTree.is_red(node) && RBTree.is_red(p)) {
                    var dir2 = ggp.right === gp;
                    if (node === p.get_child(last)) {
                        ggp.set_child(dir2, RBTree.single_rotate(gp, !last));
                    }
                    else {
                        ggp.set_child(dir2, RBTree.double_rotate(gp, !last));
                    }
                }
                var cmp = this._comparator(node.data, data);
                if (cmp === 0) {
                    break;
                }
                last = dir;
                dir = cmp < 0;
                if (gp !== null) {
                    ggp = gp;
                }
                gp = p;
                p = node;
                node = node.get_child(dir);
            }
            this._root = head.right;
        }
        this._root.red = false;
        return ret;
    };
    ;
    RBTree.prototype.remove = function (data) {
        if (this._root === null) {
            return false;
        }
        var head = new Node(undefined);
        var node = head;
        node.right = this._root;
        var p = null;
        var gp = null;
        var found = null;
        var dir = true;
        while (node.get_child(dir) !== null) {
            var last = dir;
            gp = p;
            p = node;
            node = node.get_child(dir);
            var cmp = this._comparator(data, node.data);
            dir = cmp > 0;
            if (cmp === 0) {
                found = node;
            }
            if (!RBTree.is_red(node) && !RBTree.is_red(node.get_child(dir))) {
                if (RBTree.is_red(node.get_child(!dir))) {
                    var sr = RBTree.single_rotate(node, dir);
                    p.set_child(last, sr);
                    p = sr;
                }
                else if (!RBTree.is_red(node.get_child(!dir))) {
                    var sibling = p.get_child(!last);
                    if (sibling !== null) {
                        if (!RBTree.is_red(sibling.get_child(!last)) && !RBTree.is_red(sibling.get_child(last))) {
                            p.red = false;
                            sibling.red = true;
                            node.red = true;
                        }
                        else {
                            var dir2 = gp.right === p;
                            if (RBTree.is_red(sibling.get_child(last))) {
                                gp.set_child(dir2, RBTree.double_rotate(p, last));
                            }
                            else if (RBTree.is_red(sibling.get_child(!last))) {
                                gp.set_child(dir2, RBTree.single_rotate(p, last));
                            }
                            var gpc = gp.get_child(dir2);
                            gpc.red = true;
                            node.red = true;
                            gpc.left.red = false;
                            gpc.right.red = false;
                        }
                    }
                }
            }
        }
        if (found !== null) {
            found.data = node.data;
            p.set_child(p.right === node, node.get_child(node.left === null));
            this.size--;
        }
        this._root = head.right;
        if (this._root !== null) {
            this._root.red = false;
        }
        return found !== null;
    };
    ;
    RBTree.is_red = function (node) {
        return node !== null && node.red;
    };
    RBTree.single_rotate = function (root, dir) {
        var save = root.get_child(!dir);
        root.set_child(!dir, save.get_child(dir));
        save.set_child(dir, root);
        root.red = true;
        save.red = false;
        return save;
    };
    RBTree.double_rotate = function (root, dir) {
        root.set_child(!dir, RBTree.single_rotate(root.get_child(!dir), !dir));
        return RBTree.single_rotate(root, dir);
    };
    return RBTree;
}(TreeBase));
exports.RBTree = RBTree;
//# sourceMappingURL=rbtree.js.map

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Simple, internal Object.assign() polyfill for options objects etc.

module.exports = Object.assign != null ? Object.assign.bind(Object) : function (tgt) {
  for (var _len = arguments.length, srcs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    srcs[_key - 1] = arguments[_key];
  }

  srcs.forEach(function (src) {
    Object.keys(src).forEach(function (k) {
      return tgt[k] = src[k];
    });
  });

  return tgt;
};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// default layout options
var defaults = {
  animate: true, // whether to show the layout as it's running
  refresh: 1, // number of ticks per frame; higher is faster but more jerky
  maxSimulationTime: 4000, // max length in ms to run the layout
  ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
  fit: true, // on every layout reposition of nodes, fit the viewport
  padding: 30, // padding around the simulation
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  nodeDimensionsIncludeLabels: undefined, // whether labels should be included in determining the space used by a node (default true)

  // layout event callbacks
  ready: function ready() {}, // on layoutready
  stop: function stop() {}, // on layoutstop

  // positioning options
  randomize: false, // use random node positions at beginning of layout
  avoidOverlap: true, // if true, prevents overlap of node bounding boxes
  handleDisconnected: true, // if true, avoids disconnected components from overlapping
  nodeSpacing: function nodeSpacing(node) {
    return 10;
  }, // extra spacing around nodes
  flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
  alignment: undefined, // relative alignment constraints on nodes, e.g. function( node ){ return { x: 0, y: 1 } }
  gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]

  // different methods of specifying edge length
  // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
  edgeLength: undefined, // sets edge length directly in simulation
  edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
  edgeJaccardLength: undefined, // jaccard edge length in simulation

  // iterations of cola algorithm; uses default values on undefined
  unconstrIter: undefined, // unconstrained initial layout iterations
  userConstIter: undefined, // initial layout iterations with user-specified constraints
  allConstIter: undefined, // initial layout iterations with all constraints including non-overlap

  // infinite layout options
  infinite: false // overrides all other options for a forces-all-the-time mode
};

module.exports = defaults;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(17));
__export(__webpack_require__(19));
__export(__webpack_require__(5));
__export(__webpack_require__(8));
__export(__webpack_require__(9));
__export(__webpack_require__(10));
__export(__webpack_require__(2));
__export(__webpack_require__(22));
__export(__webpack_require__(6));
__export(__webpack_require__(11));
__export(__webpack_require__(12));
__export(__webpack_require__(13));
__export(__webpack_require__(3));
__export(__webpack_require__(4));
__export(__webpack_require__(7));
__export(__webpack_require__(18));
//# sourceMappingURL=index.js.map

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var layout_1 = __webpack_require__(2);
var LayoutAdaptor = (function (_super) {
    __extends(LayoutAdaptor, _super);
    function LayoutAdaptor(options) {
        var _this = _super.call(this) || this;
        var self = _this;
        var o = options;
        if (o.trigger) {
            _this.trigger = o.trigger;
        }
        if (o.kick) {
            _this.kick = o.kick;
        }
        if (o.drag) {
            _this.drag = o.drag;
        }
        if (o.on) {
            _this.on = o.on;
        }
        _this.dragstart = _this.dragStart = layout_1.Layout.dragStart;
        _this.dragend = _this.dragEnd = layout_1.Layout.dragEnd;
        return _this;
    }
    LayoutAdaptor.prototype.trigger = function (e) { };
    ;
    LayoutAdaptor.prototype.kick = function () { };
    ;
    LayoutAdaptor.prototype.drag = function () { };
    ;
    LayoutAdaptor.prototype.on = function (eventType, listener) { return this; };
    ;
    return LayoutAdaptor;
}(layout_1.Layout));
exports.LayoutAdaptor = LayoutAdaptor;
function adaptor(options) {
    return new LayoutAdaptor(options);
}
exports.adaptor = adaptor;
//# sourceMappingURL=adaptor.js.map

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var layout_1 = __webpack_require__(2);
var gridrouter_1 = __webpack_require__(9);
function gridify(pgLayout, nudgeGap, margin, groupMargin) {
    pgLayout.cola.start(0, 0, 0, 10, false);
    var gridrouter = route(pgLayout.cola.nodes(), pgLayout.cola.groups(), margin, groupMargin);
    return gridrouter.routeEdges(pgLayout.powerGraph.powerEdges, nudgeGap, function (e) { return e.source.routerNode.id; }, function (e) { return e.target.routerNode.id; });
}
exports.gridify = gridify;
function route(nodes, groups, margin, groupMargin) {
    nodes.forEach(function (d) {
        d.routerNode = {
            name: d.name,
            bounds: d.bounds.inflate(-margin)
        };
    });
    groups.forEach(function (d) {
        d.routerNode = {
            bounds: d.bounds.inflate(-groupMargin),
            children: (typeof d.groups !== 'undefined' ? d.groups.map(function (c) { return nodes.length + c.id; }) : [])
                .concat(typeof d.leaves !== 'undefined' ? d.leaves.map(function (c) { return c.index; }) : [])
        };
    });
    var gridRouterNodes = nodes.concat(groups).map(function (d, i) {
        d.routerNode.id = i;
        return d.routerNode;
    });
    return new gridrouter_1.GridRouter(gridRouterNodes, {
        getChildren: function (v) { return v.children; },
        getBounds: function (v) { return v.bounds; }
    }, margin - groupMargin);
}
function powerGraphGridLayout(graph, size, grouppadding) {
    var powerGraph;
    graph.nodes.forEach(function (v, i) { return v.index = i; });
    new layout_1.Layout()
        .avoidOverlaps(false)
        .nodes(graph.nodes)
        .links(graph.links)
        .powerGraphGroups(function (d) {
        powerGraph = d;
        powerGraph.groups.forEach(function (v) { return v.padding = grouppadding; });
    });
    var n = graph.nodes.length;
    var edges = [];
    var vs = graph.nodes.slice(0);
    vs.forEach(function (v, i) { return v.index = i; });
    powerGraph.groups.forEach(function (g) {
        var sourceInd = g.index = g.id + n;
        vs.push(g);
        if (typeof g.leaves !== 'undefined')
            g.leaves.forEach(function (v) { return edges.push({ source: sourceInd, target: v.index }); });
        if (typeof g.groups !== 'undefined')
            g.groups.forEach(function (gg) { return edges.push({ source: sourceInd, target: gg.id + n }); });
    });
    powerGraph.powerEdges.forEach(function (e) {
        edges.push({ source: e.source.index, target: e.target.index });
    });
    new layout_1.Layout()
        .size(size)
        .nodes(vs)
        .links(edges)
        .avoidOverlaps(false)
        .linkDistance(30)
        .symmetricDiffLinkLengths(5)
        .convergenceThreshold(1e-4)
        .start(100, 0, 0, 0, false);
    return {
        cola: new layout_1.Layout()
            .convergenceThreshold(1e-3)
            .size(size)
            .avoidOverlaps(true)
            .nodes(graph.nodes)
            .links(graph.links)
            .groupCompactness(1e-4)
            .linkDistance(30)
            .symmetricDiffLinkLengths(5)
            .powerGraphGroups(function (d) {
            powerGraph = d;
            powerGraph.groups.forEach(function (v) {
                v.padding = grouppadding;
            });
        }).start(50, 0, 100, 0, false),
        powerGraph: powerGraph
    };
}
exports.powerGraphGridLayout = powerGraphGridLayout;
//# sourceMappingURL=batch.js.map

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var d3v3 = __webpack_require__(20);
var d3v4 = __webpack_require__(21);
;
function d3adaptor(d3Context) {
    if (!d3Context || isD3V3(d3Context)) {
        return new d3v3.D3StyleLayoutAdaptor();
    }
    return new d3v4.D3StyleLayoutAdaptor(d3Context);
}
exports.d3adaptor = d3adaptor;
function isD3V3(d3Context) {
    var v3exp = /^3\./;
    return d3Context.version && d3Context.version.match(v3exp) !== null;
}
//# sourceMappingURL=d3adaptor.js.map

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var layout_1 = __webpack_require__(2);
var D3StyleLayoutAdaptor = (function (_super) {
    __extends(D3StyleLayoutAdaptor, _super);
    function D3StyleLayoutAdaptor() {
        var _this = _super.call(this) || this;
        _this.event = d3.dispatch(layout_1.EventType[layout_1.EventType.start], layout_1.EventType[layout_1.EventType.tick], layout_1.EventType[layout_1.EventType.end]);
        var d3layout = _this;
        var drag;
        _this.drag = function () {
            if (!drag) {
                var drag = d3.behavior.drag()
                    .origin(layout_1.Layout.dragOrigin)
                    .on("dragstart.d3adaptor", layout_1.Layout.dragStart)
                    .on("drag.d3adaptor", function (d) {
                    layout_1.Layout.drag(d, d3.event);
                    d3layout.resume();
                })
                    .on("dragend.d3adaptor", layout_1.Layout.dragEnd);
            }
            if (!arguments.length)
                return drag;
            this
                .call(drag);
        };
        return _this;
    }
    D3StyleLayoutAdaptor.prototype.trigger = function (e) {
        var d3event = { type: layout_1.EventType[e.type], alpha: e.alpha, stress: e.stress };
        this.event[d3event.type](d3event);
    };
    D3StyleLayoutAdaptor.prototype.kick = function () {
        var _this = this;
        d3.timer(function () { return _super.prototype.tick.call(_this); });
    };
    D3StyleLayoutAdaptor.prototype.on = function (eventType, listener) {
        if (typeof eventType === 'string') {
            this.event.on(eventType, listener);
        }
        else {
            this.event.on(layout_1.EventType[eventType], listener);
        }
        return this;
    };
    return D3StyleLayoutAdaptor;
}(layout_1.Layout));
exports.D3StyleLayoutAdaptor = D3StyleLayoutAdaptor;
function d3adaptor() {
    return new D3StyleLayoutAdaptor();
}
exports.d3adaptor = d3adaptor;
//# sourceMappingURL=d3v3adaptor.js.map

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var layout_1 = __webpack_require__(2);
var D3StyleLayoutAdaptor = (function (_super) {
    __extends(D3StyleLayoutAdaptor, _super);
    function D3StyleLayoutAdaptor(d3Context) {
        var _this = _super.call(this) || this;
        _this.d3Context = d3Context;
        _this.event = d3Context.dispatch(layout_1.EventType[layout_1.EventType.start], layout_1.EventType[layout_1.EventType.tick], layout_1.EventType[layout_1.EventType.end]);
        var d3layout = _this;
        var drag;
        _this.drag = function () {
            if (!drag) {
                var drag = d3Context.drag()
                    .subject(layout_1.Layout.dragOrigin)
                    .on("start.d3adaptor", layout_1.Layout.dragStart)
                    .on("drag.d3adaptor", function (d) {
                    layout_1.Layout.drag(d, d3Context.event);
                    d3layout.resume();
                })
                    .on("end.d3adaptor", layout_1.Layout.dragEnd);
            }
            if (!arguments.length)
                return drag;
            arguments[0].call(drag);
        };
        return _this;
    }
    D3StyleLayoutAdaptor.prototype.trigger = function (e) {
        var d3event = { type: layout_1.EventType[e.type], alpha: e.alpha, stress: e.stress };
        this.event.call(d3event.type, d3event);
    };
    D3StyleLayoutAdaptor.prototype.kick = function () {
        var _this = this;
        var t = this.d3Context.timer(function () { return _super.prototype.tick.call(_this) && t.stop(); });
    };
    D3StyleLayoutAdaptor.prototype.on = function (eventType, listener) {
        if (typeof eventType === 'string') {
            this.event.on(eventType, listener);
        }
        else {
            this.event.on(layout_1.EventType[eventType], listener);
        }
        return this;
    };
    return D3StyleLayoutAdaptor;
}(layout_1.Layout));
exports.D3StyleLayoutAdaptor = D3StyleLayoutAdaptor;
//# sourceMappingURL=d3v4adaptor.js.map

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var shortestpaths_1 = __webpack_require__(4);
var descent_1 = __webpack_require__(5);
var rectangle_1 = __webpack_require__(3);
var linklengths_1 = __webpack_require__(6);
var Link3D = (function () {
    function Link3D(source, target) {
        this.source = source;
        this.target = target;
    }
    Link3D.prototype.actualLength = function (x) {
        var _this = this;
        return Math.sqrt(x.reduce(function (c, v) {
            var dx = v[_this.target] - v[_this.source];
            return c + dx * dx;
        }, 0));
    };
    return Link3D;
}());
exports.Link3D = Link3D;
var Node3D = (function () {
    function Node3D(x, y, z) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        this.x = x;
        this.y = y;
        this.z = z;
    }
    return Node3D;
}());
exports.Node3D = Node3D;
var Layout3D = (function () {
    function Layout3D(nodes, links, idealLinkLength) {
        if (idealLinkLength === void 0) { idealLinkLength = 1; }
        var _this = this;
        this.nodes = nodes;
        this.links = links;
        this.idealLinkLength = idealLinkLength;
        this.constraints = null;
        this.useJaccardLinkLengths = true;
        this.result = new Array(Layout3D.k);
        for (var i = 0; i < Layout3D.k; ++i) {
            this.result[i] = new Array(nodes.length);
        }
        nodes.forEach(function (v, i) {
            for (var _i = 0, _a = Layout3D.dims; _i < _a.length; _i++) {
                var dim = _a[_i];
                if (typeof v[dim] == 'undefined')
                    v[dim] = Math.random();
            }
            _this.result[0][i] = v.x;
            _this.result[1][i] = v.y;
            _this.result[2][i] = v.z;
        });
    }
    ;
    Layout3D.prototype.linkLength = function (l) {
        return l.actualLength(this.result);
    };
    Layout3D.prototype.start = function (iterations) {
        var _this = this;
        if (iterations === void 0) { iterations = 100; }
        var n = this.nodes.length;
        var linkAccessor = new LinkAccessor();
        if (this.useJaccardLinkLengths)
            linklengths_1.jaccardLinkLengths(this.links, linkAccessor, 1.5);
        this.links.forEach(function (e) { return e.length *= _this.idealLinkLength; });
        var distanceMatrix = (new shortestpaths_1.Calculator(n, this.links, function (e) { return e.source; }, function (e) { return e.target; }, function (e) { return e.length; })).DistanceMatrix();
        var D = descent_1.Descent.createSquareMatrix(n, function (i, j) { return distanceMatrix[i][j]; });
        var G = descent_1.Descent.createSquareMatrix(n, function () { return 2; });
        this.links.forEach(function (_a) {
            var source = _a.source, target = _a.target;
            return G[source][target] = G[target][source] = 1;
        });
        this.descent = new descent_1.Descent(this.result, D);
        this.descent.threshold = 1e-3;
        this.descent.G = G;
        if (this.constraints)
            this.descent.project = new rectangle_1.Projection(this.nodes, null, null, this.constraints).projectFunctions();
        for (var i = 0; i < this.nodes.length; i++) {
            var v = this.nodes[i];
            if (v.fixed) {
                this.descent.locks.add(i, [v.x, v.y, v.z]);
            }
        }
        this.descent.run(iterations);
        return this;
    };
    Layout3D.prototype.tick = function () {
        this.descent.locks.clear();
        for (var i = 0; i < this.nodes.length; i++) {
            var v = this.nodes[i];
            if (v.fixed) {
                this.descent.locks.add(i, [v.x, v.y, v.z]);
            }
        }
        return this.descent.rungeKutta();
    };
    Layout3D.dims = ['x', 'y', 'z'];
    Layout3D.k = Layout3D.dims.length;
    return Layout3D;
}());
exports.Layout3D = Layout3D;
var LinkAccessor = (function () {
    function LinkAccessor() {
    }
    LinkAccessor.prototype.getSourceIndex = function (e) { return e.source; };
    LinkAccessor.prototype.getTargetIndex = function (e) { return e.target; };
    LinkAccessor.prototype.getLength = function (e) { return e.length; };
    LinkAccessor.prototype.setLength = function (e, l) { e.length = l; };
    return LinkAccessor;
}());
//# sourceMappingURL=layout3d.js.map

/***/ })
/******/ ]);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCAwNWFiMmI0ZTMxMDZkNWMxNTUwMCIsIndlYnBhY2s6Ly8vLi9zcmMvY29sYS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi93ZWJjb2xhL2Rpc3Qvc3JjL2xheW91dC5qcyIsIndlYnBhY2s6Ly8vLi9+L3dlYmNvbGEvZGlzdC9zcmMvcmVjdGFuZ2xlLmpzIiwid2VicGFjazovLy8uL34vd2ViY29sYS9kaXN0L3NyYy9zaG9ydGVzdHBhdGhzLmpzIiwid2VicGFjazovLy8uL34vd2ViY29sYS9kaXN0L3NyYy9kZXNjZW50LmpzIiwid2VicGFjazovLy8uL34vd2ViY29sYS9kaXN0L3NyYy9saW5rbGVuZ3Rocy5qcyIsIndlYnBhY2s6Ly8vLi9+L3dlYmNvbGEvZGlzdC9zcmMvdnBzYy5qcyIsIndlYnBhY2s6Ly8vLi9+L3dlYmNvbGEvZGlzdC9zcmMvZ2VvbS5qcyIsIndlYnBhY2s6Ly8vLi9+L3dlYmNvbGEvZGlzdC9zcmMvZ3JpZHJvdXRlci5qcyIsIndlYnBhY2s6Ly8vLi9+L3dlYmNvbGEvZGlzdC9zcmMvaGFuZGxlZGlzY29ubmVjdGVkLmpzIiwid2VicGFjazovLy8uL34vd2ViY29sYS9kaXN0L3NyYy9wb3dlcmdyYXBoLmpzIiwid2VicGFjazovLy8uL34vd2ViY29sYS9kaXN0L3NyYy9wcXVldWUuanMiLCJ3ZWJwYWNrOi8vLy4vfi93ZWJjb2xhL2Rpc3Qvc3JjL3JidHJlZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXNzaWduLmpzIiwid2VicGFjazovLy8uL3NyYy9kZWZhdWx0cy5qcyIsIndlYnBhY2s6Ly8vLi9+L3dlYmNvbGEvZGlzdC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L3dlYmNvbGEvZGlzdC9zcmMvYWRhcHRvci5qcyIsIndlYnBhY2s6Ly8vLi9+L3dlYmNvbGEvZGlzdC9zcmMvYmF0Y2guanMiLCJ3ZWJwYWNrOi8vLy4vfi93ZWJjb2xhL2Rpc3Qvc3JjL2QzYWRhcHRvci5qcyIsIndlYnBhY2s6Ly8vLi9+L3dlYmNvbGEvZGlzdC9zcmMvZDN2M2FkYXB0b3IuanMiLCJ3ZWJwYWNrOi8vLy4vfi93ZWJjb2xhL2Rpc3Qvc3JjL2QzdjRhZGFwdG9yLmpzIiwid2VicGFjazovLy8uL34vd2ViY29sYS9kaXN0L3NyYy9sYXlvdXQzZC5qcyJdLCJuYW1lcyI6WyJhc3NpZ24iLCJyZXF1aXJlIiwiZGVmYXVsdHMiLCJjb2xhIiwid2luZG93IiwicmFmIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwid2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwibW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwibXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJpc1N0cmluZyIsIm8iLCJpc051bWJlciIsImlzT2JqZWN0IiwiaXNGdW5jdGlvbiIsIm5vcCIsImdldE9wdFZhbCIsInZhbCIsImVsZSIsImZuIiwiYXBwbHkiLCJDb2xhTGF5b3V0Iiwib3B0aW9ucyIsInByb3RvdHlwZSIsInJ1biIsImxheW91dCIsIm1hbnVhbGx5U3RvcHBlZCIsImN5IiwiZWxlcyIsIm5vZGVzIiwiZWRnZXMiLCJyZWFkeSIsImJiIiwiYm91bmRpbmdCb3giLCJ4MSIsInkxIiwidyIsIndpZHRoIiwiaCIsImhlaWdodCIsIngyIiwidW5kZWZpbmVkIiwieTIiLCJ1cGRhdGVOb2RlUG9zaXRpb25zIiwiaSIsImxlbmd0aCIsIm5vZGUiLCJkaW1lbnNpb25zIiwibGF5b3V0RGltZW5zaW9ucyIsInNjcmF0Y2giLCJ1cGRhdGVkRGltcyIsInBhZGRpbmciLCJub2RlU3BhY2luZyIsInBvc2l0aW9ucyIsInJldFBvcyIsImdyYWJiZWQiLCJpc1BhcmVudCIsIngiLCJ5IiwidXBkYXRlQ29tcG91bmRCb3VuZHMiLCJvblJlYWR5IiwiZml0Iiwib25Eb25lIiwidW5ncmFiaWZ5V2hpbGVTaW11bGF0aW5nIiwiZ3JhYmJhYmxlTm9kZXMiLCJncmFiaWZ5Iiwib2ZmIiwiZGVzdHJveUhhbmRsZXIiLCJncmFiSGFuZGxlciIsImxvY2tIYW5kbGVyIiwib25lIiwic3RvcCIsInRyaWdnZXIiLCJ0eXBlIiwidGlja3NQZXJGcmFtZSIsInJlZnJlc2giLCJNYXRoIiwibWF4IiwiYWRhcHRvciIsImUiLCJUSUNLIiwiRXZlbnRUeXBlIiwidGljayIsIkVORCIsImVuZCIsImFuaW1hdGUiLCJpbmZpbml0ZSIsImtpY2siLCJpbmZ0aWNrIiwicmV0IiwicmVzdW1lIiwibXVsdGl0aWNrIiwiZnJhbWUiLCJvbiIsImRyYWciLCJmaWx0ZXIiLCJ1bmdyYWJpZnkiLCJzY3JDb2xhIiwicG9zIiwicG9zaXRpb24iLCJub2RlSXNUYXJnZXQiLCJjeVRhcmdldCIsInRhcmdldCIsImRyYWdzdGFydCIsImRyYWdlbmQiLCJweCIsInB5IiwiZml4ZWQiLCJsb2NrZWQiLCJub25wYXJlbnROb2RlcyIsInN0ZEZpbHRlciIsIm1hcCIsInN0cnVjdCIsInJhbmRvbWl6ZSIsInJvdW5kIiwicmFuZG9tIiwiaW5kZXgiLCJjb25zdHJhaW50cyIsImFsaWdubWVudCIsIm9mZnNldHNYIiwib2Zmc2V0c1kiLCJmb3JFYWNoIiwiYWxpZ24iLCJwdXNoIiwib2Zmc2V0IiwiYXhpcyIsIm9mZnNldHMiLCJnYXBJbmVxdWFsaXRpZXMiLCJsZWZ0SW5kZXgiLCJpbmVxdWFsaXR5IiwibGVmdCIsInJpZ2h0SW5kZXgiLCJyaWdodCIsImdhcCIsImVxdWFsaXR5IiwiZ3JvdXBzIiwib3B0UGFkZGluZyIsImdldFBhZGRpbmciLCJkIiwicGFyc2VGbG9hdCIsInN0eWxlIiwicGxlZnQiLCJwcmlnaHQiLCJwdG9wIiwicGJvdHRvbSIsImxlYXZlcyIsImNoaWxkcmVuIiwiY2hpbGQiLCJsZW5ndGhGbk5hbWUiLCJlZGdlTGVuZ3RoIiwiZWRnZVN5bURpZmZMZW5ndGgiLCJlZGdlSmFjY2FyZExlbmd0aCIsImxlbmd0aEdldHRlciIsImxpbmsiLCJjYWxjTGVuZ3RoIiwibGlua3MiLCJlZGdlIiwic291cmNlIiwiYyIsInNpemUiLCJmbG93IiwiZGVmQXhpcyIsImRlZk1pblNlcCIsIm1pblNlcGFyYXRpb24iLCJmbG93TGF5b3V0IiwiYXZvaWRPdmVybGFwcyIsImF2b2lkT3ZlcmxhcCIsImhhbmRsZURpc2Nvbm5lY3RlZCIsInN0YXJ0IiwidW5jb25zdHJJdGVyIiwidXNlckNvbnN0SXRlciIsImFsbENvbnN0SXRlciIsInNldFRpbWVvdXQiLCJtYXhTaW11bGF0aW9uVGltZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJpbXBsIiwicmVnaXN0ZXIiLCJjeXRvc2NhcGUiLCJPYmplY3QiLCJiaW5kIiwidGd0Iiwic3JjcyIsImtleXMiLCJzcmMiLCJrIiwibm9kZURpbWVuc2lvbnNJbmNsdWRlTGFiZWxzIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTztBQ1ZBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxtREFBMkMsY0FBYzs7QUFFekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNoRUEsSUFBTUEsU0FBUyxtQkFBQUMsQ0FBUSxFQUFSLENBQWY7QUFDQSxJQUFNQyxXQUFXLG1CQUFBRCxDQUFRLEVBQVIsQ0FBakI7QUFDQSxJQUFNRSxPQUFPLG1CQUFBRixDQUFRLEVB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUNBQXFDLDRFQUE0RSxFQUFFO0FBQ25IO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QjtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLDJCQUEyQjtBQUM3RCxrQ0FBa0MsMkJBQTJCO0FBQzdELGtDQUFrQyw0QkFBNEI7QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1Q0FBdUMscUJBQXFCLEVBQUU7QUFDOUQ7QUFDQTtBQUNBO0FB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QUNBO0FBQ0E7QUFDQTtBQUNBLGdEQUFnRCxRQUFRO0FBQ3hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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eUVBQXlFLDZCQUE2QixFQUFFO0FBQ3hHLHFFQUFxRSxVQUFVLEVBQUU7QUFDakY7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsdUJBQXVCO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLHVCQUF1QjtBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBEQUEwRCxpQkFBaUI7QUFDM0UsMERBQTBELGlCQUFpQjtBQUMzRSxxREFBcUQsaUJBQWlCO0FBQ3RFLHdEQUF3RCxjQUFjO0FBQ3RFO0FBQ0EsQ0FBQztBQUNELG9DIiwiZmlsZSI6ImN5dG9zY2FwZS1jb2xhLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiY3l0b3NjYXBlQ29sYVwiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJjeXRvc2NhcGVDb2xhXCJdID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24oKSB7XG5yZXR1cm4gXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbiIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGlkZW50aXR5IGZ1bmN0aW9uIGZvciBjYWxsaW5nIGhhcm1vbnkgaW1wb3J0cyB3aXRoIHRoZSBjb3JyZWN0IGNvbnRleHRcbiBcdF9fd2VicGFja19yZXF1aXJlX18uaSA9IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfTtcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMSk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgMDVhYjJiNGUzMTA2ZDVjMTU1MDAiLCJjb25zdCBhc3NpZ24gPSByZXF1aXJlKCcuL2Fzc2lnbicpO1xuY29uc3QgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5jb25zdCBjb2xhID0gcmVxdWlyZSgnd2ViY29sYScpIHx8ICggdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuY29sYSA6IG51bGwgKTtcbmNvbnN0IHJhZiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZTtcbmNvbnN0IGlzU3RyaW5nID0gZnVuY3Rpb24obyl7IHJldHVybiB0eXBlb2YgbyA9PT0gdHlwZW9mICcnOyB9O1xuY29uc3QgaXNOdW1iZXIgPSBmdW5jdGlvbihvKXsgcmV0dXJuIHR5cGVvZiBvID09PSB0eXBlb2YgMDsgfTtcbmNvbnN0IGlzT2JqZWN0ID0gZnVuY3Rpb24obyl7IHJldHVybiBvICE9IG51bGwgJiYgdHlwZW9mIG8gPT09IHR5cGVvZiB7fTsgfTtcbmNvbnN0IGlzRnVuY3Rpb24gPSBmdW5jdGlvbihvKXsgcmV0dXJuIG8gIT0gbnVsbCAmJiB0eXBlb2YgbyA9PT0gdHlwZW9mIGZ1bmN0aW9uKCl7fTsgfTtcbmNvbnN0IG5vcCA9IGZ1bmN0aW9uKCl7fTtcblxuY29uc3QgZ2V0T3B0VmFsID0gZnVuY3Rpb24oIHZhbCwgZWxlICl7XG4gIGlmKCBpc0Z1bmN0aW9uKHZhbCkgKXtcbiAgICBsZXQgZm4gPSB2YWw7XG4gICAgcmV0dXJuIGZuLmFwcGx5KCBlbGUsIFsgZWxlIF0gKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdmFsO1xuICB9XG59O1xuXG4vLyBjb25zdHJ1Y3RvclxuLy8gb3B0aW9ucyA6IG9iamVjdCBjb250YWluaW5nIGxheW91dCBvcHRpb25zXG5mdW5jdGlvbiBDb2xhTGF5b3V0KCBvcHRpb25zICl7XG4gIHRoaXMub3B0aW9ucyA9IGFzc2lnbigge30sIGRlZmF1bHRzLCBvcHRpb25zICk7XG59XG5cbi8vIHJ1bnMgdGhlIGxheW91dFxuQ29sYUxheW91dC5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24oKXtcbiAgbGV0IGxheW91dCA9IHRoaXM7XG4gIGxldCBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG4gIGxheW91dC5tYW51YWxseVN0b3BwZWQgPSBmYWxzZTtcblxuICBsZXQgY3kgPSBvcHRpb25zLmN5OyAvLyBjeSBpcyBhdXRvbWF0aWNhbGx5IHBvcHVsYXRlZCBmb3IgdXMgaW4gdGhlIGNvbnN0cnVjdG9yXG4gIGxldCBlbGVzID0gb3B0aW9ucy5lbGVzO1xuICBsZXQgbm9kZXMgPSBlbGVzLm5vZGVzKCk7XG4gIGxldCBlZGdlcyA9IGVsZXMuZWRnZXMoKTtcbiAgbGV0IHJlYWR5ID0gZmFsc2U7XG5cbiAgbGV0IGJiID0gb3B0aW9ucy5ib3VuZGluZ0JveCB8fCB7IHgxOiAwLCB5MTogMCwgdzogY3kud2lkdGgoKSwgaDogY3kuaGVpZ2h0KCkgfTtcbiAgaWYoIGJiLngyID09PSB1bmRlZmluZWQgKXsgYmIueDIgPSBiYi54MSArIGJiLnc7IH1cbiAgaWYoIGJiLncgPT09IHVuZGVmaW5lZCApeyBiYi53ID0gYmIueDIgLSBiYi54MTsgfVxuICBpZiggYmIueTIgPT09IHVuZGVmaW5lZCApeyBiYi55MiA9IGJiLnkxICsgYmIuaDsgfVxuICBpZiggYmIuaCA9PT0gdW5kZWZpbmVkICl7IGJiLmggPSBiYi55MiAtIGJiLnkxOyB9XG5cbiAgbGV0IHVwZGF0ZU5vZGVQb3NpdGlvbnMgPSBmdW5jdGlvbigpe1xuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKysgKXtcbiAgICAgIGxldCBub2RlID0gbm9kZXNbaV07XG4gICAgICBsZXQgZGltZW5zaW9ucyA9IG5vZGUubGF5b3V0RGltZW5zaW9ucyggb3B0aW9ucyApO1xuICAgICAgbGV0IHNjcmF0Y2ggPSBub2RlLnNjcmF0Y2goJ2NvbGEnKTtcblxuICAgICAgLy8gdXBkYXRlIG5vZGUgZGltc1xuICAgICAgaWYoICFzY3JhdGNoLnVwZGF0ZWREaW1zICl7XG4gICAgICAgIGxldCBwYWRkaW5nID0gZ2V0T3B0VmFsKCBvcHRpb25zLm5vZGVTcGFjaW5nLCBub2RlICk7XG5cbiAgICAgICAgc2NyYXRjaC53aWR0aCA9IGRpbWVuc2lvbnMudyArIDIqcGFkZGluZztcbiAgICAgICAgc2NyYXRjaC5oZWlnaHQgPSBkaW1lbnNpb25zLmggKyAyKnBhZGRpbmc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbm9kZXMucG9zaXRpb25zKGZ1bmN0aW9uKG5vZGUsIGkpe1xuICAgICAgLy8gUGVyZm9ybSAyLnggYW5kIDEueCBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSBjaGVja1xuICAgICAgaWYoIGlzTnVtYmVyKG5vZGUpICl7XG4gICAgICAgIG5vZGUgPSBpO1xuICAgICAgfVxuICAgICAgbGV0IHNjcmF0Y2ggPSBub2RlLnNjcmF0Y2goKS5jb2xhO1xuICAgICAgbGV0IHJldFBvcztcblxuICAgICAgaWYoICFub2RlLmdyYWJiZWQoKSAmJiAhbm9kZS5pc1BhcmVudCgpICl7XG4gICAgICAgIHJldFBvcyA9IHtcbiAgICAgICAgICB4OiBiYi54MSArIHNjcmF0Y2gueCxcbiAgICAgICAgICB5OiBiYi55MSArIHNjcmF0Y2gueVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmKCAhaXNOdW1iZXIocmV0UG9zLngpIHx8ICFpc051bWJlcihyZXRQb3MueSkgKXtcbiAgICAgICAgICByZXRQb3MgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJldFBvcztcbiAgICB9KTtcblxuICAgIG5vZGVzLnVwZGF0ZUNvbXBvdW5kQm91bmRzKCk7IC8vIGJlY2F1c2UgdGhlIHdheSB0aGlzIGxheW91dCBzZXRzIHBvc2l0aW9ucyBpcyBidWdneSBmb3Igc29tZSByZWFzb247IHJlZiAjODc4XG5cbiAgICBpZiggIXJlYWR5ICl7XG4gICAgICBvblJlYWR5KCk7XG4gICAgICByZWFkeSA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYoIG9wdGlvbnMuZml0ICl7XG4gICAgICBjeS5maXQoIG9wdGlvbnMucGFkZGluZyApO1xuICAgIH1cbiAgfTtcblxuICBsZXQgb25Eb25lID0gZnVuY3Rpb24oKXtcbiAgICBpZiggb3B0aW9ucy51bmdyYWJpZnlXaGlsZVNpbXVsYXRpbmcgKXtcbiAgICAgIGdyYWJiYWJsZU5vZGVzLmdyYWJpZnkoKTtcbiAgICB9XG5cbiAgICBjeS5vZmYoJ2Rlc3Ryb3knLCBkZXN0cm95SGFuZGxlcik7XG5cbiAgICBub2Rlcy5vZmYoJ2dyYWIgZnJlZSBwb3NpdGlvbicsIGdyYWJIYW5kbGVyKTtcbiAgICBub2Rlcy5vZmYoJ2xvY2sgdW5sb2NrJywgbG9ja0hhbmRsZXIpO1xuXG4gICAgLy8gdHJpZ2dlciBsYXlvdXRzdG9wIHdoZW4gdGhlIGxheW91dCBzdG9wcyAoZS5nLiBmaW5pc2hlcylcbiAgICBsYXlvdXQub25lKCdsYXlvdXRzdG9wJywgb3B0aW9ucy5zdG9wKTtcbiAgICBsYXlvdXQudHJpZ2dlcih7IHR5cGU6ICdsYXlvdXRzdG9wJywgbGF5b3V0OiBsYXlvdXQgfSk7XG4gIH07XG5cbiAgbGV0IG9uUmVhZHkgPSBmdW5jdGlvbigpe1xuICAgIC8vIHRyaWdnZXIgbGF5b3V0cmVhZHkgd2hlbiBlYWNoIG5vZGUgaGFzIGhhZCBpdHMgcG9zaXRpb24gc2V0IGF0IGxlYXN0IG9uY2VcbiAgICBsYXlvdXQub25lKCdsYXlvdXRyZWFkeScsIG9wdGlvbnMucmVhZHkpO1xuICAgIGxheW91dC50cmlnZ2VyKHsgdHlwZTogJ2xheW91dHJlYWR5JywgbGF5b3V0OiBsYXlvdXQgfSk7XG4gIH07XG5cbiAgbGV0IHRpY2tzUGVyRnJhbWUgPSBvcHRpb25zLnJlZnJlc2g7XG5cbiAgaWYoIG9wdGlvbnMucmVmcmVzaCA8IDAgKXtcbiAgICB0aWNrc1BlckZyYW1lID0gMTtcbiAgfSBlbHNlIHtcbiAgICB0aWNrc1BlckZyYW1lID0gTWF0aC5tYXgoIDEsIHRpY2tzUGVyRnJhbWUgKTsgLy8gYXQgbGVhc3QgMVxuICB9XG5cbiAgbGV0IGFkYXB0b3IgPSBsYXlvdXQuYWRhcHRvciA9IGNvbGEuYWRhcHRvcih7XG4gICAgdHJpZ2dlcjogZnVuY3Rpb24oIGUgKXsgLy8gb24gc2ltIGV2ZW50XG4gICAgICBsZXQgVElDSyA9IGNvbGEuRXZlbnRUeXBlID8gY29sYS5FdmVudFR5cGUudGljayA6IG51bGw7XG4gICAgICBsZXQgRU5EID0gY29sYS5FdmVudFR5cGUgPyBjb2xhLkV2ZW50VHlwZS5lbmQgOiBudWxsO1xuXG4gICAgICBzd2l0Y2goIGUudHlwZSApe1xuICAgICAgICBjYXNlICd0aWNrJzpcbiAgICAgICAgY2FzZSBUSUNLOlxuICAgICAgICAgIGlmKCBvcHRpb25zLmFuaW1hdGUgKXtcbiAgICAgICAgICAgIHVwZGF0ZU5vZGVQb3NpdGlvbnMoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnZW5kJzpcbiAgICAgICAgY2FzZSBFTkQ6XG4gICAgICAgICAgdXBkYXRlTm9kZVBvc2l0aW9ucygpO1xuICAgICAgICAgIGlmKCAhb3B0aW9ucy5pbmZpbml0ZSApeyBvbkRvbmUoKTsgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBraWNrOiBmdW5jdGlvbigpeyAvLyBraWNrIG9mZiB0aGUgc2ltdWxhdGlvblxuICAgICAgLy9sZXQgc2tpcCA9IDA7XG5cbiAgICAgIGxldCBpbmZ0aWNrID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaWYoIGxheW91dC5tYW51YWxseVN0b3BwZWQgKXtcbiAgICAgICAgICBvbkRvbmUoKTtcblxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJldCA9IGFkYXB0b3IudGljaygpO1xuXG4gICAgICAgIGlmKCByZXQgJiYgb3B0aW9ucy5pbmZpbml0ZSApeyAvLyByZXN1bWUgbGF5b3V0IGlmIGRvbmVcbiAgICAgICAgICBhZGFwdG9yLnJlc3VtZSgpOyAvLyByZXN1bWUgPT4gbmV3IGtpY2tcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXQ7IC8vIGFsbG93IHJlZ3VsYXIgZmluaXNoIGIvYyBvZiBuZXcga2lja1xuICAgICAgfTtcblxuICAgICAgbGV0IG11bHRpdGljayA9IGZ1bmN0aW9uKCl7IC8vIG11bHRpcGxlIHRpY2tzIGluIGEgcm93XG4gICAgICAgIGxldCByZXQ7XG5cbiAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0aWNrc1BlckZyYW1lICYmICFyZXQ7IGkrKyApe1xuICAgICAgICAgIHJldCA9IHJldCB8fCBpbmZ0aWNrKCk7IC8vIHBpY2sgdXAgdHJ1ZSByZXQgdmFscyA9PiBzaW0gZG9uZVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH07XG5cbiAgICAgIGlmKCBvcHRpb25zLmFuaW1hdGUgKXtcbiAgICAgICAgbGV0IGZyYW1lID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICBpZiggbXVsdGl0aWNrKCkgKXsgcmV0dXJuOyB9XG5cbiAgICAgICAgICByYWYoIGZyYW1lICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmFmKCBmcmFtZSApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2hpbGUoICFpbmZ0aWNrKCkgKXtcbiAgICAgICAgICAvLyBrZWVwIGdvaW5nLi4uXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgb246IG5vcCwgLy8gZHVtbXk7IG5vdCBuZWVkZWRcblxuICAgIGRyYWc6IG5vcCAvLyBub3QgbmVlZGVkIGZvciBvdXIgY2FzZVxuICB9KTtcbiAgbGF5b3V0LmFkYXB0b3IgPSBhZGFwdG9yO1xuXG4gIC8vIGlmIHNldCBubyBncmFiYmluZyBkdXJpbmcgbGF5b3V0XG4gIGxldCBncmFiYmFibGVOb2RlcyA9IG5vZGVzLmZpbHRlcignOmdyYWJiYWJsZScpO1xuICBpZiggb3B0aW9ucy51bmdyYWJpZnlXaGlsZVNpbXVsYXRpbmcgKXtcbiAgICBncmFiYmFibGVOb2Rlcy51bmdyYWJpZnkoKTtcbiAgfVxuXG4gIGxldCBkZXN0cm95SGFuZGxlcjtcbiAgY3kub25lKCdkZXN0cm95JywgZGVzdHJveUhhbmRsZXIgPSBmdW5jdGlvbigpe1xuICAgIGxheW91dC5zdG9wKCk7XG4gIH0pO1xuXG4gIC8vIGhhbmRsZSBub2RlIGRyYWdnaW5nXG4gIGxldCBncmFiSGFuZGxlcjtcbiAgbm9kZXMub24oJ2dyYWIgZnJlZSBwb3NpdGlvbicsIGdyYWJIYW5kbGVyID0gZnVuY3Rpb24oZSl7XG4gICAgbGV0IG5vZGUgPSB0aGlzO1xuICAgIGxldCBzY3JDb2xhID0gbm9kZS5zY3JhdGNoKCkuY29sYTtcbiAgICBsZXQgcG9zID0gbm9kZS5wb3NpdGlvbigpO1xuICAgIGxldCBub2RlSXNUYXJnZXQgPSBlLmN5VGFyZ2V0ID09PSBub2RlIHx8IGUudGFyZ2V0ID09PSBub2RlO1xuXG4gICAgaWYoICFub2RlSXNUYXJnZXQgKXsgcmV0dXJuOyB9XG5cbiAgICBzd2l0Y2goIGUudHlwZSApe1xuICAgICAgY2FzZSAnZ3JhYic6XG4gICAgICAgIGFkYXB0b3IuZHJhZ3N0YXJ0KCBzY3JDb2xhICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZnJlZSc6XG4gICAgICAgIGFkYXB0b3IuZHJhZ2VuZCggc2NyQ29sYSApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Bvc2l0aW9uJzpcbiAgICAgICAgLy8gb25seSB1cGRhdGUgd2hlbiBkaWZmZXJlbnQgKGkuZS4gbWFudWFsIC5wb3NpdGlvbigpIGNhbGwgb3IgZHJhZykgc28gd2UgZG9uJ3QgbG9vcCBuZWVkbGVzc2x5XG4gICAgICAgIGlmKCBzY3JDb2xhLnB4ICE9PSBwb3MueCAtIGJiLngxIHx8IHNjckNvbGEucHkgIT09IHBvcy55IC0gYmIueTEgKXtcbiAgICAgICAgICBzY3JDb2xhLnB4ID0gcG9zLnggLSBiYi54MTtcbiAgICAgICAgICBzY3JDb2xhLnB5ID0gcG9zLnkgLSBiYi55MTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgfSk7XG5cbiAgbGV0IGxvY2tIYW5kbGVyO1xuICBub2Rlcy5vbignbG9jayB1bmxvY2snLCBsb2NrSGFuZGxlciA9IGZ1bmN0aW9uKCl7XG4gICAgbGV0IG5vZGUgPSB0aGlzO1xuICAgIGxldCBzY3JDb2xhID0gbm9kZS5zY3JhdGNoKCkuY29sYTtcblxuICAgIHNjckNvbGEuZml4ZWQgPSBub2RlLmxvY2tlZCgpO1xuXG4gICAgaWYoIG5vZGUubG9ja2VkKCkgKXtcbiAgICAgIGFkYXB0b3IuZHJhZ3N0YXJ0KCBzY3JDb2xhICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFkYXB0b3IuZHJhZ2VuZCggc2NyQ29sYSApO1xuICAgIH1cbiAgfSk7XG5cbiAgbGV0IG5vbnBhcmVudE5vZGVzID0gbm9kZXMuc3RkRmlsdGVyKGZ1bmN0aW9uKCBub2RlICl7XG4gICAgcmV0dXJuICFub2RlLmlzUGFyZW50KCk7XG4gIH0pO1xuXG4gIC8vIGFkZCBub2RlcyB0byBjb2xhXG4gIGFkYXB0b3Iubm9kZXMoIG5vbnBhcmVudE5vZGVzLm1hcChmdW5jdGlvbiggbm9kZSwgaSApe1xuICAgIGxldCBwYWRkaW5nID0gZ2V0T3B0VmFsKCBvcHRpb25zLm5vZGVTcGFjaW5nLCBub2RlICk7XG4gICAgbGV0IHBvcyA9IG5vZGUucG9zaXRpb24oKTtcbiAgICBsZXQgZGltZW5zaW9ucyA9IG5vZGUubGF5b3V0RGltZW5zaW9ucyggb3B0aW9ucyApO1xuXG4gICAgbGV0IHN0cnVjdCA9IG5vZGUuc2NyYXRjaCgpLmNvbGEgPSB7XG4gICAgICB4OiBvcHRpb25zLnJhbmRvbWl6ZSB8fCBwb3MueCA9PT0gdW5kZWZpbmVkID8gTWF0aC5yb3VuZCggTWF0aC5yYW5kb20oKSAqIGJiLncgKSA6IHBvcy54LFxuICAgICAgeTogb3B0aW9ucy5yYW5kb21pemUgfHwgcG9zLnkgPT09IHVuZGVmaW5lZCA/IE1hdGgucm91bmQoIE1hdGgucmFuZG9tKCkgKiBiYi5oICkgOiBwb3MueSxcbiAgICAgIHdpZHRoOiBkaW1lbnNpb25zLncgKyAyKnBhZGRpbmcsXG4gICAgICBoZWlnaHQ6IGRpbWVuc2lvbnMuaCArIDIqcGFkZGluZyxcbiAgICAgIGluZGV4OiBpLFxuICAgICAgZml4ZWQ6IG5vZGUubG9ja2VkKClcbiAgICB9O1xuXG4gICAgcmV0dXJuIHN0cnVjdDtcbiAgfSkgKTtcblxuICAvLyB0aGUgY29uc3RyYWludHMgdG8gYmUgYWRkZWQgb24gbm9kZXNcbiAgbGV0IGNvbnN0cmFpbnRzID0gW107XG5cbiAgaWYoIG9wdGlvbnMuYWxpZ25tZW50ICl7IC8vIHRoZW4gc2V0IGFsaWdubWVudCBjb25zdHJhaW50c1xuXG4gICAgbGV0IG9mZnNldHNYID0gW107XG4gICAgbGV0IG9mZnNldHNZID0gW107XG5cbiAgICBub25wYXJlbnROb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKCBub2RlICl7XG4gICAgICBsZXQgYWxpZ24gPSBnZXRPcHRWYWwoIG9wdGlvbnMuYWxpZ25tZW50LCBub2RlICk7XG4gICAgICBsZXQgc2NyQ29sYSA9IG5vZGUuc2NyYXRjaCgpLmNvbGE7XG4gICAgICBsZXQgaW5kZXggPSBzY3JDb2xhLmluZGV4O1xuXG4gICAgICBpZiggIWFsaWduICl7IHJldHVybjsgfVxuXG4gICAgICBpZiggYWxpZ24ueCAhPSBudWxsICl7XG4gICAgICAgIG9mZnNldHNYLnB1c2goe1xuICAgICAgICAgIG5vZGU6IGluZGV4LFxuICAgICAgICAgIG9mZnNldDogYWxpZ24ueFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYoIGFsaWduLnkgIT0gbnVsbCApe1xuICAgICAgICBvZmZzZXRzWS5wdXNoKHtcbiAgICAgICAgICBub2RlOiBpbmRleCxcbiAgICAgICAgICBvZmZzZXQ6IGFsaWduLnlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiggb2Zmc2V0c1gubGVuZ3RoID4gMCApe1xuICAgICAgY29uc3RyYWludHMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdhbGlnbm1lbnQnLFxuICAgICAgICBheGlzOiAneCcsXG4gICAgICAgIG9mZnNldHM6IG9mZnNldHNYXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiggb2Zmc2V0c1kubGVuZ3RoID4gMCApe1xuICAgICAgY29uc3RyYWludHMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdhbGlnbm1lbnQnLFxuICAgICAgICBheGlzOiAneScsXG4gICAgICAgIG9mZnNldHM6IG9mZnNldHNZXG4gICAgICB9KTtcbiAgICB9XG5cbiAgfVxuXG4gIC8vIGlmIGdhcEluZXF1YWxpdGllcyB2YXJpYWJsZSBpcyBzZXQgYWRkIGVhY2ggaW5lcXVhbGl0eSBjb25zdHJhaW50IHRvIGxpc3Qgb2YgY29uc3RyYWludHNcbiAgaWYgKCBvcHRpb25zLmdhcEluZXF1YWxpdGllcyApIHtcbiAgICBvcHRpb25zLmdhcEluZXF1YWxpdGllcy5mb3JFYWNoKCBpbmVxdWFsaXR5ID0+IHtcblxuICAgICAgLy8gZm9yIHRoZSBjb25zdHJhaW50cyB0byBiZSBwYXNzZWQgdG8gY29sYSBsYXlvdXQgYWRhcHRvciB1c2UgaW5kaWNlcyBvZiBub2RlcyxcbiAgICAgIC8vIG5vdCB0aGUgbm9kZXMgdGhlbXNlbHZlc1xuICAgICAgbGV0IGxlZnRJbmRleCA9IGluZXF1YWxpdHkubGVmdC5zY3JhdGNoKCkuY29sYS5pbmRleDtcbiAgICAgIGxldCByaWdodEluZGV4ID0gaW5lcXVhbGl0eS5yaWdodC5zY3JhdGNoKCkuY29sYS5pbmRleDtcblxuICAgICAgY29uc3RyYWludHMucHVzaCh7XG4gICAgICAgIGF4aXM6IGluZXF1YWxpdHkuYXhpcyxcbiAgICAgICAgbGVmdDogbGVmdEluZGV4LFxuICAgICAgICByaWdodDogcmlnaHRJbmRleCxcbiAgICAgICAgZ2FwOiBpbmVxdWFsaXR5LmdhcCxcbiAgICAgICAgZXF1YWxpdHk6IGluZXF1YWxpdHkuZXF1YWxpdHlcbiAgICAgIH0pO1xuXG4gICAgfSApO1xuICB9XG5cbiAgLy8gYWRkIGNvbnN0cmFpbnRzIGlmIGFueVxuICBpZiAoIGNvbnN0cmFpbnRzLmxlbmd0aCA+IDAgKSB7XG4gICAgICBhZGFwdG9yLmNvbnN0cmFpbnRzKCBjb25zdHJhaW50cyApO1xuICB9XG5cbiAgLy8gYWRkIGNvbXBvdW5kIG5vZGVzIHRvIGNvbGFcbiAgYWRhcHRvci5ncm91cHMoIG5vZGVzLnN0ZEZpbHRlcihmdW5jdGlvbiggbm9kZSApe1xuICAgIHJldHVybiBub2RlLmlzUGFyZW50KCk7XG4gIH0pLm1hcChmdW5jdGlvbiggbm9kZSwgaSApeyAvLyBhZGQgYmFzaWMgZ3JvdXAgaW5jbCBsZWFmIG5vZGVzXG4gICAgbGV0IG9wdFBhZGRpbmcgPSBnZXRPcHRWYWwoIG9wdGlvbnMubm9kZVNwYWNpbmcsIG5vZGUgKTtcbiAgICBsZXQgZ2V0UGFkZGluZyA9IGZ1bmN0aW9uKGQpe1xuICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoIG5vZGUuc3R5bGUoJ3BhZGRpbmctJytkKSApO1xuICAgIH07XG5cbiAgICBsZXQgcGxlZnQgPSBnZXRQYWRkaW5nKCdsZWZ0JykgKyBvcHRQYWRkaW5nO1xuICAgIGxldCBwcmlnaHQgPSBnZXRQYWRkaW5nKCdyaWdodCcpICsgb3B0UGFkZGluZztcbiAgICBsZXQgcHRvcCA9IGdldFBhZGRpbmcoJ3RvcCcpICsgb3B0UGFkZGluZztcbiAgICBsZXQgcGJvdHRvbSA9IGdldFBhZGRpbmcoJ2JvdHRvbScpICsgb3B0UGFkZGluZztcblxuICAgIG5vZGUuc2NyYXRjaCgpLmNvbGEgPSB7XG4gICAgICBpbmRleDogaSxcblxuICAgICAgcGFkZGluZzogTWF0aC5tYXgoIHBsZWZ0LCBwcmlnaHQsIHB0b3AsIHBib3R0b20gKSxcblxuICAgICAgLy8gbGVhdmVzIHNob3VsZCBvbmx5IGNvbnRhaW4gZGlyZWN0IGRlc2NlbmRhbnRzIChjaGlsZHJlbiksXG4gICAgICAvLyBub3QgdGhlIGxlYXZlcyBvZiBuZXN0ZWQgY29tcG91bmQgbm9kZXMgb3IgYW55IG5vZGVzIHRoYXQgYXJlIGNvbXBvdW5kcyB0aGVtc2VsdmVzXG4gICAgICBsZWF2ZXM6IG5vZGUuY2hpbGRyZW4oKS5zdGRGaWx0ZXIoZnVuY3Rpb24oIGNoaWxkICl7XG4gICAgICAgIHJldHVybiAhY2hpbGQuaXNQYXJlbnQoKTtcbiAgICAgIH0pLm1hcChmdW5jdGlvbiggY2hpbGQgKXtcbiAgICAgICAgcmV0dXJuIGNoaWxkWzBdLnNjcmF0Y2goKS5jb2xhLmluZGV4O1xuICAgICAgfSksXG5cbiAgICAgIGZpeGVkOiBub2RlLmxvY2tlZCgpXG4gICAgfTtcblxuICAgIHJldHVybiBub2RlO1xuICB9KS5tYXAoZnVuY3Rpb24oIG5vZGUgKXsgLy8gYWRkIHN1Ymdyb3Vwc1xuICAgIG5vZGUuc2NyYXRjaCgpLmNvbGEuZ3JvdXBzID0gbm9kZS5jaGlsZHJlbigpLnN0ZEZpbHRlcihmdW5jdGlvbiggY2hpbGQgKXtcbiAgICAgIHJldHVybiBjaGlsZC5pc1BhcmVudCgpO1xuICAgIH0pLm1hcChmdW5jdGlvbiggY2hpbGQgKXtcbiAgICAgIHJldHVybiBjaGlsZC5zY3JhdGNoKCkuY29sYS5pbmRleDtcbiAgICB9KTtcblxuICAgIHJldHVybiBub2RlLnNjcmF0Y2goKS5jb2xhO1xuICB9KSApO1xuXG4gIC8vIGdldCB0aGUgZWRnZSBsZW5ndGggc2V0dGluZyBtZWNoYW5pc21cbiAgbGV0IGxlbmd0aDtcbiAgbGV0IGxlbmd0aEZuTmFtZTtcbiAgaWYoIG9wdGlvbnMuZWRnZUxlbmd0aCAhPSBudWxsICl7XG4gICAgbGVuZ3RoID0gb3B0aW9ucy5lZGdlTGVuZ3RoO1xuICAgIGxlbmd0aEZuTmFtZSA9ICdsaW5rRGlzdGFuY2UnO1xuICB9IGVsc2UgaWYoIG9wdGlvbnMuZWRnZVN5bURpZmZMZW5ndGggIT0gbnVsbCApe1xuICAgIGxlbmd0aCA9IG9wdGlvbnMuZWRnZVN5bURpZmZMZW5ndGg7XG4gICAgbGVuZ3RoRm5OYW1lID0gJ3N5bW1ldHJpY0RpZmZMaW5rTGVuZ3Rocyc7XG4gIH0gZWxzZSBpZiggb3B0aW9ucy5lZGdlSmFjY2FyZExlbmd0aCAhPSBudWxsICl7XG4gICAgbGVuZ3RoID0gb3B0aW9ucy5lZGdlSmFjY2FyZExlbmd0aDtcbiAgICBsZW5ndGhGbk5hbWUgPSAnamFjY2FyZExpbmtMZW5ndGhzJztcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSAxMDA7XG4gICAgbGVuZ3RoRm5OYW1lID0gJ2xpbmtEaXN0YW5jZSc7XG4gIH1cblxuICBsZXQgbGVuZ3RoR2V0dGVyID0gZnVuY3Rpb24oIGxpbmsgKXtcbiAgICByZXR1cm4gbGluay5jYWxjTGVuZ3RoO1xuICB9O1xuXG4gIC8vIGFkZCB0aGUgZWRnZXMgdG8gY29sYVxuICBhZGFwdG9yLmxpbmtzKCBlZGdlcy5zdGRGaWx0ZXIoZnVuY3Rpb24oIGVkZ2UgKXtcbiAgICByZXR1cm4gIWVkZ2Uuc291cmNlKCkuaXNQYXJlbnQoKSAmJiAhZWRnZS50YXJnZXQoKS5pc1BhcmVudCgpO1xuICB9KS5tYXAoZnVuY3Rpb24oIGVkZ2UgKXtcbiAgICBsZXQgYyA9IGVkZ2Uuc2NyYXRjaCgpLmNvbGEgPSB7XG4gICAgICBzb3VyY2U6IGVkZ2Uuc291cmNlKClbMF0uc2NyYXRjaCgpLmNvbGEuaW5kZXgsXG4gICAgICB0YXJnZXQ6IGVkZ2UudGFyZ2V0KClbMF0uc2NyYXRjaCgpLmNvbGEuaW5kZXhcbiAgICB9O1xuXG4gICAgaWYoIGxlbmd0aCAhPSBudWxsICl7XG4gICAgICBjLmNhbGNMZW5ndGggPSBnZXRPcHRWYWwoIGxlbmd0aCwgZWRnZSApO1xuICAgIH1cblxuICAgIHJldHVybiBjO1xuICB9KSApO1xuXG4gIGFkYXB0b3Iuc2l6ZShbIGJiLncsIGJiLmggXSk7XG5cbiAgaWYoIGxlbmd0aCAhPSBudWxsICl7XG4gICAgYWRhcHRvclsgbGVuZ3RoRm5OYW1lIF0oIGxlbmd0aEdldHRlciApO1xuICB9XG5cbiAgLy8gc2V0IHRoZSBmbG93IG9mIGNvbGFcbiAgaWYoIG9wdGlvbnMuZmxvdyApe1xuICAgIGxldCBmbG93O1xuICAgIGxldCBkZWZBeGlzID0gJ3knO1xuICAgIGxldCBkZWZNaW5TZXAgPSA1MDtcblxuICAgIGlmKCBpc1N0cmluZyhvcHRpb25zLmZsb3cpICl7XG4gICAgICBmbG93ID0ge1xuICAgICAgICBheGlzOiBvcHRpb25zLmZsb3csXG4gICAgICAgIG1pblNlcGFyYXRpb246IGRlZk1pblNlcFxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYoIGlzTnVtYmVyKG9wdGlvbnMuZmxvdykgKXtcbiAgICAgIGZsb3cgPSB7XG4gICAgICAgIGF4aXM6IGRlZkF4aXMsXG4gICAgICAgIG1pblNlcGFyYXRpb246IG9wdGlvbnMuZmxvd1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYoIGlzT2JqZWN0KG9wdGlvbnMuZmxvdykgKXtcbiAgICAgIGZsb3cgPSBvcHRpb25zLmZsb3c7XG5cbiAgICAgIGZsb3cuYXhpcyA9IGZsb3cuYXhpcyB8fCBkZWZBeGlzO1xuICAgICAgZmxvdy5taW5TZXBhcmF0aW9uID0gZmxvdy5taW5TZXBhcmF0aW9uICE9IG51bGwgPyBmbG93Lm1pblNlcGFyYXRpb24gOiBkZWZNaW5TZXA7XG4gICAgfSBlbHNlIHsgLy8gZS5nLiBvcHRpb25zLmZsb3c6IHRydWVcbiAgICAgIGZsb3cgPSB7XG4gICAgICAgIGF4aXM6IGRlZkF4aXMsXG4gICAgICAgIG1pblNlcGFyYXRpb246IGRlZk1pblNlcFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBhZGFwdG9yLmZsb3dMYXlvdXQoIGZsb3cuYXhpcyAsIGZsb3cubWluU2VwYXJhdGlvbiApO1xuICB9XG5cbiAgbGF5b3V0LnRyaWdnZXIoeyB0eXBlOiAnbGF5b3V0c3RhcnQnLCBsYXlvdXQ6IGxheW91dCB9KTtcblxuICBhZGFwdG9yXG4gICAgLmF2b2lkT3ZlcmxhcHMoIG9wdGlvbnMuYXZvaWRPdmVybGFwIClcbiAgICAuaGFuZGxlRGlzY29ubmVjdGVkKCBvcHRpb25zLmhhbmRsZURpc2Nvbm5lY3RlZCApXG4gICAgLnN0YXJ0KCBvcHRpb25zLnVuY29uc3RySXRlciwgb3B0aW9ucy51c2VyQ29uc3RJdGVyLCBvcHRpb25zLmFsbENvbnN0SXRlcilcbiAgO1xuXG4gIGlmKCAhb3B0aW9ucy5pbmZpbml0ZSApe1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIGlmKCAhbGF5b3V0Lm1hbnVhbGx5U3RvcHBlZCApe1xuICAgICAgICBhZGFwdG9yLnN0b3AoKTtcbiAgICAgIH1cbiAgICB9LCBvcHRpb25zLm1heFNpbXVsYXRpb25UaW1lKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzOyAvLyBjaGFpbmluZ1xufTtcblxuLy8gY2FsbGVkIG9uIGNvbnRpbnVvdXMgbGF5b3V0cyB0byBzdG9wIHRoZW0gYmVmb3JlIHRoZXkgZmluaXNoXG5Db2xhTGF5b3V0LnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKXtcbiAgaWYoIHRoaXMuYWRhcHRvciApe1xuICAgIHRoaXMubWFudWFsbHlTdG9wcGVkID0gdHJ1ZTtcbiAgICB0aGlzLmFkYXB0b3Iuc3RvcCgpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7IC8vIGNoYWluaW5nXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbGFMYXlvdXQ7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvY29sYS5qcyIsImNvbnN0IGltcGwgPSByZXF1aXJlKCcuL2NvbGEnKTtcblxuLy8gcmVnaXN0ZXJzIHRoZSBleHRlbnNpb24gb24gYSBjeXRvc2NhcGUgbGliIHJlZlxubGV0IHJlZ2lzdGVyID0gZnVuY3Rpb24oIGN5dG9zY2FwZSApe1xuICBpZiggIWN5dG9zY2FwZSApeyByZXR1cm47IH0gLy8gY2FuJ3QgcmVnaXN0ZXIgaWYgY3l0b3NjYXBlIHVuc3BlY2lmaWVkXG5cbiAgY3l0b3NjYXBlKCAnbGF5b3V0JywgJ2NvbGEnLCBpbXBsICk7IC8vIHJlZ2lzdGVyIHdpdGggY3l0b3NjYXBlLmpzXG59O1xuXG5pZiggdHlwZW9mIGN5dG9zY2FwZSAhPT0gJ3VuZGVmaW5lZCcgKXsgLy8gZXhwb3NlIHRvIGdsb2JhbCBjeXRvc2NhcGUgKGkuZS4gd2luZG93LmN5dG9zY2FwZSlcbiAgcmVnaXN0ZXIoIGN5dG9zY2FwZSApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJlZ2lzdGVyO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2luZGV4LmpzIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIHBvd2VyZ3JhcGggPSByZXF1aXJlKFwiLi9wb3dlcmdyYXBoXCIpO1xyXG52YXIgbGlua2xlbmd0aHNfMSA9IHJlcXVpcmUoXCIuL2xpbmtsZW5ndGhzXCIpO1xyXG52YXIgZGVzY2VudF8xID0gcmVxdWlyZShcIi4vZGVzY2VudFwiKTtcclxudmFyIHJlY3RhbmdsZV8xID0gcmVxdWlyZShcIi4vcmVjdGFuZ2xlXCIpO1xyXG52YXIgc2hvcnRlc3RwYXRoc18xID0gcmVxdWlyZShcIi4vc2hvcnRlc3RwYXRoc1wiKTtcclxudmFyIGdlb21fMSA9IHJlcXVpcmUoXCIuL2dlb21cIik7XHJcbnZhciBoYW5kbGVkaXNjb25uZWN0ZWRfMSA9IHJlcXVpcmUoXCIuL2hhbmRsZWRpc2Nvbm5lY3RlZFwiKTtcclxudmFyIEV2ZW50VHlwZTtcclxuKGZ1bmN0aW9uIChFdmVudFR5cGUpIHtcclxuICAgIEV2ZW50VHlwZVtFdmVudFR5cGVbXCJzdGFydFwiXSA9IDBdID0gXCJzdGFydFwiO1xyXG4gICAgRXZlbnRUeXBlW0V2ZW50VHlwZVtcInRpY2tcIl0gPSAxXSA9IFwidGlja1wiO1xyXG4gICAgRXZlbnRUeXBlW0V2ZW50VHlwZVtcImVuZFwiXSA9IDJdID0gXCJlbmRcIjtcclxufSkoRXZlbnRUeXBlID0gZXhwb3J0cy5FdmVudFR5cGUgfHwgKGV4cG9ydHMuRXZlbnRUeXBlID0ge30pKTtcclxuO1xyXG5mdW5jdGlvbiBpc0dyb3VwKGcpIHtcclxuICAgIHJldHVybiB0eXBlb2YgZy5sZWF2ZXMgIT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBnLmdyb3VwcyAhPT0gJ3VuZGVmaW5lZCc7XHJcbn1cclxudmFyIExheW91dCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBMYXlvdXQoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB0aGlzLl9jYW52YXNTaXplID0gWzEsIDFdO1xyXG4gICAgICAgIHRoaXMuX2xpbmtEaXN0YW5jZSA9IDIwO1xyXG4gICAgICAgIHRoaXMuX2RlZmF1bHROb2RlU2l6ZSA9IDEwO1xyXG4gICAgICAgIHRoaXMuX2xpbmtMZW5ndGhDYWxjdWxhdG9yID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9saW5rVHlwZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fYXZvaWRPdmVybGFwcyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZURpc2Nvbm5lY3RlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5fcnVubmluZyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX25vZGVzID0gW107XHJcbiAgICAgICAgdGhpcy5fZ3JvdXBzID0gW107XHJcbiAgICAgICAgdGhpcy5fcm9vdEdyb3VwID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9saW5rcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuX2NvbnN0cmFpbnRzID0gW107XHJcbiAgICAgICAgdGhpcy5fZGlzdGFuY2VNYXRyaXggPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2Rlc2NlbnQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2RpcmVjdGVkTGlua0NvbnN0cmFpbnRzID0gbnVsbDtcclxuICAgICAgICB0aGlzLl90aHJlc2hvbGQgPSAwLjAxO1xyXG4gICAgICAgIHRoaXMuX3Zpc2liaWxpdHlHcmFwaCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fZ3JvdXBDb21wYWN0bmVzcyA9IDFlLTY7XHJcbiAgICAgICAgdGhpcy5ldmVudCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5saW5rQWNjZXNzb3IgPSB7XHJcbiAgICAgICAgICAgIGdldFNvdXJjZUluZGV4OiBMYXlvdXQuZ2V0U291cmNlSW5kZXgsXHJcbiAgICAgICAgICAgIGdldFRhcmdldEluZGV4OiBMYXlvdXQuZ2V0VGFyZ2V0SW5kZXgsXHJcbiAgICAgICAgICAgIHNldExlbmd0aDogTGF5b3V0LnNldExpbmtMZW5ndGgsXHJcbiAgICAgICAgICAgIGdldFR5cGU6IGZ1bmN0aW9uIChsKSB7IHJldHVybiB0eXBlb2YgX3RoaXMuX2xpbmtUeXBlID09PSBcImZ1bmN0aW9uXCIgPyBfdGhpcy5fbGlua1R5cGUobCkgOiAwOyB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIExheW91dC5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZSwgbGlzdGVuZXIpIHtcclxuICAgICAgICBpZiAoIXRoaXMuZXZlbnQpXHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnQgPSB7fTtcclxuICAgICAgICBpZiAodHlwZW9mIGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRbRXZlbnRUeXBlW2VdXSA9IGxpc3RlbmVyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudFtlXSA9IGxpc3RlbmVyO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLnRyaWdnZXIgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGlmICh0aGlzLmV2ZW50ICYmIHR5cGVvZiB0aGlzLmV2ZW50W2UudHlwZV0gIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRbZS50eXBlXShlKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5raWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHdoaWxlICghdGhpcy50aWNrKCkpXHJcbiAgICAgICAgICAgIDtcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLnRpY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2FscGhhIDwgdGhpcy5fdGhyZXNob2xkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3J1bm5pbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKHsgdHlwZTogRXZlbnRUeXBlLmVuZCwgYWxwaGE6IHRoaXMuX2FscGhhID0gMCwgc3RyZXNzOiB0aGlzLl9sYXN0U3RyZXNzIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG4gPSB0aGlzLl9ub2Rlcy5sZW5ndGgsIG0gPSB0aGlzLl9saW5rcy5sZW5ndGg7XHJcbiAgICAgICAgdmFyIG8sIGk7XHJcbiAgICAgICAgdGhpcy5fZGVzY2VudC5sb2Nrcy5jbGVhcigpO1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIHtcclxuICAgICAgICAgICAgbyA9IHRoaXMuX25vZGVzW2ldO1xyXG4gICAgICAgICAgICBpZiAoby5maXhlZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBvLnB4ID09PSAndW5kZWZpbmVkJyB8fCB0eXBlb2Ygby5weSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBvLnB4ID0gby54O1xyXG4gICAgICAgICAgICAgICAgICAgIG8ucHkgPSBvLnk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgcCA9IFtvLnB4LCBvLnB5XTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2Rlc2NlbnQubG9ja3MuYWRkKGksIHApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzMSA9IHRoaXMuX2Rlc2NlbnQucnVuZ2VLdXR0YSgpO1xyXG4gICAgICAgIGlmIChzMSA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLl9hbHBoYSA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiB0aGlzLl9sYXN0U3RyZXNzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICB0aGlzLl9hbHBoYSA9IHMxO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9sYXN0U3RyZXNzID0gczE7XHJcbiAgICAgICAgdGhpcy51cGRhdGVOb2RlUG9zaXRpb25zKCk7XHJcbiAgICAgICAgdGhpcy50cmlnZ2VyKHsgdHlwZTogRXZlbnRUeXBlLnRpY2ssIGFscGhhOiB0aGlzLl9hbHBoYSwgc3RyZXNzOiB0aGlzLl9sYXN0U3RyZXNzIH0pO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLnVwZGF0ZU5vZGVQb3NpdGlvbnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLl9kZXNjZW50LnhbMF0sIHkgPSB0aGlzLl9kZXNjZW50LnhbMV07XHJcbiAgICAgICAgdmFyIG8sIGkgPSB0aGlzLl9ub2Rlcy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUgKGktLSkge1xyXG4gICAgICAgICAgICBvID0gdGhpcy5fbm9kZXNbaV07XHJcbiAgICAgICAgICAgIG8ueCA9IHhbaV07XHJcbiAgICAgICAgICAgIG8ueSA9IHlbaV07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUubm9kZXMgPSBmdW5jdGlvbiAodikge1xyXG4gICAgICAgIGlmICghdikge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fbm9kZXMubGVuZ3RoID09PSAwICYmIHRoaXMuX2xpbmtzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHZhciBuID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xpbmtzLmZvckVhY2goZnVuY3Rpb24gKGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBuID0gTWF0aC5tYXgobiwgbC5zb3VyY2UsIGwudGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbm9kZXMgPSBuZXcgQXJyYXkoKytuKTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbm9kZXNbaV0gPSB7fTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbm9kZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX25vZGVzID0gdjtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLmdyb3VwcyA9IGZ1bmN0aW9uICh4KSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICBpZiAoIXgpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9ncm91cHM7XHJcbiAgICAgICAgdGhpcy5fZ3JvdXBzID0geDtcclxuICAgICAgICB0aGlzLl9yb290R3JvdXAgPSB7fTtcclxuICAgICAgICB0aGlzLl9ncm91cHMuZm9yRWFjaChmdW5jdGlvbiAoZykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGcucGFkZGluZyA9PT0gXCJ1bmRlZmluZWRcIilcclxuICAgICAgICAgICAgICAgIGcucGFkZGluZyA9IDE7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZy5sZWF2ZXMgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgICAgIGcubGVhdmVzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHYgPT09ICdudW1iZXInKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoZy5sZWF2ZXNbaV0gPSBfdGhpcy5fbm9kZXNbdl0pLnBhcmVudCA9IGc7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGcuZ3JvdXBzICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICBnLmdyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uIChnaSwgaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZ2kgPT09ICdudW1iZXInKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoZy5ncm91cHNbaV0gPSBfdGhpcy5fZ3JvdXBzW2dpXSkucGFyZW50ID0gZztcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fcm9vdEdyb3VwLmxlYXZlcyA9IHRoaXMuX25vZGVzLmZpbHRlcihmdW5jdGlvbiAodikgeyByZXR1cm4gdHlwZW9mIHYucGFyZW50ID09PSAndW5kZWZpbmVkJzsgfSk7XHJcbiAgICAgICAgdGhpcy5fcm9vdEdyb3VwLmdyb3VwcyA9IHRoaXMuX2dyb3Vwcy5maWx0ZXIoZnVuY3Rpb24gKGcpIHsgcmV0dXJuIHR5cGVvZiBnLnBhcmVudCA9PT0gJ3VuZGVmaW5lZCc7IH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUucG93ZXJHcmFwaEdyb3VwcyA9IGZ1bmN0aW9uIChmKSB7XHJcbiAgICAgICAgdmFyIGcgPSBwb3dlcmdyYXBoLmdldEdyb3Vwcyh0aGlzLl9ub2RlcywgdGhpcy5fbGlua3MsIHRoaXMubGlua0FjY2Vzc29yLCB0aGlzLl9yb290R3JvdXApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBzKGcuZ3JvdXBzKTtcclxuICAgICAgICBmKGcpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUuYXZvaWRPdmVybGFwcyA9IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYXZvaWRPdmVybGFwcztcclxuICAgICAgICB0aGlzLl9hdm9pZE92ZXJsYXBzID0gdjtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLmhhbmRsZURpc2Nvbm5lY3RlZCA9IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faGFuZGxlRGlzY29ubmVjdGVkO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZURpc2Nvbm5lY3RlZCA9IHY7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5mbG93TGF5b3V0ID0gZnVuY3Rpb24gKGF4aXMsIG1pblNlcGFyYXRpb24pIHtcclxuICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpXHJcbiAgICAgICAgICAgIGF4aXMgPSAneSc7XHJcbiAgICAgICAgdGhpcy5fZGlyZWN0ZWRMaW5rQ29uc3RyYWludHMgPSB7XHJcbiAgICAgICAgICAgIGF4aXM6IGF4aXMsXHJcbiAgICAgICAgICAgIGdldE1pblNlcGFyYXRpb246IHR5cGVvZiBtaW5TZXBhcmF0aW9uID09PSAnbnVtYmVyJyA/IGZ1bmN0aW9uICgpIHsgcmV0dXJuIG1pblNlcGFyYXRpb247IH0gOiBtaW5TZXBhcmF0aW9uXHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLmxpbmtzID0gZnVuY3Rpb24gKHgpIHtcclxuICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9saW5rcztcclxuICAgICAgICB0aGlzLl9saW5rcyA9IHg7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5jb25zdHJhaW50cyA9IGZ1bmN0aW9uIChjKSB7XHJcbiAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludHM7XHJcbiAgICAgICAgdGhpcy5fY29uc3RyYWludHMgPSBjO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUuZGlzdGFuY2VNYXRyaXggPSBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aClcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Rpc3RhbmNlTWF0cml4O1xyXG4gICAgICAgIHRoaXMuX2Rpc3RhbmNlTWF0cml4ID0gZDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLnNpemUgPSBmdW5jdGlvbiAoeCkge1xyXG4gICAgICAgIGlmICgheClcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NhbnZhc1NpemU7XHJcbiAgICAgICAgdGhpcy5fY2FudmFzU2l6ZSA9IHg7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5kZWZhdWx0Tm9kZVNpemUgPSBmdW5jdGlvbiAoeCkge1xyXG4gICAgICAgIGlmICgheClcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RlZmF1bHROb2RlU2l6ZTtcclxuICAgICAgICB0aGlzLl9kZWZhdWx0Tm9kZVNpemUgPSB4O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUuZ3JvdXBDb21wYWN0bmVzcyA9IGZ1bmN0aW9uICh4KSB7XHJcbiAgICAgICAgaWYgKCF4KVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ3JvdXBDb21wYWN0bmVzcztcclxuICAgICAgICB0aGlzLl9ncm91cENvbXBhY3RuZXNzID0geDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLmxpbmtEaXN0YW5jZSA9IGZ1bmN0aW9uICh4KSB7XHJcbiAgICAgICAgaWYgKCF4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9saW5rRGlzdGFuY2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2xpbmtEaXN0YW5jZSA9IHR5cGVvZiB4ID09PSBcImZ1bmN0aW9uXCIgPyB4IDogK3g7XHJcbiAgICAgICAgdGhpcy5fbGlua0xlbmd0aENhbGN1bGF0b3IgPSBudWxsO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUubGlua1R5cGUgPSBmdW5jdGlvbiAoZikge1xyXG4gICAgICAgIHRoaXMuX2xpbmtUeXBlID0gZjtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLmNvbnZlcmdlbmNlVGhyZXNob2xkID0gZnVuY3Rpb24gKHgpIHtcclxuICAgICAgICBpZiAoIXgpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl90aHJlc2hvbGQ7XHJcbiAgICAgICAgdGhpcy5fdGhyZXNob2xkID0gdHlwZW9mIHggPT09IFwiZnVuY3Rpb25cIiA/IHggOiAreDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLmFscGhhID0gZnVuY3Rpb24gKHgpIHtcclxuICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hbHBoYTtcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgeCA9ICt4O1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fYWxwaGEpIHtcclxuICAgICAgICAgICAgICAgIGlmICh4ID4gMClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hbHBoYSA9IHg7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWxwaGEgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX3J1bm5pbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ydW5uaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXIoeyB0eXBlOiBFdmVudFR5cGUuc3RhcnQsIGFscGhhOiB0aGlzLl9hbHBoYSA9IHggfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5raWNrKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUuZ2V0TGlua0xlbmd0aCA9IGZ1bmN0aW9uIChsaW5rKSB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB0aGlzLl9saW5rRGlzdGFuY2UgPT09IFwiZnVuY3Rpb25cIiA/ICsodGhpcy5fbGlua0Rpc3RhbmNlKGxpbmspKSA6IHRoaXMuX2xpbmtEaXN0YW5jZTtcclxuICAgIH07XHJcbiAgICBMYXlvdXQuc2V0TGlua0xlbmd0aCA9IGZ1bmN0aW9uIChsaW5rLCBsZW5ndGgpIHtcclxuICAgICAgICBsaW5rLmxlbmd0aCA9IGxlbmd0aDtcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLmdldExpbmtUeXBlID0gZnVuY3Rpb24gKGxpbmspIHtcclxuICAgICAgICByZXR1cm4gdHlwZW9mIHRoaXMuX2xpbmtUeXBlID09PSBcImZ1bmN0aW9uXCIgPyB0aGlzLl9saW5rVHlwZShsaW5rKSA6IDA7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5zeW1tZXRyaWNEaWZmTGlua0xlbmd0aHMgPSBmdW5jdGlvbiAoaWRlYWxMZW5ndGgsIHcpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIGlmICh3ID09PSB2b2lkIDApIHsgdyA9IDE7IH1cclxuICAgICAgICB0aGlzLmxpbmtEaXN0YW5jZShmdW5jdGlvbiAobCkgeyByZXR1cm4gaWRlYWxMZW5ndGggKiBsLmxlbmd0aDsgfSk7XHJcbiAgICAgICAgdGhpcy5fbGlua0xlbmd0aENhbGN1bGF0b3IgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBsaW5rbGVuZ3Roc18xLnN5bW1ldHJpY0RpZmZMaW5rTGVuZ3RocyhfdGhpcy5fbGlua3MsIF90aGlzLmxpbmtBY2Nlc3Nvciwgdyk7IH07XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5qYWNjYXJkTGlua0xlbmd0aHMgPSBmdW5jdGlvbiAoaWRlYWxMZW5ndGgsIHcpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIGlmICh3ID09PSB2b2lkIDApIHsgdyA9IDE7IH1cclxuICAgICAgICB0aGlzLmxpbmtEaXN0YW5jZShmdW5jdGlvbiAobCkgeyByZXR1cm4gaWRlYWxMZW5ndGggKiBsLmxlbmd0aDsgfSk7XHJcbiAgICAgICAgdGhpcy5fbGlua0xlbmd0aENhbGN1bGF0b3IgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBsaW5rbGVuZ3Roc18xLmphY2NhcmRMaW5rTGVuZ3RocyhfdGhpcy5fbGlua3MsIF90aGlzLmxpbmtBY2Nlc3Nvciwgdyk7IH07XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uIChpbml0aWFsVW5jb25zdHJhaW5lZEl0ZXJhdGlvbnMsIGluaXRpYWxVc2VyQ29uc3RyYWludEl0ZXJhdGlvbnMsIGluaXRpYWxBbGxDb25zdHJhaW50c0l0ZXJhdGlvbnMsIGdyaWRTbmFwSXRlcmF0aW9ucywga2VlcFJ1bm5pbmcpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIGlmIChpbml0aWFsVW5jb25zdHJhaW5lZEl0ZXJhdGlvbnMgPT09IHZvaWQgMCkgeyBpbml0aWFsVW5jb25zdHJhaW5lZEl0ZXJhdGlvbnMgPSAwOyB9XHJcbiAgICAgICAgaWYgKGluaXRpYWxVc2VyQ29uc3RyYWludEl0ZXJhdGlvbnMgPT09IHZvaWQgMCkgeyBpbml0aWFsVXNlckNvbnN0cmFpbnRJdGVyYXRpb25zID0gMDsgfVxyXG4gICAgICAgIGlmIChpbml0aWFsQWxsQ29uc3RyYWludHNJdGVyYXRpb25zID09PSB2b2lkIDApIHsgaW5pdGlhbEFsbENvbnN0cmFpbnRzSXRlcmF0aW9ucyA9IDA7IH1cclxuICAgICAgICBpZiAoZ3JpZFNuYXBJdGVyYXRpb25zID09PSB2b2lkIDApIHsgZ3JpZFNuYXBJdGVyYXRpb25zID0gMDsgfVxyXG4gICAgICAgIGlmIChrZWVwUnVubmluZyA9PT0gdm9pZCAwKSB7IGtlZXBSdW5uaW5nID0gdHJ1ZTsgfVxyXG4gICAgICAgIHZhciBpLCBqLCBuID0gdGhpcy5ub2RlcygpLmxlbmd0aCwgTiA9IG4gKyAyICogdGhpcy5fZ3JvdXBzLmxlbmd0aCwgbSA9IHRoaXMuX2xpbmtzLmxlbmd0aCwgdyA9IHRoaXMuX2NhbnZhc1NpemVbMF0sIGggPSB0aGlzLl9jYW52YXNTaXplWzFdO1xyXG4gICAgICAgIHZhciB4ID0gbmV3IEFycmF5KE4pLCB5ID0gbmV3IEFycmF5KE4pO1xyXG4gICAgICAgIHZhciBHID0gbnVsbDtcclxuICAgICAgICB2YXIgYW8gPSB0aGlzLl9hdm9pZE92ZXJsYXBzO1xyXG4gICAgICAgIHRoaXMuX25vZGVzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHtcclxuICAgICAgICAgICAgdi5pbmRleCA9IGk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygdi54ID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgdi54ID0gdyAvIDIsIHYueSA9IGggLyAyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHhbaV0gPSB2LngsIHlbaV0gPSB2Lnk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHRoaXMuX2xpbmtMZW5ndGhDYWxjdWxhdG9yKVxyXG4gICAgICAgICAgICB0aGlzLl9saW5rTGVuZ3RoQ2FsY3VsYXRvcigpO1xyXG4gICAgICAgIHZhciBkaXN0YW5jZXM7XHJcbiAgICAgICAgaWYgKHRoaXMuX2Rpc3RhbmNlTWF0cml4KSB7XHJcbiAgICAgICAgICAgIGRpc3RhbmNlcyA9IHRoaXMuX2Rpc3RhbmNlTWF0cml4O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZGlzdGFuY2VzID0gKG5ldyBzaG9ydGVzdHBhdGhzXzEuQ2FsY3VsYXRvcihOLCB0aGlzLl9saW5rcywgTGF5b3V0LmdldFNvdXJjZUluZGV4LCBMYXlvdXQuZ2V0VGFyZ2V0SW5kZXgsIGZ1bmN0aW9uIChsKSB7IHJldHVybiBfdGhpcy5nZXRMaW5rTGVuZ3RoKGwpOyB9KSkuRGlzdGFuY2VNYXRyaXgoKTtcclxuICAgICAgICAgICAgRyA9IGRlc2NlbnRfMS5EZXNjZW50LmNyZWF0ZVNxdWFyZU1hdHJpeChOLCBmdW5jdGlvbiAoKSB7IHJldHVybiAyOyB9KTtcclxuICAgICAgICAgICAgdGhpcy5fbGlua3MuZm9yRWFjaChmdW5jdGlvbiAobCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBsLnNvdXJjZSA9PSBcIm51bWJlclwiKVxyXG4gICAgICAgICAgICAgICAgICAgIGwuc291cmNlID0gX3RoaXMuX25vZGVzW2wuc291cmNlXTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbC50YXJnZXQgPT0gXCJudW1iZXJcIilcclxuICAgICAgICAgICAgICAgICAgICBsLnRhcmdldCA9IF90aGlzLl9ub2Rlc1tsLnRhcmdldF07XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLl9saW5rcy5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdSA9IExheW91dC5nZXRTb3VyY2VJbmRleChlKSwgdiA9IExheW91dC5nZXRUYXJnZXRJbmRleChlKTtcclxuICAgICAgICAgICAgICAgIEdbdV1bdl0gPSBHW3ZdW3VdID0gZS53ZWlnaHQgfHwgMTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBEID0gZGVzY2VudF8xLkRlc2NlbnQuY3JlYXRlU3F1YXJlTWF0cml4KE4sIGZ1bmN0aW9uIChpLCBqKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkaXN0YW5jZXNbaV1bal07XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHRoaXMuX3Jvb3RHcm91cCAmJiB0eXBlb2YgdGhpcy5fcm9vdEdyb3VwLmdyb3VwcyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgdmFyIGkgPSBuO1xyXG4gICAgICAgICAgICB2YXIgYWRkQXR0cmFjdGlvbiA9IGZ1bmN0aW9uIChpLCBqLCBzdHJlbmd0aCwgaWRlYWxEaXN0YW5jZSkge1xyXG4gICAgICAgICAgICAgICAgR1tpXVtqXSA9IEdbal1baV0gPSBzdHJlbmd0aDtcclxuICAgICAgICAgICAgICAgIERbaV1bal0gPSBEW2pdW2ldID0gaWRlYWxEaXN0YW5jZTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhpcy5fZ3JvdXBzLmZvckVhY2goZnVuY3Rpb24gKGcpIHtcclxuICAgICAgICAgICAgICAgIGFkZEF0dHJhY3Rpb24oaSwgaSArIDEsIF90aGlzLl9ncm91cENvbXBhY3RuZXNzLCAwLjEpO1xyXG4gICAgICAgICAgICAgICAgeFtpXSA9IDAsIHlbaSsrXSA9IDA7XHJcbiAgICAgICAgICAgICAgICB4W2ldID0gMCwgeVtpKytdID0gMDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhpcy5fcm9vdEdyb3VwID0geyBsZWF2ZXM6IHRoaXMuX25vZGVzLCBncm91cHM6IFtdIH07XHJcbiAgICAgICAgdmFyIGN1ckNvbnN0cmFpbnRzID0gdGhpcy5fY29uc3RyYWludHMgfHwgW107XHJcbiAgICAgICAgaWYgKHRoaXMuX2RpcmVjdGVkTGlua0NvbnN0cmFpbnRzKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGlua0FjY2Vzc29yLmdldE1pblNlcGFyYXRpb24gPSB0aGlzLl9kaXJlY3RlZExpbmtDb25zdHJhaW50cy5nZXRNaW5TZXBhcmF0aW9uO1xyXG4gICAgICAgICAgICBjdXJDb25zdHJhaW50cyA9IGN1ckNvbnN0cmFpbnRzLmNvbmNhdChsaW5rbGVuZ3Roc18xLmdlbmVyYXRlRGlyZWN0ZWRFZGdlQ29uc3RyYWludHMobiwgdGhpcy5fbGlua3MsIHRoaXMuX2RpcmVjdGVkTGlua0NvbnN0cmFpbnRzLmF4aXMsICh0aGlzLmxpbmtBY2Nlc3NvcikpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5hdm9pZE92ZXJsYXBzKGZhbHNlKTtcclxuICAgICAgICB0aGlzLl9kZXNjZW50ID0gbmV3IGRlc2NlbnRfMS5EZXNjZW50KFt4LCB5XSwgRCk7XHJcbiAgICAgICAgdGhpcy5fZGVzY2VudC5sb2Nrcy5jbGVhcigpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBvID0gdGhpcy5fbm9kZXNbaV07XHJcbiAgICAgICAgICAgIGlmIChvLmZpeGVkKSB7XHJcbiAgICAgICAgICAgICAgICBvLnB4ID0gby54O1xyXG4gICAgICAgICAgICAgICAgby5weSA9IG8ueTtcclxuICAgICAgICAgICAgICAgIHZhciBwID0gW28ueCwgby55XTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2Rlc2NlbnQubG9ja3MuYWRkKGksIHApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2Rlc2NlbnQudGhyZXNob2xkID0gdGhpcy5fdGhyZXNob2xkO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbExheW91dChpbml0aWFsVW5jb25zdHJhaW5lZEl0ZXJhdGlvbnMsIHgsIHkpO1xyXG4gICAgICAgIGlmIChjdXJDb25zdHJhaW50cy5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICB0aGlzLl9kZXNjZW50LnByb2plY3QgPSBuZXcgcmVjdGFuZ2xlXzEuUHJvamVjdGlvbih0aGlzLl9ub2RlcywgdGhpcy5fZ3JvdXBzLCB0aGlzLl9yb290R3JvdXAsIGN1ckNvbnN0cmFpbnRzKS5wcm9qZWN0RnVuY3Rpb25zKCk7XHJcbiAgICAgICAgdGhpcy5fZGVzY2VudC5ydW4oaW5pdGlhbFVzZXJDb25zdHJhaW50SXRlcmF0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5zZXBhcmF0ZU92ZXJsYXBwaW5nQ29tcG9uZW50cyh3LCBoKTtcclxuICAgICAgICB0aGlzLmF2b2lkT3ZlcmxhcHMoYW8pO1xyXG4gICAgICAgIGlmIChhbykge1xyXG4gICAgICAgICAgICB0aGlzLl9ub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7IHYueCA9IHhbaV0sIHYueSA9IHlbaV07IH0pO1xyXG4gICAgICAgICAgICB0aGlzLl9kZXNjZW50LnByb2plY3QgPSBuZXcgcmVjdGFuZ2xlXzEuUHJvamVjdGlvbih0aGlzLl9ub2RlcywgdGhpcy5fZ3JvdXBzLCB0aGlzLl9yb290R3JvdXAsIGN1ckNvbnN0cmFpbnRzLCB0cnVlKS5wcm9qZWN0RnVuY3Rpb25zKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX25vZGVzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHsgeFtpXSA9IHYueCwgeVtpXSA9IHYueTsgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2Rlc2NlbnQuRyA9IEc7XHJcbiAgICAgICAgdGhpcy5fZGVzY2VudC5ydW4oaW5pdGlhbEFsbENvbnN0cmFpbnRzSXRlcmF0aW9ucyk7XHJcbiAgICAgICAgaWYgKGdyaWRTbmFwSXRlcmF0aW9ucykge1xyXG4gICAgICAgICAgICB0aGlzLl9kZXNjZW50LnNuYXBTdHJlbmd0aCA9IDEwMDA7XHJcbiAgICAgICAgICAgIHRoaXMuX2Rlc2NlbnQuc25hcEdyaWRTaXplID0gdGhpcy5fbm9kZXNbMF0ud2lkdGg7XHJcbiAgICAgICAgICAgIHRoaXMuX2Rlc2NlbnQubnVtR3JpZFNuYXBOb2RlcyA9IG47XHJcbiAgICAgICAgICAgIHRoaXMuX2Rlc2NlbnQuc2NhbGVTbmFwQnlNYXhIID0gbiAhPSBOO1xyXG4gICAgICAgICAgICB2YXIgRzAgPSBkZXNjZW50XzEuRGVzY2VudC5jcmVhdGVTcXVhcmVNYXRyaXgoTiwgZnVuY3Rpb24gKGksIGopIHtcclxuICAgICAgICAgICAgICAgIGlmIChpID49IG4gfHwgaiA+PSBuKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBHW2ldW2pdO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLl9kZXNjZW50LkcgPSBHMDtcclxuICAgICAgICAgICAgdGhpcy5fZGVzY2VudC5ydW4oZ3JpZFNuYXBJdGVyYXRpb25zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy51cGRhdGVOb2RlUG9zaXRpb25zKCk7XHJcbiAgICAgICAgdGhpcy5zZXBhcmF0ZU92ZXJsYXBwaW5nQ29tcG9uZW50cyh3LCBoKTtcclxuICAgICAgICByZXR1cm4ga2VlcFJ1bm5pbmcgPyB0aGlzLnJlc3VtZSgpIDogdGhpcztcclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLmluaXRpYWxMYXlvdXQgPSBmdW5jdGlvbiAoaXRlcmF0aW9ucywgeCwgeSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9ncm91cHMubGVuZ3RoID4gMCAmJiBpdGVyYXRpb25zID4gMCkge1xyXG4gICAgICAgICAgICB2YXIgbiA9IHRoaXMuX25vZGVzLmxlbmd0aDtcclxuICAgICAgICAgICAgdmFyIGVkZ2VzID0gdGhpcy5fbGlua3MubWFwKGZ1bmN0aW9uIChlKSB7IHJldHVybiAoeyBzb3VyY2U6IGUuc291cmNlLmluZGV4LCB0YXJnZXQ6IGUudGFyZ2V0LmluZGV4IH0pOyB9KTtcclxuICAgICAgICAgICAgdmFyIHZzID0gdGhpcy5fbm9kZXMubWFwKGZ1bmN0aW9uICh2KSB7IHJldHVybiAoeyBpbmRleDogdi5pbmRleCB9KTsgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2dyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uIChnLCBpKSB7XHJcbiAgICAgICAgICAgICAgICB2cy5wdXNoKHsgaW5kZXg6IGcuaW5kZXggPSBuICsgaSB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2dyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uIChnLCBpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGcubGVhdmVzICE9PSAndW5kZWZpbmVkJylcclxuICAgICAgICAgICAgICAgICAgICBnLmxlYXZlcy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7IHJldHVybiBlZGdlcy5wdXNoKHsgc291cmNlOiBnLmluZGV4LCB0YXJnZXQ6IHYuaW5kZXggfSk7IH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBnLmdyb3VwcyAhPT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgICAgICAgICAgICAgICAgZy5ncm91cHMuZm9yRWFjaChmdW5jdGlvbiAoZ2cpIHsgcmV0dXJuIGVkZ2VzLnB1c2goeyBzb3VyY2U6IGcuaW5kZXgsIHRhcmdldDogZ2cuaW5kZXggfSk7IH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgbmV3IExheW91dCgpXHJcbiAgICAgICAgICAgICAgICAuc2l6ZSh0aGlzLnNpemUoKSlcclxuICAgICAgICAgICAgICAgIC5ub2Rlcyh2cylcclxuICAgICAgICAgICAgICAgIC5saW5rcyhlZGdlcylcclxuICAgICAgICAgICAgICAgIC5hdm9pZE92ZXJsYXBzKGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgLmxpbmtEaXN0YW5jZSh0aGlzLmxpbmtEaXN0YW5jZSgpKVxyXG4gICAgICAgICAgICAgICAgLnN5bW1ldHJpY0RpZmZMaW5rTGVuZ3Rocyg1KVxyXG4gICAgICAgICAgICAgICAgLmNvbnZlcmdlbmNlVGhyZXNob2xkKDFlLTQpXHJcbiAgICAgICAgICAgICAgICAuc3RhcnQoaXRlcmF0aW9ucywgMCwgMCwgMCwgZmFsc2UpO1xyXG4gICAgICAgICAgICB0aGlzLl9ub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgICAgICB4W3YuaW5kZXhdID0gdnNbdi5pbmRleF0ueDtcclxuICAgICAgICAgICAgICAgIHlbdi5pbmRleF0gPSB2c1t2LmluZGV4XS55O1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2Rlc2NlbnQucnVuKGl0ZXJhdGlvbnMpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBMYXlvdXQucHJvdG90eXBlLnNlcGFyYXRlT3ZlcmxhcHBpbmdDb21wb25lbnRzID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIGlmICghdGhpcy5fZGlzdGFuY2VNYXRyaXggJiYgdGhpcy5faGFuZGxlRGlzY29ubmVjdGVkKSB7XHJcbiAgICAgICAgICAgIHZhciB4XzEgPSB0aGlzLl9kZXNjZW50LnhbMF0sIHlfMSA9IHRoaXMuX2Rlc2NlbnQueFsxXTtcclxuICAgICAgICAgICAgdGhpcy5fbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkgeyB2LnggPSB4XzFbaV0sIHYueSA9IHlfMVtpXTsgfSk7XHJcbiAgICAgICAgICAgIHZhciBncmFwaHMgPSBoYW5kbGVkaXNjb25uZWN0ZWRfMS5zZXBhcmF0ZUdyYXBocyh0aGlzLl9ub2RlcywgdGhpcy5fbGlua3MpO1xyXG4gICAgICAgICAgICBoYW5kbGVkaXNjb25uZWN0ZWRfMS5hcHBseVBhY2tpbmcoZ3JhcGhzLCB3aWR0aCwgaGVpZ2h0LCB0aGlzLl9kZWZhdWx0Tm9kZVNpemUpO1xyXG4gICAgICAgICAgICB0aGlzLl9ub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5fZGVzY2VudC54WzBdW2ldID0gdi54LCBfdGhpcy5fZGVzY2VudC54WzFdW2ldID0gdi55O1xyXG4gICAgICAgICAgICAgICAgaWYgKHYuYm91bmRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdi5ib3VuZHMuc2V0WENlbnRyZSh2LngpO1xyXG4gICAgICAgICAgICAgICAgICAgIHYuYm91bmRzLnNldFlDZW50cmUodi55KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUucmVzdW1lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFscGhhKDAuMSk7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFscGhhKDApO1xyXG4gICAgfTtcclxuICAgIExheW91dC5wcm90b3R5cGUucHJlcGFyZUVkZ2VSb3V0aW5nID0gZnVuY3Rpb24gKG5vZGVNYXJnaW4pIHtcclxuICAgICAgICBpZiAobm9kZU1hcmdpbiA9PT0gdm9pZCAwKSB7IG5vZGVNYXJnaW4gPSAwOyB9XHJcbiAgICAgICAgdGhpcy5fdmlzaWJpbGl0eUdyYXBoID0gbmV3IGdlb21fMS5UYW5nZW50VmlzaWJpbGl0eUdyYXBoKHRoaXMuX25vZGVzLm1hcChmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgICByZXR1cm4gdi5ib3VuZHMuaW5mbGF0ZSgtbm9kZU1hcmdpbikudmVydGljZXMoKTtcclxuICAgICAgICB9KSk7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0LnByb3RvdHlwZS5yb3V0ZUVkZ2UgPSBmdW5jdGlvbiAoZWRnZSwgYWgsIGRyYXcpIHtcclxuICAgICAgICBpZiAoYWggPT09IHZvaWQgMCkgeyBhaCA9IDU7IH1cclxuICAgICAgICB2YXIgbGluZURhdGEgPSBbXTtcclxuICAgICAgICB2YXIgdmcyID0gbmV3IGdlb21fMS5UYW5nZW50VmlzaWJpbGl0eUdyYXBoKHRoaXMuX3Zpc2liaWxpdHlHcmFwaC5QLCB7IFY6IHRoaXMuX3Zpc2liaWxpdHlHcmFwaC5WLCBFOiB0aGlzLl92aXNpYmlsaXR5R3JhcGguRSB9KSwgcG9ydDEgPSB7IHg6IGVkZ2Uuc291cmNlLngsIHk6IGVkZ2Uuc291cmNlLnkgfSwgcG9ydDIgPSB7IHg6IGVkZ2UudGFyZ2V0LngsIHk6IGVkZ2UudGFyZ2V0LnkgfSwgc3RhcnQgPSB2ZzIuYWRkUG9pbnQocG9ydDEsIGVkZ2Uuc291cmNlLmluZGV4KSwgZW5kID0gdmcyLmFkZFBvaW50KHBvcnQyLCBlZGdlLnRhcmdldC5pbmRleCk7XHJcbiAgICAgICAgdmcyLmFkZEVkZ2VJZlZpc2libGUocG9ydDEsIHBvcnQyLCBlZGdlLnNvdXJjZS5pbmRleCwgZWRnZS50YXJnZXQuaW5kZXgpO1xyXG4gICAgICAgIGlmICh0eXBlb2YgZHJhdyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgZHJhdyh2ZzIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgc291cmNlSW5kID0gZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUuc291cmNlLmlkOyB9LCB0YXJnZXRJbmQgPSBmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS50YXJnZXQuaWQ7IH0sIGxlbmd0aCA9IGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLmxlbmd0aCgpOyB9LCBzcENhbGMgPSBuZXcgc2hvcnRlc3RwYXRoc18xLkNhbGN1bGF0b3IodmcyLlYubGVuZ3RoLCB2ZzIuRSwgc291cmNlSW5kLCB0YXJnZXRJbmQsIGxlbmd0aCksIHNob3J0ZXN0UGF0aCA9IHNwQ2FsYy5QYXRoRnJvbU5vZGVUb05vZGUoc3RhcnQuaWQsIGVuZC5pZCk7XHJcbiAgICAgICAgaWYgKHNob3J0ZXN0UGF0aC5sZW5ndGggPT09IDEgfHwgc2hvcnRlc3RQYXRoLmxlbmd0aCA9PT0gdmcyLlYubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHZhciByb3V0ZSA9IHJlY3RhbmdsZV8xLm1ha2VFZGdlQmV0d2VlbihlZGdlLnNvdXJjZS5pbm5lckJvdW5kcywgZWRnZS50YXJnZXQuaW5uZXJCb3VuZHMsIGFoKTtcclxuICAgICAgICAgICAgbGluZURhdGEgPSBbcm91dGUuc291cmNlSW50ZXJzZWN0aW9uLCByb3V0ZS5hcnJvd1N0YXJ0XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBuID0gc2hvcnRlc3RQYXRoLmxlbmd0aCAtIDIsIHAgPSB2ZzIuVltzaG9ydGVzdFBhdGhbbl1dLnAsIHEgPSB2ZzIuVltzaG9ydGVzdFBhdGhbMF1dLnAsIGxpbmVEYXRhID0gW2VkZ2Uuc291cmNlLmlubmVyQm91bmRzLnJheUludGVyc2VjdGlvbihwLngsIHAueSldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gbjsgaSA+PSAwOyAtLWkpXHJcbiAgICAgICAgICAgICAgICBsaW5lRGF0YS5wdXNoKHZnMi5WW3Nob3J0ZXN0UGF0aFtpXV0ucCk7XHJcbiAgICAgICAgICAgIGxpbmVEYXRhLnB1c2gocmVjdGFuZ2xlXzEubWFrZUVkZ2VUbyhxLCBlZGdlLnRhcmdldC5pbm5lckJvdW5kcywgYWgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGxpbmVEYXRhO1xyXG4gICAgfTtcclxuICAgIExheW91dC5nZXRTb3VyY2VJbmRleCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBlLnNvdXJjZSA9PT0gJ251bWJlcicgPyBlLnNvdXJjZSA6IGUuc291cmNlLmluZGV4O1xyXG4gICAgfTtcclxuICAgIExheW91dC5nZXRUYXJnZXRJbmRleCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBlLnRhcmdldCA9PT0gJ251bWJlcicgPyBlLnRhcmdldCA6IGUudGFyZ2V0LmluZGV4O1xyXG4gICAgfTtcclxuICAgIExheW91dC5saW5rSWQgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIHJldHVybiBMYXlvdXQuZ2V0U291cmNlSW5kZXgoZSkgKyBcIi1cIiArIExheW91dC5nZXRUYXJnZXRJbmRleChlKTtcclxuICAgIH07XHJcbiAgICBMYXlvdXQuZHJhZ1N0YXJ0ID0gZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICBpZiAoaXNHcm91cChkKSkge1xyXG4gICAgICAgICAgICBMYXlvdXQuc3RvcmVPZmZzZXQoZCwgTGF5b3V0LmRyYWdPcmlnaW4oZCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgTGF5b3V0LnN0b3BOb2RlKGQpO1xyXG4gICAgICAgICAgICBkLmZpeGVkIHw9IDI7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIExheW91dC5zdG9wTm9kZSA9IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgdi5weCA9IHYueDtcclxuICAgICAgICB2LnB5ID0gdi55O1xyXG4gICAgfTtcclxuICAgIExheW91dC5zdG9yZU9mZnNldCA9IGZ1bmN0aW9uIChkLCBvcmlnaW4pIHtcclxuICAgICAgICBpZiAodHlwZW9mIGQubGVhdmVzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBkLmxlYXZlcy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgICAgICB2LmZpeGVkIHw9IDI7XHJcbiAgICAgICAgICAgICAgICBMYXlvdXQuc3RvcE5vZGUodik7XHJcbiAgICAgICAgICAgICAgICB2Ll9kcmFnR3JvdXBPZmZzZXRYID0gdi54IC0gb3JpZ2luLng7XHJcbiAgICAgICAgICAgICAgICB2Ll9kcmFnR3JvdXBPZmZzZXRZID0gdi55IC0gb3JpZ2luLnk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIGQuZ3JvdXBzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBkLmdyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uIChnKSB7IHJldHVybiBMYXlvdXQuc3RvcmVPZmZzZXQoZywgb3JpZ2luKTsgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIExheW91dC5kcmFnT3JpZ2luID0gZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICBpZiAoaXNHcm91cChkKSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgeDogZC5ib3VuZHMuY3goKSxcclxuICAgICAgICAgICAgICAgIHk6IGQuYm91bmRzLmN5KClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBMYXlvdXQuZHJhZyA9IGZ1bmN0aW9uIChkLCBwb3NpdGlvbikge1xyXG4gICAgICAgIGlmIChpc0dyb3VwKGQpKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZC5sZWF2ZXMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICBkLmxlYXZlcy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZC5ib3VuZHMuc2V0WENlbnRyZShwb3NpdGlvbi54KTtcclxuICAgICAgICAgICAgICAgICAgICBkLmJvdW5kcy5zZXRZQ2VudHJlKHBvc2l0aW9uLnkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHYucHggPSB2Ll9kcmFnR3JvdXBPZmZzZXRYICsgcG9zaXRpb24ueDtcclxuICAgICAgICAgICAgICAgICAgICB2LnB5ID0gdi5fZHJhZ0dyb3VwT2Zmc2V0WSArIHBvc2l0aW9uLnk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGQuZ3JvdXBzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgZC5ncm91cHMuZm9yRWFjaChmdW5jdGlvbiAoZykgeyByZXR1cm4gTGF5b3V0LmRyYWcoZywgcG9zaXRpb24pOyB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZC5weCA9IHBvc2l0aW9uLng7XHJcbiAgICAgICAgICAgIGQucHkgPSBwb3NpdGlvbi55O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBMYXlvdXQuZHJhZ0VuZCA9IGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgaWYgKGlzR3JvdXAoZCkpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBkLmxlYXZlcyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIGQubGVhdmVzLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICAgICAgICAgICAgICBMYXlvdXQuZHJhZ0VuZCh2KTtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdi5fZHJhZ0dyb3VwT2Zmc2V0WDtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdi5fZHJhZ0dyb3VwT2Zmc2V0WTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZC5ncm91cHMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICBkLmdyb3Vwcy5mb3JFYWNoKExheW91dC5kcmFnRW5kKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZC5maXhlZCAmPSB+NjtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0Lm1vdXNlT3ZlciA9IGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgZC5maXhlZCB8PSA0O1xyXG4gICAgICAgIGQucHggPSBkLngsIGQucHkgPSBkLnk7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0Lm1vdXNlT3V0ID0gZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICBkLmZpeGVkICY9IH40O1xyXG4gICAgfTtcclxuICAgIHJldHVybiBMYXlvdXQ7XHJcbn0oKSk7XHJcbmV4cG9ydHMuTGF5b3V0ID0gTGF5b3V0O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1sYXlvdXQuanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3dlYmNvbGEvZGlzdC9zcmMvbGF5b3V0LmpzXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xyXG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG4gICAgfTtcclxufSkoKTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgdnBzY18xID0gcmVxdWlyZShcIi4vdnBzY1wiKTtcclxudmFyIHJidHJlZV8xID0gcmVxdWlyZShcIi4vcmJ0cmVlXCIpO1xyXG5mdW5jdGlvbiBjb21wdXRlR3JvdXBCb3VuZHMoZykge1xyXG4gICAgZy5ib3VuZHMgPSB0eXBlb2YgZy5sZWF2ZXMgIT09IFwidW5kZWZpbmVkXCIgP1xyXG4gICAgICAgIGcubGVhdmVzLnJlZHVjZShmdW5jdGlvbiAociwgYykgeyByZXR1cm4gYy5ib3VuZHMudW5pb24ocik7IH0sIFJlY3RhbmdsZS5lbXB0eSgpKSA6XHJcbiAgICAgICAgUmVjdGFuZ2xlLmVtcHR5KCk7XHJcbiAgICBpZiAodHlwZW9mIGcuZ3JvdXBzICE9PSBcInVuZGVmaW5lZFwiKVxyXG4gICAgICAgIGcuYm91bmRzID0gZy5ncm91cHMucmVkdWNlKGZ1bmN0aW9uIChyLCBjKSB7IHJldHVybiBjb21wdXRlR3JvdXBCb3VuZHMoYykudW5pb24ocik7IH0sIGcuYm91bmRzKTtcclxuICAgIGcuYm91bmRzID0gZy5ib3VuZHMuaW5mbGF0ZShnLnBhZGRpbmcpO1xyXG4gICAgcmV0dXJuIGcuYm91bmRzO1xyXG59XHJcbmV4cG9ydHMuY29tcHV0ZUdyb3VwQm91bmRzID0gY29tcHV0ZUdyb3VwQm91bmRzO1xyXG52YXIgUmVjdGFuZ2xlID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFJlY3RhbmdsZSh4LCBYLCB5LCBZKSB7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLlggPSBYO1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy5ZID0gWTtcclxuICAgIH1cclxuICAgIFJlY3RhbmdsZS5lbXB0eSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIG5ldyBSZWN0YW5nbGUoTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFksIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSwgTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKTsgfTtcclxuICAgIFJlY3RhbmdsZS5wcm90b3R5cGUuY3ggPSBmdW5jdGlvbiAoKSB7IHJldHVybiAodGhpcy54ICsgdGhpcy5YKSAvIDI7IH07XHJcbiAgICBSZWN0YW5nbGUucHJvdG90eXBlLmN5ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gKHRoaXMueSArIHRoaXMuWSkgLyAyOyB9O1xyXG4gICAgUmVjdGFuZ2xlLnByb3RvdHlwZS5vdmVybGFwWCA9IGZ1bmN0aW9uIChyKSB7XHJcbiAgICAgICAgdmFyIHV4ID0gdGhpcy5jeCgpLCB2eCA9IHIuY3goKTtcclxuICAgICAgICBpZiAodXggPD0gdnggJiYgci54IDwgdGhpcy5YKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5YIC0gci54O1xyXG4gICAgICAgIGlmICh2eCA8PSB1eCAmJiB0aGlzLnggPCByLlgpXHJcbiAgICAgICAgICAgIHJldHVybiByLlggLSB0aGlzLng7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9O1xyXG4gICAgUmVjdGFuZ2xlLnByb3RvdHlwZS5vdmVybGFwWSA9IGZ1bmN0aW9uIChyKSB7XHJcbiAgICAgICAgdmFyIHV5ID0gdGhpcy5jeSgpLCB2eSA9IHIuY3koKTtcclxuICAgICAgICBpZiAodXkgPD0gdnkgJiYgci55IDwgdGhpcy5ZKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ZIC0gci55O1xyXG4gICAgICAgIGlmICh2eSA8PSB1eSAmJiB0aGlzLnkgPCByLlkpXHJcbiAgICAgICAgICAgIHJldHVybiByLlkgLSB0aGlzLnk7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9O1xyXG4gICAgUmVjdGFuZ2xlLnByb3RvdHlwZS5zZXRYQ2VudHJlID0gZnVuY3Rpb24gKGN4KSB7XHJcbiAgICAgICAgdmFyIGR4ID0gY3ggLSB0aGlzLmN4KCk7XHJcbiAgICAgICAgdGhpcy54ICs9IGR4O1xyXG4gICAgICAgIHRoaXMuWCArPSBkeDtcclxuICAgIH07XHJcbiAgICBSZWN0YW5nbGUucHJvdG90eXBlLnNldFlDZW50cmUgPSBmdW5jdGlvbiAoY3kpIHtcclxuICAgICAgICB2YXIgZHkgPSBjeSAtIHRoaXMuY3koKTtcclxuICAgICAgICB0aGlzLnkgKz0gZHk7XHJcbiAgICAgICAgdGhpcy5ZICs9IGR5O1xyXG4gICAgfTtcclxuICAgIFJlY3RhbmdsZS5wcm90b3R5cGUud2lkdGggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuWCAtIHRoaXMueDtcclxuICAgIH07XHJcbiAgICBSZWN0YW5nbGUucHJvdG90eXBlLmhlaWdodCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ZIC0gdGhpcy55O1xyXG4gICAgfTtcclxuICAgIFJlY3RhbmdsZS5wcm90b3R5cGUudW5pb24gPSBmdW5jdGlvbiAocikge1xyXG4gICAgICAgIHJldHVybiBuZXcgUmVjdGFuZ2xlKE1hdGgubWluKHRoaXMueCwgci54KSwgTWF0aC5tYXgodGhpcy5YLCByLlgpLCBNYXRoLm1pbih0aGlzLnksIHIueSksIE1hdGgubWF4KHRoaXMuWSwgci5ZKSk7XHJcbiAgICB9O1xyXG4gICAgUmVjdGFuZ2xlLnByb3RvdHlwZS5saW5lSW50ZXJzZWN0aW9ucyA9IGZ1bmN0aW9uICh4MSwgeTEsIHgyLCB5Mikge1xyXG4gICAgICAgIHZhciBzaWRlcyA9IFtbdGhpcy54LCB0aGlzLnksIHRoaXMuWCwgdGhpcy55XSxcclxuICAgICAgICAgICAgW3RoaXMuWCwgdGhpcy55LCB0aGlzLlgsIHRoaXMuWV0sXHJcbiAgICAgICAgICAgIFt0aGlzLlgsIHRoaXMuWSwgdGhpcy54LCB0aGlzLlldLFxyXG4gICAgICAgICAgICBbdGhpcy54LCB0aGlzLlksIHRoaXMueCwgdGhpcy55XV07XHJcbiAgICAgICAgdmFyIGludGVyc2VjdGlvbnMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgciA9IFJlY3RhbmdsZS5saW5lSW50ZXJzZWN0aW9uKHgxLCB5MSwgeDIsIHkyLCBzaWRlc1tpXVswXSwgc2lkZXNbaV1bMV0sIHNpZGVzW2ldWzJdLCBzaWRlc1tpXVszXSk7XHJcbiAgICAgICAgICAgIGlmIChyICE9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgaW50ZXJzZWN0aW9ucy5wdXNoKHsgeDogci54LCB5OiByLnkgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb25zO1xyXG4gICAgfTtcclxuICAgIFJlY3RhbmdsZS5wcm90b3R5cGUucmF5SW50ZXJzZWN0aW9uID0gZnVuY3Rpb24gKHgyLCB5Mikge1xyXG4gICAgICAgIHZhciBpbnRzID0gdGhpcy5saW5lSW50ZXJzZWN0aW9ucyh0aGlzLmN4KCksIHRoaXMuY3koKSwgeDIsIHkyKTtcclxuICAgICAgICByZXR1cm4gaW50cy5sZW5ndGggPiAwID8gaW50c1swXSA6IG51bGw7XHJcbiAgICB9O1xyXG4gICAgUmVjdGFuZ2xlLnByb3RvdHlwZS52ZXJ0aWNlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICB7IHg6IHRoaXMueCwgeTogdGhpcy55IH0sXHJcbiAgICAgICAgICAgIHsgeDogdGhpcy5YLCB5OiB0aGlzLnkgfSxcclxuICAgICAgICAgICAgeyB4OiB0aGlzLlgsIHk6IHRoaXMuWSB9LFxyXG4gICAgICAgICAgICB7IHg6IHRoaXMueCwgeTogdGhpcy5ZIH1cclxuICAgICAgICBdO1xyXG4gICAgfTtcclxuICAgIFJlY3RhbmdsZS5saW5lSW50ZXJzZWN0aW9uID0gZnVuY3Rpb24gKHgxLCB5MSwgeDIsIHkyLCB4MywgeTMsIHg0LCB5NCkge1xyXG4gICAgICAgIHZhciBkeDEyID0geDIgLSB4MSwgZHgzNCA9IHg0IC0geDMsIGR5MTIgPSB5MiAtIHkxLCBkeTM0ID0geTQgLSB5MywgZGVub21pbmF0b3IgPSBkeTM0ICogZHgxMiAtIGR4MzQgKiBkeTEyO1xyXG4gICAgICAgIGlmIChkZW5vbWluYXRvciA9PSAwKVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB2YXIgZHgzMSA9IHgxIC0geDMsIGR5MzEgPSB5MSAtIHkzLCBudW1hID0gZHgzNCAqIGR5MzEgLSBkeTM0ICogZHgzMSwgYSA9IG51bWEgLyBkZW5vbWluYXRvciwgbnVtYiA9IGR4MTIgKiBkeTMxIC0gZHkxMiAqIGR4MzEsIGIgPSBudW1iIC8gZGVub21pbmF0b3I7XHJcbiAgICAgICAgaWYgKGEgPj0gMCAmJiBhIDw9IDEgJiYgYiA+PSAwICYmIGIgPD0gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgeDogeDEgKyBhICogZHgxMixcclxuICAgICAgICAgICAgICAgIHk6IHkxICsgYSAqIGR5MTJcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9O1xyXG4gICAgUmVjdGFuZ2xlLnByb3RvdHlwZS5pbmZsYXRlID0gZnVuY3Rpb24gKHBhZCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUmVjdGFuZ2xlKHRoaXMueCAtIHBhZCwgdGhpcy5YICsgcGFkLCB0aGlzLnkgLSBwYWQsIHRoaXMuWSArIHBhZCk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFJlY3RhbmdsZTtcclxufSgpKTtcclxuZXhwb3J0cy5SZWN0YW5nbGUgPSBSZWN0YW5nbGU7XHJcbmZ1bmN0aW9uIG1ha2VFZGdlQmV0d2Vlbihzb3VyY2UsIHRhcmdldCwgYWgpIHtcclxuICAgIHZhciBzaSA9IHNvdXJjZS5yYXlJbnRlcnNlY3Rpb24odGFyZ2V0LmN4KCksIHRhcmdldC5jeSgpKSB8fCB7IHg6IHNvdXJjZS5jeCgpLCB5OiBzb3VyY2UuY3koKSB9LCB0aSA9IHRhcmdldC5yYXlJbnRlcnNlY3Rpb24oc291cmNlLmN4KCksIHNvdXJjZS5jeSgpKSB8fCB7IHg6IHRhcmdldC5jeCgpLCB5OiB0YXJnZXQuY3koKSB9LCBkeCA9IHRpLnggLSBzaS54LCBkeSA9IHRpLnkgLSBzaS55LCBsID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KSwgYWwgPSBsIC0gYWg7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNvdXJjZUludGVyc2VjdGlvbjogc2ksXHJcbiAgICAgICAgdGFyZ2V0SW50ZXJzZWN0aW9uOiB0aSxcclxuICAgICAgICBhcnJvd1N0YXJ0OiB7IHg6IHNpLnggKyBhbCAqIGR4IC8gbCwgeTogc2kueSArIGFsICogZHkgLyBsIH1cclxuICAgIH07XHJcbn1cclxuZXhwb3J0cy5tYWtlRWRnZUJldHdlZW4gPSBtYWtlRWRnZUJldHdlZW47XHJcbmZ1bmN0aW9uIG1ha2VFZGdlVG8ocywgdGFyZ2V0LCBhaCkge1xyXG4gICAgdmFyIHRpID0gdGFyZ2V0LnJheUludGVyc2VjdGlvbihzLngsIHMueSk7XHJcbiAgICBpZiAoIXRpKVxyXG4gICAgICAgIHRpID0geyB4OiB0YXJnZXQuY3goKSwgeTogdGFyZ2V0LmN5KCkgfTtcclxuICAgIHZhciBkeCA9IHRpLnggLSBzLngsIGR5ID0gdGkueSAtIHMueSwgbCA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XHJcbiAgICByZXR1cm4geyB4OiB0aS54IC0gYWggKiBkeCAvIGwsIHk6IHRpLnkgLSBhaCAqIGR5IC8gbCB9O1xyXG59XHJcbmV4cG9ydHMubWFrZUVkZ2VUbyA9IG1ha2VFZGdlVG87XHJcbnZhciBOb2RlID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIE5vZGUodiwgciwgcG9zKSB7XHJcbiAgICAgICAgdGhpcy52ID0gdjtcclxuICAgICAgICB0aGlzLnIgPSByO1xyXG4gICAgICAgIHRoaXMucG9zID0gcG9zO1xyXG4gICAgICAgIHRoaXMucHJldiA9IG1ha2VSQlRyZWUoKTtcclxuICAgICAgICB0aGlzLm5leHQgPSBtYWtlUkJUcmVlKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gTm9kZTtcclxufSgpKTtcclxudmFyIEV2ZW50ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIEV2ZW50KGlzT3BlbiwgdiwgcG9zKSB7XHJcbiAgICAgICAgdGhpcy5pc09wZW4gPSBpc09wZW47XHJcbiAgICAgICAgdGhpcy52ID0gdjtcclxuICAgICAgICB0aGlzLnBvcyA9IHBvcztcclxuICAgIH1cclxuICAgIHJldHVybiBFdmVudDtcclxufSgpKTtcclxuZnVuY3Rpb24gY29tcGFyZUV2ZW50cyhhLCBiKSB7XHJcbiAgICBpZiAoYS5wb3MgPiBiLnBvcykge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgfVxyXG4gICAgaWYgKGEucG9zIDwgYi5wb3MpIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcbiAgICBpZiAoYS5pc09wZW4pIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcbiAgICBpZiAoYi5pc09wZW4pIHtcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgIH1cclxuICAgIHJldHVybiAwO1xyXG59XHJcbmZ1bmN0aW9uIG1ha2VSQlRyZWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IHJidHJlZV8xLlJCVHJlZShmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYS5wb3MgLSBiLnBvczsgfSk7XHJcbn1cclxudmFyIHhSZWN0ID0ge1xyXG4gICAgZ2V0Q2VudHJlOiBmdW5jdGlvbiAocikgeyByZXR1cm4gci5jeCgpOyB9LFxyXG4gICAgZ2V0T3BlbjogZnVuY3Rpb24gKHIpIHsgcmV0dXJuIHIueTsgfSxcclxuICAgIGdldENsb3NlOiBmdW5jdGlvbiAocikgeyByZXR1cm4gci5ZOyB9LFxyXG4gICAgZ2V0U2l6ZTogZnVuY3Rpb24gKHIpIHsgcmV0dXJuIHIud2lkdGgoKTsgfSxcclxuICAgIG1ha2VSZWN0OiBmdW5jdGlvbiAob3BlbiwgY2xvc2UsIGNlbnRlciwgc2l6ZSkgeyByZXR1cm4gbmV3IFJlY3RhbmdsZShjZW50ZXIgLSBzaXplIC8gMiwgY2VudGVyICsgc2l6ZSAvIDIsIG9wZW4sIGNsb3NlKTsgfSxcclxuICAgIGZpbmROZWlnaGJvdXJzOiBmaW5kWE5laWdoYm91cnNcclxufTtcclxudmFyIHlSZWN0ID0ge1xyXG4gICAgZ2V0Q2VudHJlOiBmdW5jdGlvbiAocikgeyByZXR1cm4gci5jeSgpOyB9LFxyXG4gICAgZ2V0T3BlbjogZnVuY3Rpb24gKHIpIHsgcmV0dXJuIHIueDsgfSxcclxuICAgIGdldENsb3NlOiBmdW5jdGlvbiAocikgeyByZXR1cm4gci5YOyB9LFxyXG4gICAgZ2V0U2l6ZTogZnVuY3Rpb24gKHIpIHsgcmV0dXJuIHIuaGVpZ2h0KCk7IH0sXHJcbiAgICBtYWtlUmVjdDogZnVuY3Rpb24gKG9wZW4sIGNsb3NlLCBjZW50ZXIsIHNpemUpIHsgcmV0dXJuIG5ldyBSZWN0YW5nbGUob3BlbiwgY2xvc2UsIGNlbnRlciAtIHNpemUgLyAyLCBjZW50ZXIgKyBzaXplIC8gMik7IH0sXHJcbiAgICBmaW5kTmVpZ2hib3VyczogZmluZFlOZWlnaGJvdXJzXHJcbn07XHJcbmZ1bmN0aW9uIGdlbmVyYXRlR3JvdXBDb25zdHJhaW50cyhyb290LCBmLCBtaW5TZXAsIGlzQ29udGFpbmVkKSB7XHJcbiAgICBpZiAoaXNDb250YWluZWQgPT09IHZvaWQgMCkgeyBpc0NvbnRhaW5lZCA9IGZhbHNlOyB9XHJcbiAgICB2YXIgcGFkZGluZyA9IHJvb3QucGFkZGluZywgZ24gPSB0eXBlb2Ygcm9vdC5ncm91cHMgIT09ICd1bmRlZmluZWQnID8gcm9vdC5ncm91cHMubGVuZ3RoIDogMCwgbG4gPSB0eXBlb2Ygcm9vdC5sZWF2ZXMgIT09ICd1bmRlZmluZWQnID8gcm9vdC5sZWF2ZXMubGVuZ3RoIDogMCwgY2hpbGRDb25zdHJhaW50cyA9ICFnbiA/IFtdXHJcbiAgICAgICAgOiByb290Lmdyb3Vwcy5yZWR1Y2UoZnVuY3Rpb24gKGNjcywgZykgeyByZXR1cm4gY2NzLmNvbmNhdChnZW5lcmF0ZUdyb3VwQ29uc3RyYWludHMoZywgZiwgbWluU2VwLCB0cnVlKSk7IH0sIFtdKSwgbiA9IChpc0NvbnRhaW5lZCA/IDIgOiAwKSArIGxuICsgZ24sIHZzID0gbmV3IEFycmF5KG4pLCBycyA9IG5ldyBBcnJheShuKSwgaSA9IDAsIGFkZCA9IGZ1bmN0aW9uIChyLCB2KSB7IHJzW2ldID0gcjsgdnNbaSsrXSA9IHY7IH07XHJcbiAgICBpZiAoaXNDb250YWluZWQpIHtcclxuICAgICAgICB2YXIgYiA9IHJvb3QuYm91bmRzLCBjID0gZi5nZXRDZW50cmUoYiksIHMgPSBmLmdldFNpemUoYikgLyAyLCBvcGVuID0gZi5nZXRPcGVuKGIpLCBjbG9zZSA9IGYuZ2V0Q2xvc2UoYiksIG1pbiA9IGMgLSBzICsgcGFkZGluZyAvIDIsIG1heCA9IGMgKyBzIC0gcGFkZGluZyAvIDI7XHJcbiAgICAgICAgcm9vdC5taW5WYXIuZGVzaXJlZFBvc2l0aW9uID0gbWluO1xyXG4gICAgICAgIGFkZChmLm1ha2VSZWN0KG9wZW4sIGNsb3NlLCBtaW4sIHBhZGRpbmcpLCByb290Lm1pblZhcik7XHJcbiAgICAgICAgcm9vdC5tYXhWYXIuZGVzaXJlZFBvc2l0aW9uID0gbWF4O1xyXG4gICAgICAgIGFkZChmLm1ha2VSZWN0KG9wZW4sIGNsb3NlLCBtYXgsIHBhZGRpbmcpLCByb290Lm1heFZhcik7XHJcbiAgICB9XHJcbiAgICBpZiAobG4pXHJcbiAgICAgICAgcm9vdC5sZWF2ZXMuZm9yRWFjaChmdW5jdGlvbiAobCkgeyByZXR1cm4gYWRkKGwuYm91bmRzLCBsLnZhcmlhYmxlKTsgfSk7XHJcbiAgICBpZiAoZ24pXHJcbiAgICAgICAgcm9vdC5ncm91cHMuZm9yRWFjaChmdW5jdGlvbiAoZykge1xyXG4gICAgICAgICAgICB2YXIgYiA9IGcuYm91bmRzO1xyXG4gICAgICAgICAgICBhZGQoZi5tYWtlUmVjdChmLmdldE9wZW4oYiksIGYuZ2V0Q2xvc2UoYiksIGYuZ2V0Q2VudHJlKGIpLCBmLmdldFNpemUoYikpLCBnLm1pblZhcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB2YXIgY3MgPSBnZW5lcmF0ZUNvbnN0cmFpbnRzKHJzLCB2cywgZiwgbWluU2VwKTtcclxuICAgIGlmIChnbikge1xyXG4gICAgICAgIHZzLmZvckVhY2goZnVuY3Rpb24gKHYpIHsgdi5jT3V0ID0gW10sIHYuY0luID0gW107IH0pO1xyXG4gICAgICAgIGNzLmZvckVhY2goZnVuY3Rpb24gKGMpIHsgYy5sZWZ0LmNPdXQucHVzaChjKSwgYy5yaWdodC5jSW4ucHVzaChjKTsgfSk7XHJcbiAgICAgICAgcm9vdC5ncm91cHMuZm9yRWFjaChmdW5jdGlvbiAoZykge1xyXG4gICAgICAgICAgICB2YXIgZ2FwQWRqdXN0bWVudCA9IChnLnBhZGRpbmcgLSBmLmdldFNpemUoZy5ib3VuZHMpKSAvIDI7XHJcbiAgICAgICAgICAgIGcubWluVmFyLmNJbi5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7IHJldHVybiBjLmdhcCArPSBnYXBBZGp1c3RtZW50OyB9KTtcclxuICAgICAgICAgICAgZy5taW5WYXIuY091dC5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7IGMubGVmdCA9IGcubWF4VmFyOyBjLmdhcCArPSBnYXBBZGp1c3RtZW50OyB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiBjaGlsZENvbnN0cmFpbnRzLmNvbmNhdChjcyk7XHJcbn1cclxuZnVuY3Rpb24gZ2VuZXJhdGVDb25zdHJhaW50cyhycywgdmFycywgcmVjdCwgbWluU2VwKSB7XHJcbiAgICB2YXIgaSwgbiA9IHJzLmxlbmd0aDtcclxuICAgIHZhciBOID0gMiAqIG47XHJcbiAgICBjb25zb2xlLmFzc2VydCh2YXJzLmxlbmd0aCA+PSBuKTtcclxuICAgIHZhciBldmVudHMgPSBuZXcgQXJyYXkoTik7XHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSB7XHJcbiAgICAgICAgdmFyIHIgPSByc1tpXTtcclxuICAgICAgICB2YXIgdiA9IG5ldyBOb2RlKHZhcnNbaV0sIHIsIHJlY3QuZ2V0Q2VudHJlKHIpKTtcclxuICAgICAgICBldmVudHNbaV0gPSBuZXcgRXZlbnQodHJ1ZSwgdiwgcmVjdC5nZXRPcGVuKHIpKTtcclxuICAgICAgICBldmVudHNbaSArIG5dID0gbmV3IEV2ZW50KGZhbHNlLCB2LCByZWN0LmdldENsb3NlKHIpKTtcclxuICAgIH1cclxuICAgIGV2ZW50cy5zb3J0KGNvbXBhcmVFdmVudHMpO1xyXG4gICAgdmFyIGNzID0gbmV3IEFycmF5KCk7XHJcbiAgICB2YXIgc2NhbmxpbmUgPSBtYWtlUkJUcmVlKCk7XHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgTjsgKytpKSB7XHJcbiAgICAgICAgdmFyIGUgPSBldmVudHNbaV07XHJcbiAgICAgICAgdmFyIHYgPSBlLnY7XHJcbiAgICAgICAgaWYgKGUuaXNPcGVuKSB7XHJcbiAgICAgICAgICAgIHNjYW5saW5lLmluc2VydCh2KTtcclxuICAgICAgICAgICAgcmVjdC5maW5kTmVpZ2hib3Vycyh2LCBzY2FubGluZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzY2FubGluZS5yZW1vdmUodik7XHJcbiAgICAgICAgICAgIHZhciBtYWtlQ29uc3RyYWludCA9IGZ1bmN0aW9uIChsLCByKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2VwID0gKHJlY3QuZ2V0U2l6ZShsLnIpICsgcmVjdC5nZXRTaXplKHIucikpIC8gMiArIG1pblNlcDtcclxuICAgICAgICAgICAgICAgIGNzLnB1c2gobmV3IHZwc2NfMS5Db25zdHJhaW50KGwudiwgci52LCBzZXApKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdmFyIHZpc2l0TmVpZ2hib3VycyA9IGZ1bmN0aW9uIChmb3J3YXJkLCByZXZlcnNlLCBta2Nvbikge1xyXG4gICAgICAgICAgICAgICAgdmFyIHUsIGl0ID0gdltmb3J3YXJkXS5pdGVyYXRvcigpO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKCh1ID0gaXRbZm9yd2FyZF0oKSkgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBta2Nvbih1LCB2KTtcclxuICAgICAgICAgICAgICAgICAgICB1W3JldmVyc2VdLnJlbW92ZSh2KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdmlzaXROZWlnaGJvdXJzKFwicHJldlwiLCBcIm5leHRcIiwgZnVuY3Rpb24gKHUsIHYpIHsgcmV0dXJuIG1ha2VDb25zdHJhaW50KHUsIHYpOyB9KTtcclxuICAgICAgICAgICAgdmlzaXROZWlnaGJvdXJzKFwibmV4dFwiLCBcInByZXZcIiwgZnVuY3Rpb24gKHUsIHYpIHsgcmV0dXJuIG1ha2VDb25zdHJhaW50KHYsIHUpOyB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLmFzc2VydChzY2FubGluZS5zaXplID09PSAwKTtcclxuICAgIHJldHVybiBjcztcclxufVxyXG5mdW5jdGlvbiBmaW5kWE5laWdoYm91cnModiwgc2NhbmxpbmUpIHtcclxuICAgIHZhciBmID0gZnVuY3Rpb24gKGZvcndhcmQsIHJldmVyc2UpIHtcclxuICAgICAgICB2YXIgaXQgPSBzY2FubGluZS5maW5kSXRlcih2KTtcclxuICAgICAgICB2YXIgdTtcclxuICAgICAgICB3aGlsZSAoKHUgPSBpdFtmb3J3YXJkXSgpKSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB2YXIgdW92ZXJ2WCA9IHUuci5vdmVybGFwWCh2LnIpO1xyXG4gICAgICAgICAgICBpZiAodW92ZXJ2WCA8PSAwIHx8IHVvdmVydlggPD0gdS5yLm92ZXJsYXBZKHYucikpIHtcclxuICAgICAgICAgICAgICAgIHZbZm9yd2FyZF0uaW5zZXJ0KHUpO1xyXG4gICAgICAgICAgICAgICAgdVtyZXZlcnNlXS5pbnNlcnQodik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHVvdmVydlggPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgZihcIm5leHRcIiwgXCJwcmV2XCIpO1xyXG4gICAgZihcInByZXZcIiwgXCJuZXh0XCIpO1xyXG59XHJcbmZ1bmN0aW9uIGZpbmRZTmVpZ2hib3Vycyh2LCBzY2FubGluZSkge1xyXG4gICAgdmFyIGYgPSBmdW5jdGlvbiAoZm9yd2FyZCwgcmV2ZXJzZSkge1xyXG4gICAgICAgIHZhciB1ID0gc2NhbmxpbmUuZmluZEl0ZXIodilbZm9yd2FyZF0oKTtcclxuICAgICAgICBpZiAodSAhPT0gbnVsbCAmJiB1LnIub3ZlcmxhcFgodi5yKSA+IDApIHtcclxuICAgICAgICAgICAgdltmb3J3YXJkXS5pbnNlcnQodSk7XHJcbiAgICAgICAgICAgIHVbcmV2ZXJzZV0uaW5zZXJ0KHYpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBmKFwibmV4dFwiLCBcInByZXZcIik7XHJcbiAgICBmKFwicHJldlwiLCBcIm5leHRcIik7XHJcbn1cclxuZnVuY3Rpb24gZ2VuZXJhdGVYQ29uc3RyYWludHMocnMsIHZhcnMpIHtcclxuICAgIHJldHVybiBnZW5lcmF0ZUNvbnN0cmFpbnRzKHJzLCB2YXJzLCB4UmVjdCwgMWUtNik7XHJcbn1cclxuZXhwb3J0cy5nZW5lcmF0ZVhDb25zdHJhaW50cyA9IGdlbmVyYXRlWENvbnN0cmFpbnRzO1xyXG5mdW5jdGlvbiBnZW5lcmF0ZVlDb25zdHJhaW50cyhycywgdmFycykge1xyXG4gICAgcmV0dXJuIGdlbmVyYXRlQ29uc3RyYWludHMocnMsIHZhcnMsIHlSZWN0LCAxZS02KTtcclxufVxyXG5leHBvcnRzLmdlbmVyYXRlWUNvbnN0cmFpbnRzID0gZ2VuZXJhdGVZQ29uc3RyYWludHM7XHJcbmZ1bmN0aW9uIGdlbmVyYXRlWEdyb3VwQ29uc3RyYWludHMocm9vdCkge1xyXG4gICAgcmV0dXJuIGdlbmVyYXRlR3JvdXBDb25zdHJhaW50cyhyb290LCB4UmVjdCwgMWUtNik7XHJcbn1cclxuZXhwb3J0cy5nZW5lcmF0ZVhHcm91cENvbnN0cmFpbnRzID0gZ2VuZXJhdGVYR3JvdXBDb25zdHJhaW50cztcclxuZnVuY3Rpb24gZ2VuZXJhdGVZR3JvdXBDb25zdHJhaW50cyhyb290KSB7XHJcbiAgICByZXR1cm4gZ2VuZXJhdGVHcm91cENvbnN0cmFpbnRzKHJvb3QsIHlSZWN0LCAxZS02KTtcclxufVxyXG5leHBvcnRzLmdlbmVyYXRlWUdyb3VwQ29uc3RyYWludHMgPSBnZW5lcmF0ZVlHcm91cENvbnN0cmFpbnRzO1xyXG5mdW5jdGlvbiByZW1vdmVPdmVybGFwcyhycykge1xyXG4gICAgdmFyIHZzID0gcnMubWFwKGZ1bmN0aW9uIChyKSB7IHJldHVybiBuZXcgdnBzY18xLlZhcmlhYmxlKHIuY3goKSk7IH0pO1xyXG4gICAgdmFyIGNzID0gZ2VuZXJhdGVYQ29uc3RyYWludHMocnMsIHZzKTtcclxuICAgIHZhciBzb2x2ZXIgPSBuZXcgdnBzY18xLlNvbHZlcih2cywgY3MpO1xyXG4gICAgc29sdmVyLnNvbHZlKCk7XHJcbiAgICB2cy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7IHJldHVybiByc1tpXS5zZXRYQ2VudHJlKHYucG9zaXRpb24oKSk7IH0pO1xyXG4gICAgdnMgPSBycy5tYXAoZnVuY3Rpb24gKHIpIHsgcmV0dXJuIG5ldyB2cHNjXzEuVmFyaWFibGUoci5jeSgpKTsgfSk7XHJcbiAgICBjcyA9IGdlbmVyYXRlWUNvbnN0cmFpbnRzKHJzLCB2cyk7XHJcbiAgICBzb2x2ZXIgPSBuZXcgdnBzY18xLlNvbHZlcih2cywgY3MpO1xyXG4gICAgc29sdmVyLnNvbHZlKCk7XHJcbiAgICB2cy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7IHJldHVybiByc1tpXS5zZXRZQ2VudHJlKHYucG9zaXRpb24oKSk7IH0pO1xyXG59XHJcbmV4cG9ydHMucmVtb3ZlT3ZlcmxhcHMgPSByZW1vdmVPdmVybGFwcztcclxudmFyIEluZGV4ZWRWYXJpYWJsZSA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XHJcbiAgICBfX2V4dGVuZHMoSW5kZXhlZFZhcmlhYmxlLCBfc3VwZXIpO1xyXG4gICAgZnVuY3Rpb24gSW5kZXhlZFZhcmlhYmxlKGluZGV4LCB3KSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgMCwgdykgfHwgdGhpcztcclxuICAgICAgICBfdGhpcy5pbmRleCA9IGluZGV4O1xyXG4gICAgICAgIHJldHVybiBfdGhpcztcclxuICAgIH1cclxuICAgIHJldHVybiBJbmRleGVkVmFyaWFibGU7XHJcbn0odnBzY18xLlZhcmlhYmxlKSk7XHJcbmV4cG9ydHMuSW5kZXhlZFZhcmlhYmxlID0gSW5kZXhlZFZhcmlhYmxlO1xyXG52YXIgUHJvamVjdGlvbiA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBQcm9qZWN0aW9uKG5vZGVzLCBncm91cHMsIHJvb3RHcm91cCwgY29uc3RyYWludHMsIGF2b2lkT3ZlcmxhcHMpIHtcclxuICAgICAgICBpZiAocm9vdEdyb3VwID09PSB2b2lkIDApIHsgcm9vdEdyb3VwID0gbnVsbDsgfVxyXG4gICAgICAgIGlmIChjb25zdHJhaW50cyA9PT0gdm9pZCAwKSB7IGNvbnN0cmFpbnRzID0gbnVsbDsgfVxyXG4gICAgICAgIGlmIChhdm9pZE92ZXJsYXBzID09PSB2b2lkIDApIHsgYXZvaWRPdmVybGFwcyA9IGZhbHNlOyB9XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB0aGlzLm5vZGVzID0gbm9kZXM7XHJcbiAgICAgICAgdGhpcy5ncm91cHMgPSBncm91cHM7XHJcbiAgICAgICAgdGhpcy5yb290R3JvdXAgPSByb290R3JvdXA7XHJcbiAgICAgICAgdGhpcy5hdm9pZE92ZXJsYXBzID0gYXZvaWRPdmVybGFwcztcclxuICAgICAgICB0aGlzLnZhcmlhYmxlcyA9IG5vZGVzLm1hcChmdW5jdGlvbiAodiwgaSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdi52YXJpYWJsZSA9IG5ldyBJbmRleGVkVmFyaWFibGUoaSwgMSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKGNvbnN0cmFpbnRzKVxyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUNvbnN0cmFpbnRzKGNvbnN0cmFpbnRzKTtcclxuICAgICAgICBpZiAoYXZvaWRPdmVybGFwcyAmJiByb290R3JvdXAgJiYgdHlwZW9mIHJvb3RHcm91cC5ncm91cHMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIG5vZGVzLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICAgICAgICAgIGlmICghdi53aWR0aCB8fCAhdi5oZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2LmJvdW5kcyA9IG5ldyBSZWN0YW5nbGUodi54LCB2LngsIHYueSwgdi55KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgdzIgPSB2LndpZHRoIC8gMiwgaDIgPSB2LmhlaWdodCAvIDI7XHJcbiAgICAgICAgICAgICAgICB2LmJvdW5kcyA9IG5ldyBSZWN0YW5nbGUodi54IC0gdzIsIHYueCArIHcyLCB2LnkgLSBoMiwgdi55ICsgaDIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY29tcHV0ZUdyb3VwQm91bmRzKHJvb3RHcm91cCk7XHJcbiAgICAgICAgICAgIHZhciBpID0gbm9kZXMubGVuZ3RoO1xyXG4gICAgICAgICAgICBncm91cHMuZm9yRWFjaChmdW5jdGlvbiAoZykge1xyXG4gICAgICAgICAgICAgICAgX3RoaXMudmFyaWFibGVzW2ldID0gZy5taW5WYXIgPSBuZXcgSW5kZXhlZFZhcmlhYmxlKGkrKywgdHlwZW9mIGcuc3RpZmZuZXNzICE9PSBcInVuZGVmaW5lZFwiID8gZy5zdGlmZm5lc3MgOiAwLjAxKTtcclxuICAgICAgICAgICAgICAgIF90aGlzLnZhcmlhYmxlc1tpXSA9IGcubWF4VmFyID0gbmV3IEluZGV4ZWRWYXJpYWJsZShpKyssIHR5cGVvZiBnLnN0aWZmbmVzcyAhPT0gXCJ1bmRlZmluZWRcIiA/IGcuc3RpZmZuZXNzIDogMC4wMSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFByb2plY3Rpb24ucHJvdG90eXBlLmNyZWF0ZVNlcGFyYXRpb24gPSBmdW5jdGlvbiAoYykge1xyXG4gICAgICAgIHJldHVybiBuZXcgdnBzY18xLkNvbnN0cmFpbnQodGhpcy5ub2Rlc1tjLmxlZnRdLnZhcmlhYmxlLCB0aGlzLm5vZGVzW2MucmlnaHRdLnZhcmlhYmxlLCBjLmdhcCwgdHlwZW9mIGMuZXF1YWxpdHkgIT09IFwidW5kZWZpbmVkXCIgPyBjLmVxdWFsaXR5IDogZmFsc2UpO1xyXG4gICAgfTtcclxuICAgIFByb2plY3Rpb24ucHJvdG90eXBlLm1ha2VGZWFzaWJsZSA9IGZ1bmN0aW9uIChjKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICBpZiAoIXRoaXMuYXZvaWRPdmVybGFwcylcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHZhciBheGlzID0gJ3gnLCBkaW0gPSAnd2lkdGgnO1xyXG4gICAgICAgIGlmIChjLmF4aXMgPT09ICd4JylcclxuICAgICAgICAgICAgYXhpcyA9ICd5JywgZGltID0gJ2hlaWdodCc7XHJcbiAgICAgICAgdmFyIHZzID0gYy5vZmZzZXRzLm1hcChmdW5jdGlvbiAobykgeyByZXR1cm4gX3RoaXMubm9kZXNbby5ub2RlXTsgfSkuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYVtheGlzXSAtIGJbYXhpc107IH0pO1xyXG4gICAgICAgIHZhciBwID0gbnVsbDtcclxuICAgICAgICB2cy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgIGlmIChwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV4dFBvcyA9IHBbYXhpc10gKyBwW2RpbV07XHJcbiAgICAgICAgICAgICAgICBpZiAobmV4dFBvcyA+IHZbYXhpc10pIHtcclxuICAgICAgICAgICAgICAgICAgICB2W2F4aXNdID0gbmV4dFBvcztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwID0gdjtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBQcm9qZWN0aW9uLnByb3RvdHlwZS5jcmVhdGVBbGlnbm1lbnQgPSBmdW5jdGlvbiAoYykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdmFyIHUgPSB0aGlzLm5vZGVzW2Mub2Zmc2V0c1swXS5ub2RlXS52YXJpYWJsZTtcclxuICAgICAgICB0aGlzLm1ha2VGZWFzaWJsZShjKTtcclxuICAgICAgICB2YXIgY3MgPSBjLmF4aXMgPT09ICd4JyA/IHRoaXMueENvbnN0cmFpbnRzIDogdGhpcy55Q29uc3RyYWludHM7XHJcbiAgICAgICAgYy5vZmZzZXRzLnNsaWNlKDEpLmZvckVhY2goZnVuY3Rpb24gKG8pIHtcclxuICAgICAgICAgICAgdmFyIHYgPSBfdGhpcy5ub2Rlc1tvLm5vZGVdLnZhcmlhYmxlO1xyXG4gICAgICAgICAgICBjcy5wdXNoKG5ldyB2cHNjXzEuQ29uc3RyYWludCh1LCB2LCBvLm9mZnNldCwgdHJ1ZSkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIFByb2plY3Rpb24ucHJvdG90eXBlLmNyZWF0ZUNvbnN0cmFpbnRzID0gZnVuY3Rpb24gKGNvbnN0cmFpbnRzKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgaXNTZXAgPSBmdW5jdGlvbiAoYykgeyByZXR1cm4gdHlwZW9mIGMudHlwZSA9PT0gJ3VuZGVmaW5lZCcgfHwgYy50eXBlID09PSAnc2VwYXJhdGlvbic7IH07XHJcbiAgICAgICAgdGhpcy54Q29uc3RyYWludHMgPSBjb25zdHJhaW50c1xyXG4gICAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uIChjKSB7IHJldHVybiBjLmF4aXMgPT09IFwieFwiICYmIGlzU2VwKGMpOyB9KVxyXG4gICAgICAgICAgICAubWFwKGZ1bmN0aW9uIChjKSB7IHJldHVybiBfdGhpcy5jcmVhdGVTZXBhcmF0aW9uKGMpOyB9KTtcclxuICAgICAgICB0aGlzLnlDb25zdHJhaW50cyA9IGNvbnN0cmFpbnRzXHJcbiAgICAgICAgICAgIC5maWx0ZXIoZnVuY3Rpb24gKGMpIHsgcmV0dXJuIGMuYXhpcyA9PT0gXCJ5XCIgJiYgaXNTZXAoYyk7IH0pXHJcbiAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24gKGMpIHsgcmV0dXJuIF90aGlzLmNyZWF0ZVNlcGFyYXRpb24oYyk7IH0pO1xyXG4gICAgICAgIGNvbnN0cmFpbnRzXHJcbiAgICAgICAgICAgIC5maWx0ZXIoZnVuY3Rpb24gKGMpIHsgcmV0dXJuIGMudHlwZSA9PT0gJ2FsaWdubWVudCc7IH0pXHJcbiAgICAgICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7IHJldHVybiBfdGhpcy5jcmVhdGVBbGlnbm1lbnQoYyk7IH0pO1xyXG4gICAgfTtcclxuICAgIFByb2plY3Rpb24ucHJvdG90eXBlLnNldHVwVmFyaWFibGVzQW5kQm91bmRzID0gZnVuY3Rpb24gKHgwLCB5MCwgZGVzaXJlZCwgZ2V0RGVzaXJlZCkge1xyXG4gICAgICAgIHRoaXMubm9kZXMuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkge1xyXG4gICAgICAgICAgICBpZiAodi5maXhlZCkge1xyXG4gICAgICAgICAgICAgICAgdi52YXJpYWJsZS53ZWlnaHQgPSB2LmZpeGVkV2VpZ2h0ID8gdi5maXhlZFdlaWdodCA6IDEwMDA7XHJcbiAgICAgICAgICAgICAgICBkZXNpcmVkW2ldID0gZ2V0RGVzaXJlZCh2KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHYudmFyaWFibGUud2VpZ2h0ID0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdyA9ICh2LndpZHRoIHx8IDApIC8gMiwgaCA9ICh2LmhlaWdodCB8fCAwKSAvIDI7XHJcbiAgICAgICAgICAgIHZhciBpeCA9IHgwW2ldLCBpeSA9IHkwW2ldO1xyXG4gICAgICAgICAgICB2LmJvdW5kcyA9IG5ldyBSZWN0YW5nbGUoaXggLSB3LCBpeCArIHcsIGl5IC0gaCwgaXkgKyBoKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBQcm9qZWN0aW9uLnByb3RvdHlwZS54UHJvamVjdCA9IGZ1bmN0aW9uICh4MCwgeTAsIHgpIHtcclxuICAgICAgICBpZiAoIXRoaXMucm9vdEdyb3VwICYmICEodGhpcy5hdm9pZE92ZXJsYXBzIHx8IHRoaXMueENvbnN0cmFpbnRzKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMucHJvamVjdCh4MCwgeTAsIHgwLCB4LCBmdW5jdGlvbiAodikgeyByZXR1cm4gdi5weDsgfSwgdGhpcy54Q29uc3RyYWludHMsIGdlbmVyYXRlWEdyb3VwQ29uc3RyYWludHMsIGZ1bmN0aW9uICh2KSB7IHJldHVybiB2LmJvdW5kcy5zZXRYQ2VudHJlKHhbdi52YXJpYWJsZS5pbmRleF0gPSB2LnZhcmlhYmxlLnBvc2l0aW9uKCkpOyB9LCBmdW5jdGlvbiAoZykge1xyXG4gICAgICAgICAgICB2YXIgeG1pbiA9IHhbZy5taW5WYXIuaW5kZXhdID0gZy5taW5WYXIucG9zaXRpb24oKTtcclxuICAgICAgICAgICAgdmFyIHhtYXggPSB4W2cubWF4VmFyLmluZGV4XSA9IGcubWF4VmFyLnBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgIHZhciBwMiA9IGcucGFkZGluZyAvIDI7XHJcbiAgICAgICAgICAgIGcuYm91bmRzLnggPSB4bWluIC0gcDI7XHJcbiAgICAgICAgICAgIGcuYm91bmRzLlggPSB4bWF4ICsgcDI7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgUHJvamVjdGlvbi5wcm90b3R5cGUueVByb2plY3QgPSBmdW5jdGlvbiAoeDAsIHkwLCB5KSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnJvb3RHcm91cCAmJiAhdGhpcy55Q29uc3RyYWludHMpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB0aGlzLnByb2plY3QoeDAsIHkwLCB5MCwgeSwgZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHYucHk7IH0sIHRoaXMueUNvbnN0cmFpbnRzLCBnZW5lcmF0ZVlHcm91cENvbnN0cmFpbnRzLCBmdW5jdGlvbiAodikgeyByZXR1cm4gdi5ib3VuZHMuc2V0WUNlbnRyZSh5W3YudmFyaWFibGUuaW5kZXhdID0gdi52YXJpYWJsZS5wb3NpdGlvbigpKTsgfSwgZnVuY3Rpb24gKGcpIHtcclxuICAgICAgICAgICAgdmFyIHltaW4gPSB5W2cubWluVmFyLmluZGV4XSA9IGcubWluVmFyLnBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgIHZhciB5bWF4ID0geVtnLm1heFZhci5pbmRleF0gPSBnLm1heFZhci5wb3NpdGlvbigpO1xyXG4gICAgICAgICAgICB2YXIgcDIgPSBnLnBhZGRpbmcgLyAyO1xyXG4gICAgICAgICAgICBnLmJvdW5kcy55ID0geW1pbiAtIHAyO1xyXG4gICAgICAgICAgICA7XHJcbiAgICAgICAgICAgIGcuYm91bmRzLlkgPSB5bWF4ICsgcDI7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgUHJvamVjdGlvbi5wcm90b3R5cGUucHJvamVjdEZ1bmN0aW9ucyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uICh4MCwgeTAsIHgpIHsgcmV0dXJuIF90aGlzLnhQcm9qZWN0KHgwLCB5MCwgeCk7IH0sXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uICh4MCwgeTAsIHkpIHsgcmV0dXJuIF90aGlzLnlQcm9qZWN0KHgwLCB5MCwgeSk7IH1cclxuICAgICAgICBdO1xyXG4gICAgfTtcclxuICAgIFByb2plY3Rpb24ucHJvdG90eXBlLnByb2plY3QgPSBmdW5jdGlvbiAoeDAsIHkwLCBzdGFydCwgZGVzaXJlZCwgZ2V0RGVzaXJlZCwgY3MsIGdlbmVyYXRlQ29uc3RyYWludHMsIHVwZGF0ZU5vZGVCb3VuZHMsIHVwZGF0ZUdyb3VwQm91bmRzKSB7XHJcbiAgICAgICAgdGhpcy5zZXR1cFZhcmlhYmxlc0FuZEJvdW5kcyh4MCwgeTAsIGRlc2lyZWQsIGdldERlc2lyZWQpO1xyXG4gICAgICAgIGlmICh0aGlzLnJvb3RHcm91cCAmJiB0aGlzLmF2b2lkT3ZlcmxhcHMpIHtcclxuICAgICAgICAgICAgY29tcHV0ZUdyb3VwQm91bmRzKHRoaXMucm9vdEdyb3VwKTtcclxuICAgICAgICAgICAgY3MgPSBjcy5jb25jYXQoZ2VuZXJhdGVDb25zdHJhaW50cyh0aGlzLnJvb3RHcm91cCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNvbHZlKHRoaXMudmFyaWFibGVzLCBjcywgc3RhcnQsIGRlc2lyZWQpO1xyXG4gICAgICAgIHRoaXMubm9kZXMuZm9yRWFjaCh1cGRhdGVOb2RlQm91bmRzKTtcclxuICAgICAgICBpZiAodGhpcy5yb290R3JvdXAgJiYgdGhpcy5hdm9pZE92ZXJsYXBzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBzLmZvckVhY2godXBkYXRlR3JvdXBCb3VuZHMpO1xyXG4gICAgICAgICAgICBjb21wdXRlR3JvdXBCb3VuZHModGhpcy5yb290R3JvdXApO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBQcm9qZWN0aW9uLnByb3RvdHlwZS5zb2x2ZSA9IGZ1bmN0aW9uICh2cywgY3MsIHN0YXJ0aW5nLCBkZXNpcmVkKSB7XHJcbiAgICAgICAgdmFyIHNvbHZlciA9IG5ldyB2cHNjXzEuU29sdmVyKHZzLCBjcyk7XHJcbiAgICAgICAgc29sdmVyLnNldFN0YXJ0aW5nUG9zaXRpb25zKHN0YXJ0aW5nKTtcclxuICAgICAgICBzb2x2ZXIuc2V0RGVzaXJlZFBvc2l0aW9ucyhkZXNpcmVkKTtcclxuICAgICAgICBzb2x2ZXIuc29sdmUoKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gUHJvamVjdGlvbjtcclxufSgpKTtcclxuZXhwb3J0cy5Qcm9qZWN0aW9uID0gUHJvamVjdGlvbjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVjdGFuZ2xlLmpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi93ZWJjb2xhL2Rpc3Qvc3JjL3JlY3RhbmdsZS5qc1xuLy8gbW9kdWxlIGlkID0gM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgcHF1ZXVlXzEgPSByZXF1aXJlKFwiLi9wcXVldWVcIik7XHJcbnZhciBOZWlnaGJvdXIgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTmVpZ2hib3VyKGlkLCBkaXN0YW5jZSkge1xyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgICAgICB0aGlzLmRpc3RhbmNlID0gZGlzdGFuY2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gTmVpZ2hib3VyO1xyXG59KCkpO1xyXG52YXIgTm9kZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBOb2RlKGlkKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgICAgIHRoaXMubmVpZ2hib3VycyA9IFtdO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIE5vZGU7XHJcbn0oKSk7XHJcbnZhciBRdWV1ZUVudHJ5ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFF1ZXVlRW50cnkobm9kZSwgcHJldiwgZCkge1xyXG4gICAgICAgIHRoaXMubm9kZSA9IG5vZGU7XHJcbiAgICAgICAgdGhpcy5wcmV2ID0gcHJldjtcclxuICAgICAgICB0aGlzLmQgPSBkO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFF1ZXVlRW50cnk7XHJcbn0oKSk7XHJcbnZhciBDYWxjdWxhdG9yID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIENhbGN1bGF0b3IobiwgZXMsIGdldFNvdXJjZUluZGV4LCBnZXRUYXJnZXRJbmRleCwgZ2V0TGVuZ3RoKSB7XHJcbiAgICAgICAgdGhpcy5uID0gbjtcclxuICAgICAgICB0aGlzLmVzID0gZXM7XHJcbiAgICAgICAgdGhpcy5uZWlnaGJvdXJzID0gbmV3IEFycmF5KHRoaXMubik7XHJcbiAgICAgICAgdmFyIGkgPSB0aGlzLm47XHJcbiAgICAgICAgd2hpbGUgKGktLSlcclxuICAgICAgICAgICAgdGhpcy5uZWlnaGJvdXJzW2ldID0gbmV3IE5vZGUoaSk7XHJcbiAgICAgICAgaSA9IHRoaXMuZXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgICAgICAgdmFyIGUgPSB0aGlzLmVzW2ldO1xyXG4gICAgICAgICAgICB2YXIgdSA9IGdldFNvdXJjZUluZGV4KGUpLCB2ID0gZ2V0VGFyZ2V0SW5kZXgoZSk7XHJcbiAgICAgICAgICAgIHZhciBkID0gZ2V0TGVuZ3RoKGUpO1xyXG4gICAgICAgICAgICB0aGlzLm5laWdoYm91cnNbdV0ubmVpZ2hib3Vycy5wdXNoKG5ldyBOZWlnaGJvdXIodiwgZCkpO1xyXG4gICAgICAgICAgICB0aGlzLm5laWdoYm91cnNbdl0ubmVpZ2hib3Vycy5wdXNoKG5ldyBOZWlnaGJvdXIodSwgZCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIENhbGN1bGF0b3IucHJvdG90eXBlLkRpc3RhbmNlTWF0cml4ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBEID0gbmV3IEFycmF5KHRoaXMubik7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm47ICsraSkge1xyXG4gICAgICAgICAgICBEW2ldID0gdGhpcy5kaWprc3RyYU5laWdoYm91cnMoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBEO1xyXG4gICAgfTtcclxuICAgIENhbGN1bGF0b3IucHJvdG90eXBlLkRpc3RhbmNlc0Zyb21Ob2RlID0gZnVuY3Rpb24gKHN0YXJ0KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlqa3N0cmFOZWlnaGJvdXJzKHN0YXJ0KTtcclxuICAgIH07XHJcbiAgICBDYWxjdWxhdG9yLnByb3RvdHlwZS5QYXRoRnJvbU5vZGVUb05vZGUgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRpamtzdHJhTmVpZ2hib3VycyhzdGFydCwgZW5kKTtcclxuICAgIH07XHJcbiAgICBDYWxjdWxhdG9yLnByb3RvdHlwZS5QYXRoRnJvbU5vZGVUb05vZGVXaXRoUHJldkNvc3QgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCwgcHJldkNvc3QpIHtcclxuICAgICAgICB2YXIgcSA9IG5ldyBwcXVldWVfMS5Qcmlvcml0eVF1ZXVlKGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhLmQgPD0gYi5kOyB9KSwgdSA9IHRoaXMubmVpZ2hib3Vyc1tzdGFydF0sIHF1ID0gbmV3IFF1ZXVlRW50cnkodSwgbnVsbCwgMCksIHZpc2l0ZWRGcm9tID0ge307XHJcbiAgICAgICAgcS5wdXNoKHF1KTtcclxuICAgICAgICB3aGlsZSAoIXEuZW1wdHkoKSkge1xyXG4gICAgICAgICAgICBxdSA9IHEucG9wKCk7XHJcbiAgICAgICAgICAgIHUgPSBxdS5ub2RlO1xyXG4gICAgICAgICAgICBpZiAodS5pZCA9PT0gZW5kKSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgaSA9IHUubmVpZ2hib3Vycy5sZW5ndGg7XHJcbiAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgICAgICAgICAgIHZhciBuZWlnaGJvdXIgPSB1Lm5laWdoYm91cnNbaV0sIHYgPSB0aGlzLm5laWdoYm91cnNbbmVpZ2hib3VyLmlkXTtcclxuICAgICAgICAgICAgICAgIGlmIChxdS5wcmV2ICYmIHYuaWQgPT09IHF1LnByZXYubm9kZS5pZClcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIHZhciB2aWR1aWQgPSB2LmlkICsgJywnICsgdS5pZDtcclxuICAgICAgICAgICAgICAgIGlmICh2aWR1aWQgaW4gdmlzaXRlZEZyb20gJiYgdmlzaXRlZEZyb21bdmlkdWlkXSA8PSBxdS5kKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNjID0gcXUucHJldiA/IHByZXZDb3N0KHF1LnByZXYubm9kZS5pZCwgdS5pZCwgdi5pZCkgOiAwLCB0ID0gcXUuZCArIG5laWdoYm91ci5kaXN0YW5jZSArIGNjO1xyXG4gICAgICAgICAgICAgICAgdmlzaXRlZEZyb21bdmlkdWlkXSA9IHQ7XHJcbiAgICAgICAgICAgICAgICBxLnB1c2gobmV3IFF1ZXVlRW50cnkodiwgcXUsIHQpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcGF0aCA9IFtdO1xyXG4gICAgICAgIHdoaWxlIChxdS5wcmV2KSB7XHJcbiAgICAgICAgICAgIHF1ID0gcXUucHJldjtcclxuICAgICAgICAgICAgcGF0aC5wdXNoKHF1Lm5vZGUuaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcGF0aDtcclxuICAgIH07XHJcbiAgICBDYWxjdWxhdG9yLnByb3RvdHlwZS5kaWprc3RyYU5laWdoYm91cnMgPSBmdW5jdGlvbiAoc3RhcnQsIGRlc3QpIHtcclxuICAgICAgICBpZiAoZGVzdCA9PT0gdm9pZCAwKSB7IGRlc3QgPSAtMTsgfVxyXG4gICAgICAgIHZhciBxID0gbmV3IHBxdWV1ZV8xLlByaW9yaXR5UXVldWUoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIGEuZCA8PSBiLmQ7IH0pLCBpID0gdGhpcy5uZWlnaGJvdXJzLmxlbmd0aCwgZCA9IG5ldyBBcnJheShpKTtcclxuICAgICAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5uZWlnaGJvdXJzW2ldO1xyXG4gICAgICAgICAgICBub2RlLmQgPSBpID09PSBzdGFydCA/IDAgOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICAgICAgICAgIG5vZGUucSA9IHEucHVzaChub2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgd2hpbGUgKCFxLmVtcHR5KCkpIHtcclxuICAgICAgICAgICAgdmFyIHUgPSBxLnBvcCgpO1xyXG4gICAgICAgICAgICBkW3UuaWRdID0gdS5kO1xyXG4gICAgICAgICAgICBpZiAodS5pZCA9PT0gZGVzdCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhdGggPSBbXTtcclxuICAgICAgICAgICAgICAgIHZhciB2ID0gdTtcclxuICAgICAgICAgICAgICAgIHdoaWxlICh0eXBlb2Ygdi5wcmV2ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhdGgucHVzaCh2LnByZXYuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHYgPSB2LnByZXY7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcGF0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpID0gdS5uZWlnaGJvdXJzLmxlbmd0aDtcclxuICAgICAgICAgICAgd2hpbGUgKGktLSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG5laWdoYm91ciA9IHUubmVpZ2hib3Vyc1tpXTtcclxuICAgICAgICAgICAgICAgIHZhciB2ID0gdGhpcy5uZWlnaGJvdXJzW25laWdoYm91ci5pZF07XHJcbiAgICAgICAgICAgICAgICB2YXIgdCA9IHUuZCArIG5laWdoYm91ci5kaXN0YW5jZTtcclxuICAgICAgICAgICAgICAgIGlmICh1LmQgIT09IE51bWJlci5NQVhfVkFMVUUgJiYgdi5kID4gdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHYuZCA9IHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdi5wcmV2ID0gdTtcclxuICAgICAgICAgICAgICAgICAgICBxLnJlZHVjZUtleSh2LnEsIHYsIGZ1bmN0aW9uIChlLCBxKSB7IHJldHVybiBlLnEgPSBxOyB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZDtcclxuICAgIH07XHJcbiAgICByZXR1cm4gQ2FsY3VsYXRvcjtcclxufSgpKTtcclxuZXhwb3J0cy5DYWxjdWxhdG9yID0gQ2FsY3VsYXRvcjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2hvcnRlc3RwYXRocy5qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vd2ViY29sYS9kaXN0L3NyYy9zaG9ydGVzdHBhdGhzLmpzXG4vLyBtb2R1bGUgaWQgPSA0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBMb2NrcyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBMb2NrcygpIHtcclxuICAgICAgICB0aGlzLmxvY2tzID0ge307XHJcbiAgICB9XHJcbiAgICBMb2Nrcy5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKGlkLCB4KSB7XHJcbiAgICAgICAgdGhpcy5sb2Nrc1tpZF0gPSB4O1xyXG4gICAgfTtcclxuICAgIExvY2tzLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmxvY2tzID0ge307XHJcbiAgICB9O1xyXG4gICAgTG9ja3MucHJvdG90eXBlLmlzRW1wdHkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZm9yICh2YXIgbCBpbiB0aGlzLmxvY2tzKVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9O1xyXG4gICAgTG9ja3MucHJvdG90eXBlLmFwcGx5ID0gZnVuY3Rpb24gKGYpIHtcclxuICAgICAgICBmb3IgKHZhciBsIGluIHRoaXMubG9ja3MpIHtcclxuICAgICAgICAgICAgZihOdW1iZXIobCksIHRoaXMubG9ja3NbbF0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICByZXR1cm4gTG9ja3M7XHJcbn0oKSk7XHJcbmV4cG9ydHMuTG9ja3MgPSBMb2NrcztcclxudmFyIERlc2NlbnQgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gRGVzY2VudCh4LCBELCBHKSB7XHJcbiAgICAgICAgaWYgKEcgPT09IHZvaWQgMCkgeyBHID0gbnVsbDsgfVxyXG4gICAgICAgIHRoaXMuRCA9IEQ7XHJcbiAgICAgICAgdGhpcy5HID0gRztcclxuICAgICAgICB0aGlzLnRocmVzaG9sZCA9IDAuMDAwMTtcclxuICAgICAgICB0aGlzLm51bUdyaWRTbmFwTm9kZXMgPSAwO1xyXG4gICAgICAgIHRoaXMuc25hcEdyaWRTaXplID0gMTAwO1xyXG4gICAgICAgIHRoaXMuc25hcFN0cmVuZ3RoID0gMTAwMDtcclxuICAgICAgICB0aGlzLnNjYWxlU25hcEJ5TWF4SCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMucmFuZG9tID0gbmV3IFBzZXVkb1JhbmRvbSgpO1xyXG4gICAgICAgIHRoaXMucHJvamVjdCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLmsgPSB4Lmxlbmd0aDtcclxuICAgICAgICB2YXIgbiA9IHRoaXMubiA9IHhbMF0ubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMuSCA9IG5ldyBBcnJheSh0aGlzLmspO1xyXG4gICAgICAgIHRoaXMuZyA9IG5ldyBBcnJheSh0aGlzLmspO1xyXG4gICAgICAgIHRoaXMuSGQgPSBuZXcgQXJyYXkodGhpcy5rKTtcclxuICAgICAgICB0aGlzLmEgPSBuZXcgQXJyYXkodGhpcy5rKTtcclxuICAgICAgICB0aGlzLmIgPSBuZXcgQXJyYXkodGhpcy5rKTtcclxuICAgICAgICB0aGlzLmMgPSBuZXcgQXJyYXkodGhpcy5rKTtcclxuICAgICAgICB0aGlzLmQgPSBuZXcgQXJyYXkodGhpcy5rKTtcclxuICAgICAgICB0aGlzLmUgPSBuZXcgQXJyYXkodGhpcy5rKTtcclxuICAgICAgICB0aGlzLmlhID0gbmV3IEFycmF5KHRoaXMuayk7XHJcbiAgICAgICAgdGhpcy5pYiA9IG5ldyBBcnJheSh0aGlzLmspO1xyXG4gICAgICAgIHRoaXMueHRtcCA9IG5ldyBBcnJheSh0aGlzLmspO1xyXG4gICAgICAgIHRoaXMubG9ja3MgPSBuZXcgTG9ja3MoKTtcclxuICAgICAgICB0aGlzLm1pbkQgPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgICAgIHZhciBpID0gbiwgajtcclxuICAgICAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgICAgICAgIGogPSBuO1xyXG4gICAgICAgICAgICB3aGlsZSAoLS1qID4gaSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGQgPSBEW2ldW2pdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGQgPiAwICYmIGQgPCB0aGlzLm1pbkQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1pbkQgPSBkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm1pbkQgPT09IE51bWJlci5NQVhfVkFMVUUpXHJcbiAgICAgICAgICAgIHRoaXMubWluRCA9IDE7XHJcbiAgICAgICAgaSA9IHRoaXMuaztcclxuICAgICAgICB3aGlsZSAoaS0tKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ1tpXSA9IG5ldyBBcnJheShuKTtcclxuICAgICAgICAgICAgdGhpcy5IW2ldID0gbmV3IEFycmF5KG4pO1xyXG4gICAgICAgICAgICBqID0gbjtcclxuICAgICAgICAgICAgd2hpbGUgKGotLSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5IW2ldW2pdID0gbmV3IEFycmF5KG4pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuSGRbaV0gPSBuZXcgQXJyYXkobik7XHJcbiAgICAgICAgICAgIHRoaXMuYVtpXSA9IG5ldyBBcnJheShuKTtcclxuICAgICAgICAgICAgdGhpcy5iW2ldID0gbmV3IEFycmF5KG4pO1xyXG4gICAgICAgICAgICB0aGlzLmNbaV0gPSBuZXcgQXJyYXkobik7XHJcbiAgICAgICAgICAgIHRoaXMuZFtpXSA9IG5ldyBBcnJheShuKTtcclxuICAgICAgICAgICAgdGhpcy5lW2ldID0gbmV3IEFycmF5KG4pO1xyXG4gICAgICAgICAgICB0aGlzLmlhW2ldID0gbmV3IEFycmF5KG4pO1xyXG4gICAgICAgICAgICB0aGlzLmliW2ldID0gbmV3IEFycmF5KG4pO1xyXG4gICAgICAgICAgICB0aGlzLnh0bXBbaV0gPSBuZXcgQXJyYXkobik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgRGVzY2VudC5jcmVhdGVTcXVhcmVNYXRyaXggPSBmdW5jdGlvbiAobiwgZikge1xyXG4gICAgICAgIHZhciBNID0gbmV3IEFycmF5KG4pO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKSB7XHJcbiAgICAgICAgICAgIE1baV0gPSBuZXcgQXJyYXkobik7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbjsgKytqKSB7XHJcbiAgICAgICAgICAgICAgICBNW2ldW2pdID0gZihpLCBqKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gTTtcclxuICAgIH07XHJcbiAgICBEZXNjZW50LnByb3RvdHlwZS5vZmZzZXREaXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgdSA9IG5ldyBBcnJheSh0aGlzLmspO1xyXG4gICAgICAgIHZhciBsID0gMDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuazsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciB4ID0gdVtpXSA9IHRoaXMucmFuZG9tLmdldE5leHRCZXR3ZWVuKDAuMDEsIDEpIC0gMC41O1xyXG4gICAgICAgICAgICBsICs9IHggKiB4O1xyXG4gICAgICAgIH1cclxuICAgICAgICBsID0gTWF0aC5zcXJ0KGwpO1xyXG4gICAgICAgIHJldHVybiB1Lm1hcChmdW5jdGlvbiAoeCkgeyByZXR1cm4geCAqPSBfdGhpcy5taW5EIC8gbDsgfSk7XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC5wcm90b3R5cGUuY29tcHV0ZURlcml2YXRpdmVzID0gZnVuY3Rpb24gKHgpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHZhciBuID0gdGhpcy5uO1xyXG4gICAgICAgIGlmIChuIDwgMSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHZhciBpO1xyXG4gICAgICAgIHZhciBkID0gbmV3IEFycmF5KHRoaXMuayk7XHJcbiAgICAgICAgdmFyIGQyID0gbmV3IEFycmF5KHRoaXMuayk7XHJcbiAgICAgICAgdmFyIEh1dSA9IG5ldyBBcnJheSh0aGlzLmspO1xyXG4gICAgICAgIHZhciBtYXhIID0gMDtcclxuICAgICAgICBmb3IgKHZhciB1ID0gMDsgdSA8IG47ICsrdSkge1xyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5rOyArK2kpXHJcbiAgICAgICAgICAgICAgICBIdXVbaV0gPSB0aGlzLmdbaV1bdV0gPSAwO1xyXG4gICAgICAgICAgICBmb3IgKHZhciB2ID0gMDsgdiA8IG47ICsrdikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHUgPT09IHYpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWF4RGlzcGxhY2VzID0gbjtcclxuICAgICAgICAgICAgICAgIHdoaWxlIChtYXhEaXNwbGFjZXMtLSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZDIgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLms7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZHggPSBkW2ldID0geFtpXVt1XSAtIHhbaV1bdl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNkMiArPSBkMltpXSA9IGR4ICogZHg7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZDIgPiAxZS05KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmQgPSB0aGlzLm9mZnNldERpcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLms7ICsraSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgeFtpXVt2XSArPSByZFtpXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBsID0gTWF0aC5zcXJ0KHNkMik7XHJcbiAgICAgICAgICAgICAgICB2YXIgRCA9IHRoaXMuRFt1XVt2XTtcclxuICAgICAgICAgICAgICAgIHZhciB3ZWlnaHQgPSB0aGlzLkcgIT0gbnVsbCA/IHRoaXMuR1t1XVt2XSA6IDE7XHJcbiAgICAgICAgICAgICAgICBpZiAod2VpZ2h0ID4gMSAmJiBsID4gRCB8fCAhaXNGaW5pdGUoRCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5rOyArK2kpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuSFtpXVt1XVt2XSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAod2VpZ2h0ID4gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdlaWdodCA9IDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgRDIgPSBEICogRDtcclxuICAgICAgICAgICAgICAgIHZhciBncyA9IDIgKiB3ZWlnaHQgKiAobCAtIEQpIC8gKEQyICogbCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgbDMgPSBsICogbCAqIGw7XHJcbiAgICAgICAgICAgICAgICB2YXIgaHMgPSAyICogLXdlaWdodCAvIChEMiAqIGwzKTtcclxuICAgICAgICAgICAgICAgIGlmICghaXNGaW5pdGUoZ3MpKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGdzKTtcclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLms7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ1tpXVt1XSArPSBkW2ldICogZ3M7XHJcbiAgICAgICAgICAgICAgICAgICAgSHV1W2ldIC09IHRoaXMuSFtpXVt1XVt2XSA9IGhzICogKGwzICsgRCAqIChkMltpXSAtIHNkMikgKyBsICogc2QyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5rOyArK2kpXHJcbiAgICAgICAgICAgICAgICBtYXhIID0gTWF0aC5tYXgobWF4SCwgdGhpcy5IW2ldW3VdW3VdID0gSHV1W2ldKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHIgPSB0aGlzLnNuYXBHcmlkU2l6ZSAvIDI7XHJcbiAgICAgICAgdmFyIGcgPSB0aGlzLnNuYXBHcmlkU2l6ZTtcclxuICAgICAgICB2YXIgdyA9IHRoaXMuc25hcFN0cmVuZ3RoO1xyXG4gICAgICAgIHZhciBrID0gdyAvIChyICogcik7XHJcbiAgICAgICAgdmFyIG51bU5vZGVzID0gdGhpcy5udW1HcmlkU25hcE5vZGVzO1xyXG4gICAgICAgIGZvciAodmFyIHUgPSAwOyB1IDwgbnVtTm9kZXM7ICsrdSkge1xyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5rOyArK2kpIHtcclxuICAgICAgICAgICAgICAgIHZhciB4aXUgPSB0aGlzLnhbaV1bdV07XHJcbiAgICAgICAgICAgICAgICB2YXIgbSA9IHhpdSAvIGc7XHJcbiAgICAgICAgICAgICAgICB2YXIgZiA9IG0gJSAxO1xyXG4gICAgICAgICAgICAgICAgdmFyIHEgPSBtIC0gZjtcclxuICAgICAgICAgICAgICAgIHZhciBhID0gTWF0aC5hYnMoZik7XHJcbiAgICAgICAgICAgICAgICB2YXIgZHggPSAoYSA8PSAwLjUpID8geGl1IC0gcSAqIGcgOlxyXG4gICAgICAgICAgICAgICAgICAgICh4aXUgPiAwKSA/IHhpdSAtIChxICsgMSkgKiBnIDogeGl1IC0gKHEgLSAxKSAqIGc7XHJcbiAgICAgICAgICAgICAgICBpZiAoLXIgPCBkeCAmJiBkeCA8PSByKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2NhbGVTbmFwQnlNYXhIKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ1tpXVt1XSArPSBtYXhIICogayAqIGR4O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLkhbaV1bdV1bdV0gKz0gbWF4SCAqIGs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdbaV1bdV0gKz0gayAqIGR4O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLkhbaV1bdV1bdV0gKz0gaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLmxvY2tzLmlzRW1wdHkoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmxvY2tzLmFwcGx5KGZ1bmN0aW9uICh1LCBwKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgX3RoaXMuazsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuSFtpXVt1XVt1XSArPSBtYXhIO1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmdbaV1bdV0gLT0gbWF4SCAqIChwW2ldIC0geFtpXVt1XSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBEZXNjZW50LmRvdFByb2QgPSBmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgIHZhciB4ID0gMCwgaSA9IGEubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlIChpLS0pXHJcbiAgICAgICAgICAgIHggKz0gYVtpXSAqIGJbaV07XHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC5yaWdodE11bHRpcGx5ID0gZnVuY3Rpb24gKG0sIHYsIHIpIHtcclxuICAgICAgICB2YXIgaSA9IG0ubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlIChpLS0pXHJcbiAgICAgICAgICAgIHJbaV0gPSBEZXNjZW50LmRvdFByb2QobVtpXSwgdik7XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC5wcm90b3R5cGUuY29tcHV0ZVN0ZXBTaXplID0gZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICB2YXIgbnVtZXJhdG9yID0gMCwgZGVub21pbmF0b3IgPSAwO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5rOyArK2kpIHtcclxuICAgICAgICAgICAgbnVtZXJhdG9yICs9IERlc2NlbnQuZG90UHJvZCh0aGlzLmdbaV0sIGRbaV0pO1xyXG4gICAgICAgICAgICBEZXNjZW50LnJpZ2h0TXVsdGlwbHkodGhpcy5IW2ldLCBkW2ldLCB0aGlzLkhkW2ldKTtcclxuICAgICAgICAgICAgZGVub21pbmF0b3IgKz0gRGVzY2VudC5kb3RQcm9kKGRbaV0sIHRoaXMuSGRbaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGVub21pbmF0b3IgPT09IDAgfHwgIWlzRmluaXRlKGRlbm9taW5hdG9yKSlcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgcmV0dXJuIDEgKiBudW1lcmF0b3IgLyBkZW5vbWluYXRvcjtcclxuICAgIH07XHJcbiAgICBEZXNjZW50LnByb3RvdHlwZS5yZWR1Y2VTdHJlc3MgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5jb21wdXRlRGVyaXZhdGl2ZXModGhpcy54KTtcclxuICAgICAgICB2YXIgYWxwaGEgPSB0aGlzLmNvbXB1dGVTdGVwU2l6ZSh0aGlzLmcpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5rOyArK2kpIHtcclxuICAgICAgICAgICAgdGhpcy50YWtlRGVzY2VudFN0ZXAodGhpcy54W2ldLCB0aGlzLmdbaV0sIGFscGhhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcHV0ZVN0cmVzcygpO1xyXG4gICAgfTtcclxuICAgIERlc2NlbnQuY29weSA9IGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgdmFyIG0gPSBhLmxlbmd0aCwgbiA9IGJbMF0ubGVuZ3RoO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbTsgKytpKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbjsgKytqKSB7XHJcbiAgICAgICAgICAgICAgICBiW2ldW2pdID0gYVtpXVtqXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBEZXNjZW50LnByb3RvdHlwZS5zdGVwQW5kUHJvamVjdCA9IGZ1bmN0aW9uICh4MCwgciwgZCwgc3RlcFNpemUpIHtcclxuICAgICAgICBEZXNjZW50LmNvcHkoeDAsIHIpO1xyXG4gICAgICAgIHRoaXMudGFrZURlc2NlbnRTdGVwKHJbMF0sIGRbMF0sIHN0ZXBTaXplKTtcclxuICAgICAgICBpZiAodGhpcy5wcm9qZWN0KVxyXG4gICAgICAgICAgICB0aGlzLnByb2plY3RbMF0oeDBbMF0sIHgwWzFdLCByWzBdKTtcclxuICAgICAgICB0aGlzLnRha2VEZXNjZW50U3RlcChyWzFdLCBkWzFdLCBzdGVwU2l6ZSk7XHJcbiAgICAgICAgaWYgKHRoaXMucHJvamVjdClcclxuICAgICAgICAgICAgdGhpcy5wcm9qZWN0WzFdKHJbMF0sIHgwWzFdLCByWzFdKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMjsgaSA8IHRoaXMuazsgaSsrKVxyXG4gICAgICAgICAgICB0aGlzLnRha2VEZXNjZW50U3RlcChyW2ldLCBkW2ldLCBzdGVwU2l6ZSk7XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC5tQXBwbHkgPSBmdW5jdGlvbiAobSwgbiwgZikge1xyXG4gICAgICAgIHZhciBpID0gbTtcclxuICAgICAgICB3aGlsZSAoaS0tID4gMCkge1xyXG4gICAgICAgICAgICB2YXIgaiA9IG47XHJcbiAgICAgICAgICAgIHdoaWxlIChqLS0gPiAwKVxyXG4gICAgICAgICAgICAgICAgZihpLCBqKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC5wcm90b3R5cGUubWF0cml4QXBwbHkgPSBmdW5jdGlvbiAoZikge1xyXG4gICAgICAgIERlc2NlbnQubUFwcGx5KHRoaXMuaywgdGhpcy5uLCBmKTtcclxuICAgIH07XHJcbiAgICBEZXNjZW50LnByb3RvdHlwZS5jb21wdXRlTmV4dFBvc2l0aW9uID0gZnVuY3Rpb24gKHgwLCByKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB0aGlzLmNvbXB1dGVEZXJpdmF0aXZlcyh4MCk7XHJcbiAgICAgICAgdmFyIGFscGhhID0gdGhpcy5jb21wdXRlU3RlcFNpemUodGhpcy5nKTtcclxuICAgICAgICB0aGlzLnN0ZXBBbmRQcm9qZWN0KHgwLCByLCB0aGlzLmcsIGFscGhhKTtcclxuICAgICAgICBpZiAodGhpcy5wcm9qZWN0KSB7XHJcbiAgICAgICAgICAgIHRoaXMubWF0cml4QXBwbHkoZnVuY3Rpb24gKGksIGopIHsgcmV0dXJuIF90aGlzLmVbaV1bal0gPSB4MFtpXVtqXSAtIHJbaV1bal07IH0pO1xyXG4gICAgICAgICAgICB2YXIgYmV0YSA9IHRoaXMuY29tcHV0ZVN0ZXBTaXplKHRoaXMuZSk7XHJcbiAgICAgICAgICAgIGJldGEgPSBNYXRoLm1heCgwLjIsIE1hdGgubWluKGJldGEsIDEpKTtcclxuICAgICAgICAgICAgdGhpcy5zdGVwQW5kUHJvamVjdCh4MCwgciwgdGhpcy5lLCBiZXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKGl0ZXJhdGlvbnMpIHtcclxuICAgICAgICB2YXIgc3RyZXNzID0gTnVtYmVyLk1BWF9WQUxVRSwgY29udmVyZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgd2hpbGUgKCFjb252ZXJnZWQgJiYgaXRlcmF0aW9ucy0tID4gMCkge1xyXG4gICAgICAgICAgICB2YXIgcyA9IHRoaXMucnVuZ2VLdXR0YSgpO1xyXG4gICAgICAgICAgICBjb252ZXJnZWQgPSBNYXRoLmFicyhzdHJlc3MgLyBzIC0gMSkgPCB0aGlzLnRocmVzaG9sZDtcclxuICAgICAgICAgICAgc3RyZXNzID0gcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN0cmVzcztcclxuICAgIH07XHJcbiAgICBEZXNjZW50LnByb3RvdHlwZS5ydW5nZUt1dHRhID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5jb21wdXRlTmV4dFBvc2l0aW9uKHRoaXMueCwgdGhpcy5hKTtcclxuICAgICAgICBEZXNjZW50Lm1pZCh0aGlzLngsIHRoaXMuYSwgdGhpcy5pYSk7XHJcbiAgICAgICAgdGhpcy5jb21wdXRlTmV4dFBvc2l0aW9uKHRoaXMuaWEsIHRoaXMuYik7XHJcbiAgICAgICAgRGVzY2VudC5taWQodGhpcy54LCB0aGlzLmIsIHRoaXMuaWIpO1xyXG4gICAgICAgIHRoaXMuY29tcHV0ZU5leHRQb3NpdGlvbih0aGlzLmliLCB0aGlzLmMpO1xyXG4gICAgICAgIHRoaXMuY29tcHV0ZU5leHRQb3NpdGlvbih0aGlzLmMsIHRoaXMuZCk7XHJcbiAgICAgICAgdmFyIGRpc3AgPSAwO1xyXG4gICAgICAgIHRoaXMubWF0cml4QXBwbHkoZnVuY3Rpb24gKGksIGopIHtcclxuICAgICAgICAgICAgdmFyIHggPSAoX3RoaXMuYVtpXVtqXSArIDIuMCAqIF90aGlzLmJbaV1bal0gKyAyLjAgKiBfdGhpcy5jW2ldW2pdICsgX3RoaXMuZFtpXVtqXSkgLyA2LjAsIGQgPSBfdGhpcy54W2ldW2pdIC0geDtcclxuICAgICAgICAgICAgZGlzcCArPSBkICogZDtcclxuICAgICAgICAgICAgX3RoaXMueFtpXVtqXSA9IHg7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGRpc3A7XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC5taWQgPSBmdW5jdGlvbiAoYSwgYiwgbSkge1xyXG4gICAgICAgIERlc2NlbnQubUFwcGx5KGEubGVuZ3RoLCBhWzBdLmxlbmd0aCwgZnVuY3Rpb24gKGksIGopIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1baV1bal0gPSBhW2ldW2pdICsgKGJbaV1bal0gLSBhW2ldW2pdKSAvIDIuMDtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBEZXNjZW50LnByb3RvdHlwZS50YWtlRGVzY2VudFN0ZXAgPSBmdW5jdGlvbiAoeCwgZCwgc3RlcFNpemUpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubjsgKytpKSB7XHJcbiAgICAgICAgICAgIHhbaV0gPSB4W2ldIC0gc3RlcFNpemUgKiBkW2ldO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBEZXNjZW50LnByb3RvdHlwZS5jb21wdXRlU3RyZXNzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzdHJlc3MgPSAwO1xyXG4gICAgICAgIGZvciAodmFyIHUgPSAwLCBuTWludXMxID0gdGhpcy5uIC0gMTsgdSA8IG5NaW51czE7ICsrdSkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciB2ID0gdSArIDEsIG4gPSB0aGlzLm47IHYgPCBuOyArK3YpIHtcclxuICAgICAgICAgICAgICAgIHZhciBsID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5rOyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZHggPSB0aGlzLnhbaV1bdV0gLSB0aGlzLnhbaV1bdl07XHJcbiAgICAgICAgICAgICAgICAgICAgbCArPSBkeCAqIGR4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbCA9IE1hdGguc3FydChsKTtcclxuICAgICAgICAgICAgICAgIHZhciBkID0gdGhpcy5EW3VdW3ZdO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFpc0Zpbml0ZShkKSlcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIHZhciBybCA9IGQgLSBsO1xyXG4gICAgICAgICAgICAgICAgdmFyIGQyID0gZCAqIGQ7XHJcbiAgICAgICAgICAgICAgICBzdHJlc3MgKz0gcmwgKiBybCAvIGQyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdHJlc3M7XHJcbiAgICB9O1xyXG4gICAgRGVzY2VudC56ZXJvRGlzdGFuY2UgPSAxZS0xMDtcclxuICAgIHJldHVybiBEZXNjZW50O1xyXG59KCkpO1xyXG5leHBvcnRzLkRlc2NlbnQgPSBEZXNjZW50O1xyXG52YXIgUHNldWRvUmFuZG9tID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFBzZXVkb1JhbmRvbShzZWVkKSB7XHJcbiAgICAgICAgaWYgKHNlZWQgPT09IHZvaWQgMCkgeyBzZWVkID0gMTsgfVxyXG4gICAgICAgIHRoaXMuc2VlZCA9IHNlZWQ7XHJcbiAgICAgICAgdGhpcy5hID0gMjE0MDEzO1xyXG4gICAgICAgIHRoaXMuYyA9IDI1MzEwMTE7XHJcbiAgICAgICAgdGhpcy5tID0gMjE0NzQ4MzY0ODtcclxuICAgICAgICB0aGlzLnJhbmdlID0gMzI3Njc7XHJcbiAgICB9XHJcbiAgICBQc2V1ZG9SYW5kb20ucHJvdG90eXBlLmdldE5leHQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5zZWVkID0gKHRoaXMuc2VlZCAqIHRoaXMuYSArIHRoaXMuYykgJSB0aGlzLm07XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLnNlZWQgPj4gMTYpIC8gdGhpcy5yYW5nZTtcclxuICAgIH07XHJcbiAgICBQc2V1ZG9SYW5kb20ucHJvdG90eXBlLmdldE5leHRCZXR3ZWVuID0gZnVuY3Rpb24gKG1pbiwgbWF4KSB7XHJcbiAgICAgICAgcmV0dXJuIG1pbiArIHRoaXMuZ2V0TmV4dCgpICogKG1heCAtIG1pbik7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFBzZXVkb1JhbmRvbTtcclxufSgpKTtcclxuZXhwb3J0cy5Qc2V1ZG9SYW5kb20gPSBQc2V1ZG9SYW5kb207XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRlc2NlbnQuanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3dlYmNvbGEvZGlzdC9zcmMvZGVzY2VudC5qc1xuLy8gbW9kdWxlIGlkID0gNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5mdW5jdGlvbiB1bmlvbkNvdW50KGEsIGIpIHtcclxuICAgIHZhciB1ID0ge307XHJcbiAgICBmb3IgKHZhciBpIGluIGEpXHJcbiAgICAgICAgdVtpXSA9IHt9O1xyXG4gICAgZm9yICh2YXIgaSBpbiBiKVxyXG4gICAgICAgIHVbaV0gPSB7fTtcclxuICAgIHJldHVybiBPYmplY3Qua2V5cyh1KS5sZW5ndGg7XHJcbn1cclxuZnVuY3Rpb24gaW50ZXJzZWN0aW9uQ291bnQoYSwgYikge1xyXG4gICAgdmFyIG4gPSAwO1xyXG4gICAgZm9yICh2YXIgaSBpbiBhKVxyXG4gICAgICAgIGlmICh0eXBlb2YgYltpXSAhPT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgICAgICAgICsrbjtcclxuICAgIHJldHVybiBuO1xyXG59XHJcbmZ1bmN0aW9uIGdldE5laWdoYm91cnMobGlua3MsIGxhKSB7XHJcbiAgICB2YXIgbmVpZ2hib3VycyA9IHt9O1xyXG4gICAgdmFyIGFkZE5laWdoYm91cnMgPSBmdW5jdGlvbiAodSwgdikge1xyXG4gICAgICAgIGlmICh0eXBlb2YgbmVpZ2hib3Vyc1t1XSA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgICAgICAgIG5laWdoYm91cnNbdV0gPSB7fTtcclxuICAgICAgICBuZWlnaGJvdXJzW3VdW3ZdID0ge307XHJcbiAgICB9O1xyXG4gICAgbGlua3MuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIHZhciB1ID0gbGEuZ2V0U291cmNlSW5kZXgoZSksIHYgPSBsYS5nZXRUYXJnZXRJbmRleChlKTtcclxuICAgICAgICBhZGROZWlnaGJvdXJzKHUsIHYpO1xyXG4gICAgICAgIGFkZE5laWdoYm91cnModiwgdSk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZWlnaGJvdXJzO1xyXG59XHJcbmZ1bmN0aW9uIGNvbXB1dGVMaW5rTGVuZ3RocyhsaW5rcywgdywgZiwgbGEpIHtcclxuICAgIHZhciBuZWlnaGJvdXJzID0gZ2V0TmVpZ2hib3VycyhsaW5rcywgbGEpO1xyXG4gICAgbGlua3MuZm9yRWFjaChmdW5jdGlvbiAobCkge1xyXG4gICAgICAgIHZhciBhID0gbmVpZ2hib3Vyc1tsYS5nZXRTb3VyY2VJbmRleChsKV07XHJcbiAgICAgICAgdmFyIGIgPSBuZWlnaGJvdXJzW2xhLmdldFRhcmdldEluZGV4KGwpXTtcclxuICAgICAgICBsYS5zZXRMZW5ndGgobCwgMSArIHcgKiBmKGEsIGIpKTtcclxuICAgIH0pO1xyXG59XHJcbmZ1bmN0aW9uIHN5bW1ldHJpY0RpZmZMaW5rTGVuZ3RocyhsaW5rcywgbGEsIHcpIHtcclxuICAgIGlmICh3ID09PSB2b2lkIDApIHsgdyA9IDE7IH1cclxuICAgIGNvbXB1dGVMaW5rTGVuZ3RocyhsaW5rcywgdywgZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIE1hdGguc3FydCh1bmlvbkNvdW50KGEsIGIpIC0gaW50ZXJzZWN0aW9uQ291bnQoYSwgYikpOyB9LCBsYSk7XHJcbn1cclxuZXhwb3J0cy5zeW1tZXRyaWNEaWZmTGlua0xlbmd0aHMgPSBzeW1tZXRyaWNEaWZmTGlua0xlbmd0aHM7XHJcbmZ1bmN0aW9uIGphY2NhcmRMaW5rTGVuZ3RocyhsaW5rcywgbGEsIHcpIHtcclxuICAgIGlmICh3ID09PSB2b2lkIDApIHsgdyA9IDE7IH1cclxuICAgIGNvbXB1dGVMaW5rTGVuZ3RocyhsaW5rcywgdywgZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5taW4oT2JqZWN0LmtleXMoYSkubGVuZ3RoLCBPYmplY3Qua2V5cyhiKS5sZW5ndGgpIDwgMS4xID8gMCA6IGludGVyc2VjdGlvbkNvdW50KGEsIGIpIC8gdW5pb25Db3VudChhLCBiKTtcclxuICAgIH0sIGxhKTtcclxufVxyXG5leHBvcnRzLmphY2NhcmRMaW5rTGVuZ3RocyA9IGphY2NhcmRMaW5rTGVuZ3RocztcclxuZnVuY3Rpb24gZ2VuZXJhdGVEaXJlY3RlZEVkZ2VDb25zdHJhaW50cyhuLCBsaW5rcywgYXhpcywgbGEpIHtcclxuICAgIHZhciBjb21wb25lbnRzID0gc3Ryb25nbHlDb25uZWN0ZWRDb21wb25lbnRzKG4sIGxpbmtzLCBsYSk7XHJcbiAgICB2YXIgbm9kZXMgPSB7fTtcclxuICAgIGNvbXBvbmVudHMuZm9yRWFjaChmdW5jdGlvbiAoYywgaSkge1xyXG4gICAgICAgIHJldHVybiBjLmZvckVhY2goZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5vZGVzW3ZdID0gaTsgfSk7XHJcbiAgICB9KTtcclxuICAgIHZhciBjb25zdHJhaW50cyA9IFtdO1xyXG4gICAgbGlua3MuZm9yRWFjaChmdW5jdGlvbiAobCkge1xyXG4gICAgICAgIHZhciB1aSA9IGxhLmdldFNvdXJjZUluZGV4KGwpLCB2aSA9IGxhLmdldFRhcmdldEluZGV4KGwpLCB1ID0gbm9kZXNbdWldLCB2ID0gbm9kZXNbdmldO1xyXG4gICAgICAgIGlmICh1ICE9PSB2KSB7XHJcbiAgICAgICAgICAgIGNvbnN0cmFpbnRzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgYXhpczogYXhpcyxcclxuICAgICAgICAgICAgICAgIGxlZnQ6IHVpLFxyXG4gICAgICAgICAgICAgICAgcmlnaHQ6IHZpLFxyXG4gICAgICAgICAgICAgICAgZ2FwOiBsYS5nZXRNaW5TZXBhcmF0aW9uKGwpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGNvbnN0cmFpbnRzO1xyXG59XHJcbmV4cG9ydHMuZ2VuZXJhdGVEaXJlY3RlZEVkZ2VDb25zdHJhaW50cyA9IGdlbmVyYXRlRGlyZWN0ZWRFZGdlQ29uc3RyYWludHM7XHJcbmZ1bmN0aW9uIHN0cm9uZ2x5Q29ubmVjdGVkQ29tcG9uZW50cyhudW1WZXJ0aWNlcywgZWRnZXMsIGxhKSB7XHJcbiAgICB2YXIgbm9kZXMgPSBbXTtcclxuICAgIHZhciBpbmRleCA9IDA7XHJcbiAgICB2YXIgc3RhY2sgPSBbXTtcclxuICAgIHZhciBjb21wb25lbnRzID0gW107XHJcbiAgICBmdW5jdGlvbiBzdHJvbmdDb25uZWN0KHYpIHtcclxuICAgICAgICB2LmluZGV4ID0gdi5sb3dsaW5rID0gaW5kZXgrKztcclxuICAgICAgICBzdGFjay5wdXNoKHYpO1xyXG4gICAgICAgIHYub25TdGFjayA9IHRydWU7XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHYub3V0OyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICB2YXIgdyA9IF9hW19pXTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB3LmluZGV4ID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgc3Ryb25nQ29ubmVjdCh3KTtcclxuICAgICAgICAgICAgICAgIHYubG93bGluayA9IE1hdGgubWluKHYubG93bGluaywgdy5sb3dsaW5rKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh3Lm9uU3RhY2spIHtcclxuICAgICAgICAgICAgICAgIHYubG93bGluayA9IE1hdGgubWluKHYubG93bGluaywgdy5pbmRleCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHYubG93bGluayA9PT0gdi5pbmRleCkge1xyXG4gICAgICAgICAgICB2YXIgY29tcG9uZW50ID0gW107XHJcbiAgICAgICAgICAgIHdoaWxlIChzdGFjay5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHcgPSBzdGFjay5wb3AoKTtcclxuICAgICAgICAgICAgICAgIHcub25TdGFjayA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnB1c2godyk7XHJcbiAgICAgICAgICAgICAgICBpZiAodyA9PT0gdilcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb21wb25lbnRzLnB1c2goY29tcG9uZW50Lm1hcChmdW5jdGlvbiAodikgeyByZXR1cm4gdi5pZDsgfSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtVmVydGljZXM7IGkrKykge1xyXG4gICAgICAgIG5vZGVzLnB1c2goeyBpZDogaSwgb3V0OiBbXSB9KTtcclxuICAgIH1cclxuICAgIGZvciAodmFyIF9pID0gMCwgZWRnZXNfMSA9IGVkZ2VzOyBfaSA8IGVkZ2VzXzEubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgdmFyIGUgPSBlZGdlc18xW19pXTtcclxuICAgICAgICB2YXIgdl8xID0gbm9kZXNbbGEuZ2V0U291cmNlSW5kZXgoZSldLCB3ID0gbm9kZXNbbGEuZ2V0VGFyZ2V0SW5kZXgoZSldO1xyXG4gICAgICAgIHZfMS5vdXQucHVzaCh3KTtcclxuICAgIH1cclxuICAgIGZvciAodmFyIF9hID0gMCwgbm9kZXNfMSA9IG5vZGVzOyBfYSA8IG5vZGVzXzEubGVuZ3RoOyBfYSsrKSB7XHJcbiAgICAgICAgdmFyIHYgPSBub2Rlc18xW19hXTtcclxuICAgICAgICBpZiAodHlwZW9mIHYuaW5kZXggPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICAgICAgICBzdHJvbmdDb25uZWN0KHYpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNvbXBvbmVudHM7XHJcbn1cclxuZXhwb3J0cy5zdHJvbmdseUNvbm5lY3RlZENvbXBvbmVudHMgPSBzdHJvbmdseUNvbm5lY3RlZENvbXBvbmVudHM7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxpbmtsZW5ndGhzLmpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi93ZWJjb2xhL2Rpc3Qvc3JjL2xpbmtsZW5ndGhzLmpzXG4vLyBtb2R1bGUgaWQgPSA2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBQb3NpdGlvblN0YXRzID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFBvc2l0aW9uU3RhdHMoc2NhbGUpIHtcclxuICAgICAgICB0aGlzLnNjYWxlID0gc2NhbGU7XHJcbiAgICAgICAgdGhpcy5BQiA9IDA7XHJcbiAgICAgICAgdGhpcy5BRCA9IDA7XHJcbiAgICAgICAgdGhpcy5BMiA9IDA7XHJcbiAgICB9XHJcbiAgICBQb3NpdGlvblN0YXRzLnByb3RvdHlwZS5hZGRWYXJpYWJsZSA9IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgdmFyIGFpID0gdGhpcy5zY2FsZSAvIHYuc2NhbGU7XHJcbiAgICAgICAgdmFyIGJpID0gdi5vZmZzZXQgLyB2LnNjYWxlO1xyXG4gICAgICAgIHZhciB3aSA9IHYud2VpZ2h0O1xyXG4gICAgICAgIHRoaXMuQUIgKz0gd2kgKiBhaSAqIGJpO1xyXG4gICAgICAgIHRoaXMuQUQgKz0gd2kgKiBhaSAqIHYuZGVzaXJlZFBvc2l0aW9uO1xyXG4gICAgICAgIHRoaXMuQTIgKz0gd2kgKiBhaSAqIGFpO1xyXG4gICAgfTtcclxuICAgIFBvc2l0aW9uU3RhdHMucHJvdG90eXBlLmdldFBvc24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLkFEIC0gdGhpcy5BQikgLyB0aGlzLkEyO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBQb3NpdGlvblN0YXRzO1xyXG59KCkpO1xyXG5leHBvcnRzLlBvc2l0aW9uU3RhdHMgPSBQb3NpdGlvblN0YXRzO1xyXG52YXIgQ29uc3RyYWludCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBDb25zdHJhaW50KGxlZnQsIHJpZ2h0LCBnYXAsIGVxdWFsaXR5KSB7XHJcbiAgICAgICAgaWYgKGVxdWFsaXR5ID09PSB2b2lkIDApIHsgZXF1YWxpdHkgPSBmYWxzZTsgfVxyXG4gICAgICAgIHRoaXMubGVmdCA9IGxlZnQ7XHJcbiAgICAgICAgdGhpcy5yaWdodCA9IHJpZ2h0O1xyXG4gICAgICAgIHRoaXMuZ2FwID0gZ2FwO1xyXG4gICAgICAgIHRoaXMuZXF1YWxpdHkgPSBlcXVhbGl0eTtcclxuICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMudW5zYXRpc2ZpYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubGVmdCA9IGxlZnQ7XHJcbiAgICAgICAgdGhpcy5yaWdodCA9IHJpZ2h0O1xyXG4gICAgICAgIHRoaXMuZ2FwID0gZ2FwO1xyXG4gICAgICAgIHRoaXMuZXF1YWxpdHkgPSBlcXVhbGl0eTtcclxuICAgIH1cclxuICAgIENvbnN0cmFpbnQucHJvdG90eXBlLnNsYWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnVuc2F0aXNmaWFibGUgPyBOdW1iZXIuTUFYX1ZBTFVFXHJcbiAgICAgICAgICAgIDogdGhpcy5yaWdodC5zY2FsZSAqIHRoaXMucmlnaHQucG9zaXRpb24oKSAtIHRoaXMuZ2FwXHJcbiAgICAgICAgICAgICAgICAtIHRoaXMubGVmdC5zY2FsZSAqIHRoaXMubGVmdC5wb3NpdGlvbigpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBDb25zdHJhaW50O1xyXG59KCkpO1xyXG5leHBvcnRzLkNvbnN0cmFpbnQgPSBDb25zdHJhaW50O1xyXG52YXIgVmFyaWFibGUgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gVmFyaWFibGUoZGVzaXJlZFBvc2l0aW9uLCB3ZWlnaHQsIHNjYWxlKSB7XHJcbiAgICAgICAgaWYgKHdlaWdodCA9PT0gdm9pZCAwKSB7IHdlaWdodCA9IDE7IH1cclxuICAgICAgICBpZiAoc2NhbGUgPT09IHZvaWQgMCkgeyBzY2FsZSA9IDE7IH1cclxuICAgICAgICB0aGlzLmRlc2lyZWRQb3NpdGlvbiA9IGRlc2lyZWRQb3NpdGlvbjtcclxuICAgICAgICB0aGlzLndlaWdodCA9IHdlaWdodDtcclxuICAgICAgICB0aGlzLnNjYWxlID0gc2NhbGU7XHJcbiAgICAgICAgdGhpcy5vZmZzZXQgPSAwO1xyXG4gICAgfVxyXG4gICAgVmFyaWFibGUucHJvdG90eXBlLmRmZHYgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIDIuMCAqIHRoaXMud2VpZ2h0ICogKHRoaXMucG9zaXRpb24oKSAtIHRoaXMuZGVzaXJlZFBvc2l0aW9uKTtcclxuICAgIH07XHJcbiAgICBWYXJpYWJsZS5wcm90b3R5cGUucG9zaXRpb24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmJsb2NrLnBzLnNjYWxlICogdGhpcy5ibG9jay5wb3NuICsgdGhpcy5vZmZzZXQpIC8gdGhpcy5zY2FsZTtcclxuICAgIH07XHJcbiAgICBWYXJpYWJsZS5wcm90b3R5cGUudmlzaXROZWlnaGJvdXJzID0gZnVuY3Rpb24gKHByZXYsIGYpIHtcclxuICAgICAgICB2YXIgZmYgPSBmdW5jdGlvbiAoYywgbmV4dCkgeyByZXR1cm4gYy5hY3RpdmUgJiYgcHJldiAhPT0gbmV4dCAmJiBmKGMsIG5leHQpOyB9O1xyXG4gICAgICAgIHRoaXMuY091dC5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7IHJldHVybiBmZihjLCBjLnJpZ2h0KTsgfSk7XHJcbiAgICAgICAgdGhpcy5jSW4uZm9yRWFjaChmdW5jdGlvbiAoYykgeyByZXR1cm4gZmYoYywgYy5sZWZ0KTsgfSk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFZhcmlhYmxlO1xyXG59KCkpO1xyXG5leHBvcnRzLlZhcmlhYmxlID0gVmFyaWFibGU7XHJcbnZhciBCbG9jayA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBCbG9jayh2KSB7XHJcbiAgICAgICAgdGhpcy52YXJzID0gW107XHJcbiAgICAgICAgdi5vZmZzZXQgPSAwO1xyXG4gICAgICAgIHRoaXMucHMgPSBuZXcgUG9zaXRpb25TdGF0cyh2LnNjYWxlKTtcclxuICAgICAgICB0aGlzLmFkZFZhcmlhYmxlKHYpO1xyXG4gICAgfVxyXG4gICAgQmxvY2sucHJvdG90eXBlLmFkZFZhcmlhYmxlID0gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICB2LmJsb2NrID0gdGhpcztcclxuICAgICAgICB0aGlzLnZhcnMucHVzaCh2KTtcclxuICAgICAgICB0aGlzLnBzLmFkZFZhcmlhYmxlKHYpO1xyXG4gICAgICAgIHRoaXMucG9zbiA9IHRoaXMucHMuZ2V0UG9zbigpO1xyXG4gICAgfTtcclxuICAgIEJsb2NrLnByb3RvdHlwZS51cGRhdGVXZWlnaHRlZFBvc2l0aW9uID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMucHMuQUIgPSB0aGlzLnBzLkFEID0gdGhpcy5wcy5BMiA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSB0aGlzLnZhcnMubGVuZ3RoOyBpIDwgbjsgKytpKVxyXG4gICAgICAgICAgICB0aGlzLnBzLmFkZFZhcmlhYmxlKHRoaXMudmFyc1tpXSk7XHJcbiAgICAgICAgdGhpcy5wb3NuID0gdGhpcy5wcy5nZXRQb3NuKCk7XHJcbiAgICB9O1xyXG4gICAgQmxvY2sucHJvdG90eXBlLmNvbXB1dGVfbG0gPSBmdW5jdGlvbiAodiwgdSwgcG9zdEFjdGlvbikge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGRmZHYgPSB2LmRmZHYoKTtcclxuICAgICAgICB2LnZpc2l0TmVpZ2hib3Vycyh1LCBmdW5jdGlvbiAoYywgbmV4dCkge1xyXG4gICAgICAgICAgICB2YXIgX2RmZHYgPSBfdGhpcy5jb21wdXRlX2xtKG5leHQsIHYsIHBvc3RBY3Rpb24pO1xyXG4gICAgICAgICAgICBpZiAobmV4dCA9PT0gYy5yaWdodCkge1xyXG4gICAgICAgICAgICAgICAgZGZkdiArPSBfZGZkdiAqIGMubGVmdC5zY2FsZTtcclxuICAgICAgICAgICAgICAgIGMubG0gPSBfZGZkdjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRmZHYgKz0gX2RmZHYgKiBjLnJpZ2h0LnNjYWxlO1xyXG4gICAgICAgICAgICAgICAgYy5sbSA9IC1fZGZkdjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwb3N0QWN0aW9uKGMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBkZmR2IC8gdi5zY2FsZTtcclxuICAgIH07XHJcbiAgICBCbG9jay5wcm90b3R5cGUucG9wdWxhdGVTcGxpdEJsb2NrID0gZnVuY3Rpb24gKHYsIHByZXYpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHYudmlzaXROZWlnaGJvdXJzKHByZXYsIGZ1bmN0aW9uIChjLCBuZXh0KSB7XHJcbiAgICAgICAgICAgIG5leHQub2Zmc2V0ID0gdi5vZmZzZXQgKyAobmV4dCA9PT0gYy5yaWdodCA/IGMuZ2FwIDogLWMuZ2FwKTtcclxuICAgICAgICAgICAgX3RoaXMuYWRkVmFyaWFibGUobmV4dCk7XHJcbiAgICAgICAgICAgIF90aGlzLnBvcHVsYXRlU3BsaXRCbG9jayhuZXh0LCB2KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBCbG9jay5wcm90b3R5cGUudHJhdmVyc2UgPSBmdW5jdGlvbiAodmlzaXQsIGFjYywgdiwgcHJldikge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgaWYgKHYgPT09IHZvaWQgMCkgeyB2ID0gdGhpcy52YXJzWzBdOyB9XHJcbiAgICAgICAgaWYgKHByZXYgPT09IHZvaWQgMCkgeyBwcmV2ID0gbnVsbDsgfVxyXG4gICAgICAgIHYudmlzaXROZWlnaGJvdXJzKHByZXYsIGZ1bmN0aW9uIChjLCBuZXh0KSB7XHJcbiAgICAgICAgICAgIGFjYy5wdXNoKHZpc2l0KGMpKTtcclxuICAgICAgICAgICAgX3RoaXMudHJhdmVyc2UodmlzaXQsIGFjYywgbmV4dCwgdik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgQmxvY2sucHJvdG90eXBlLmZpbmRNaW5MTSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgbSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5jb21wdXRlX2xtKHRoaXMudmFyc1swXSwgbnVsbCwgZnVuY3Rpb24gKGMpIHtcclxuICAgICAgICAgICAgaWYgKCFjLmVxdWFsaXR5ICYmIChtID09PSBudWxsIHx8IGMubG0gPCBtLmxtKSlcclxuICAgICAgICAgICAgICAgIG0gPSBjO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBtO1xyXG4gICAgfTtcclxuICAgIEJsb2NrLnByb3RvdHlwZS5maW5kTWluTE1CZXR3ZWVuID0gZnVuY3Rpb24gKGx2LCBydikge1xyXG4gICAgICAgIHRoaXMuY29tcHV0ZV9sbShsdiwgbnVsbCwgZnVuY3Rpb24gKCkgeyB9KTtcclxuICAgICAgICB2YXIgbSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5maW5kUGF0aChsdiwgbnVsbCwgcnYsIGZ1bmN0aW9uIChjLCBuZXh0KSB7XHJcbiAgICAgICAgICAgIGlmICghYy5lcXVhbGl0eSAmJiBjLnJpZ2h0ID09PSBuZXh0ICYmIChtID09PSBudWxsIHx8IGMubG0gPCBtLmxtKSlcclxuICAgICAgICAgICAgICAgIG0gPSBjO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBtO1xyXG4gICAgfTtcclxuICAgIEJsb2NrLnByb3RvdHlwZS5maW5kUGF0aCA9IGZ1bmN0aW9uICh2LCBwcmV2LCB0bywgdmlzaXQpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHZhciBlbmRGb3VuZCA9IGZhbHNlO1xyXG4gICAgICAgIHYudmlzaXROZWlnaGJvdXJzKHByZXYsIGZ1bmN0aW9uIChjLCBuZXh0KSB7XHJcbiAgICAgICAgICAgIGlmICghZW5kRm91bmQgJiYgKG5leHQgPT09IHRvIHx8IF90aGlzLmZpbmRQYXRoKG5leHQsIHYsIHRvLCB2aXNpdCkpKSB7XHJcbiAgICAgICAgICAgICAgICBlbmRGb3VuZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB2aXNpdChjLCBuZXh0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBlbmRGb3VuZDtcclxuICAgIH07XHJcbiAgICBCbG9jay5wcm90b3R5cGUuaXNBY3RpdmVEaXJlY3RlZFBhdGhCZXR3ZWVuID0gZnVuY3Rpb24gKHUsIHYpIHtcclxuICAgICAgICBpZiAodSA9PT0gdilcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgdmFyIGkgPSB1LmNPdXQubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlIChpLS0pIHtcclxuICAgICAgICAgICAgdmFyIGMgPSB1LmNPdXRbaV07XHJcbiAgICAgICAgICAgIGlmIChjLmFjdGl2ZSAmJiB0aGlzLmlzQWN0aXZlRGlyZWN0ZWRQYXRoQmV0d2VlbihjLnJpZ2h0LCB2KSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9O1xyXG4gICAgQmxvY2suc3BsaXQgPSBmdW5jdGlvbiAoYykge1xyXG4gICAgICAgIGMuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIFtCbG9jay5jcmVhdGVTcGxpdEJsb2NrKGMubGVmdCksIEJsb2NrLmNyZWF0ZVNwbGl0QmxvY2soYy5yaWdodCldO1xyXG4gICAgfTtcclxuICAgIEJsb2NrLmNyZWF0ZVNwbGl0QmxvY2sgPSBmdW5jdGlvbiAoc3RhcnRWYXIpIHtcclxuICAgICAgICB2YXIgYiA9IG5ldyBCbG9jayhzdGFydFZhcik7XHJcbiAgICAgICAgYi5wb3B1bGF0ZVNwbGl0QmxvY2soc3RhcnRWYXIsIG51bGwpO1xyXG4gICAgICAgIHJldHVybiBiO1xyXG4gICAgfTtcclxuICAgIEJsb2NrLnByb3RvdHlwZS5zcGxpdEJldHdlZW4gPSBmdW5jdGlvbiAodmwsIHZyKSB7XHJcbiAgICAgICAgdmFyIGMgPSB0aGlzLmZpbmRNaW5MTUJldHdlZW4odmwsIHZyKTtcclxuICAgICAgICBpZiAoYyAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB2YXIgYnMgPSBCbG9jay5zcGxpdChjKTtcclxuICAgICAgICAgICAgcmV0dXJuIHsgY29uc3RyYWludDogYywgbGI6IGJzWzBdLCByYjogYnNbMV0gfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9O1xyXG4gICAgQmxvY2sucHJvdG90eXBlLm1lcmdlQWNyb3NzID0gZnVuY3Rpb24gKGIsIGMsIGRpc3QpIHtcclxuICAgICAgICBjLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSBiLnZhcnMubGVuZ3RoOyBpIDwgbjsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciB2ID0gYi52YXJzW2ldO1xyXG4gICAgICAgICAgICB2Lm9mZnNldCArPSBkaXN0O1xyXG4gICAgICAgICAgICB0aGlzLmFkZFZhcmlhYmxlKHYpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBvc24gPSB0aGlzLnBzLmdldFBvc24oKTtcclxuICAgIH07XHJcbiAgICBCbG9jay5wcm90b3R5cGUuY29zdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc3VtID0gMCwgaSA9IHRoaXMudmFycy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUgKGktLSkge1xyXG4gICAgICAgICAgICB2YXIgdiA9IHRoaXMudmFyc1tpXSwgZCA9IHYucG9zaXRpb24oKSAtIHYuZGVzaXJlZFBvc2l0aW9uO1xyXG4gICAgICAgICAgICBzdW0gKz0gZCAqIGQgKiB2LndlaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN1bTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gQmxvY2s7XHJcbn0oKSk7XHJcbmV4cG9ydHMuQmxvY2sgPSBCbG9jaztcclxudmFyIEJsb2NrcyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBCbG9ja3ModnMpIHtcclxuICAgICAgICB0aGlzLnZzID0gdnM7XHJcbiAgICAgICAgdmFyIG4gPSB2cy5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy5saXN0ID0gbmV3IEFycmF5KG4pO1xyXG4gICAgICAgIHdoaWxlIChuLS0pIHtcclxuICAgICAgICAgICAgdmFyIGIgPSBuZXcgQmxvY2sodnNbbl0pO1xyXG4gICAgICAgICAgICB0aGlzLmxpc3Rbbl0gPSBiO1xyXG4gICAgICAgICAgICBiLmJsb2NrSW5kID0gbjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBCbG9ja3MucHJvdG90eXBlLmNvc3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHN1bSA9IDAsIGkgPSB0aGlzLmxpc3QubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlIChpLS0pXHJcbiAgICAgICAgICAgIHN1bSArPSB0aGlzLmxpc3RbaV0uY29zdCgpO1xyXG4gICAgICAgIHJldHVybiBzdW07XHJcbiAgICB9O1xyXG4gICAgQmxvY2tzLnByb3RvdHlwZS5pbnNlcnQgPSBmdW5jdGlvbiAoYikge1xyXG4gICAgICAgIGIuYmxvY2tJbmQgPSB0aGlzLmxpc3QubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMubGlzdC5wdXNoKGIpO1xyXG4gICAgfTtcclxuICAgIEJsb2Nrcy5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKGIpIHtcclxuICAgICAgICB2YXIgbGFzdCA9IHRoaXMubGlzdC5sZW5ndGggLSAxO1xyXG4gICAgICAgIHZhciBzd2FwQmxvY2sgPSB0aGlzLmxpc3RbbGFzdF07XHJcbiAgICAgICAgdGhpcy5saXN0Lmxlbmd0aCA9IGxhc3Q7XHJcbiAgICAgICAgaWYgKGIgIT09IHN3YXBCbG9jaykge1xyXG4gICAgICAgICAgICB0aGlzLmxpc3RbYi5ibG9ja0luZF0gPSBzd2FwQmxvY2s7XHJcbiAgICAgICAgICAgIHN3YXBCbG9jay5ibG9ja0luZCA9IGIuYmxvY2tJbmQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIEJsb2Nrcy5wcm90b3R5cGUubWVyZ2UgPSBmdW5jdGlvbiAoYykge1xyXG4gICAgICAgIHZhciBsID0gYy5sZWZ0LmJsb2NrLCByID0gYy5yaWdodC5ibG9jaztcclxuICAgICAgICB2YXIgZGlzdCA9IGMucmlnaHQub2Zmc2V0IC0gYy5sZWZ0Lm9mZnNldCAtIGMuZ2FwO1xyXG4gICAgICAgIGlmIChsLnZhcnMubGVuZ3RoIDwgci52YXJzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICByLm1lcmdlQWNyb3NzKGwsIGMsIGRpc3QpO1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZShsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGwubWVyZ2VBY3Jvc3MociwgYywgLWRpc3QpO1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZShyKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgQmxvY2tzLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKGYpIHtcclxuICAgICAgICB0aGlzLmxpc3QuZm9yRWFjaChmKTtcclxuICAgIH07XHJcbiAgICBCbG9ja3MucHJvdG90eXBlLnVwZGF0ZUJsb2NrUG9zaXRpb25zID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChiKSB7IHJldHVybiBiLnVwZGF0ZVdlaWdodGVkUG9zaXRpb24oKTsgfSk7XHJcbiAgICB9O1xyXG4gICAgQmxvY2tzLnByb3RvdHlwZS5zcGxpdCA9IGZ1bmN0aW9uIChpbmFjdGl2ZSkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy51cGRhdGVCbG9ja1Bvc2l0aW9ucygpO1xyXG4gICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChiKSB7XHJcbiAgICAgICAgICAgIHZhciB2ID0gYi5maW5kTWluTE0oKTtcclxuICAgICAgICAgICAgaWYgKHYgIT09IG51bGwgJiYgdi5sbSA8IFNvbHZlci5MQUdSQU5HSUFOX1RPTEVSQU5DRSkge1xyXG4gICAgICAgICAgICAgICAgYiA9IHYubGVmdC5ibG9jaztcclxuICAgICAgICAgICAgICAgIEJsb2NrLnNwbGl0KHYpLmZvckVhY2goZnVuY3Rpb24gKG5iKSB7IHJldHVybiBfdGhpcy5pbnNlcnQobmIpOyB9KTtcclxuICAgICAgICAgICAgICAgIF90aGlzLnJlbW92ZShiKTtcclxuICAgICAgICAgICAgICAgIGluYWN0aXZlLnB1c2godik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gQmxvY2tzO1xyXG59KCkpO1xyXG5leHBvcnRzLkJsb2NrcyA9IEJsb2NrcztcclxudmFyIFNvbHZlciA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBTb2x2ZXIodnMsIGNzKSB7XHJcbiAgICAgICAgdGhpcy52cyA9IHZzO1xyXG4gICAgICAgIHRoaXMuY3MgPSBjcztcclxuICAgICAgICB0aGlzLnZzID0gdnM7XHJcbiAgICAgICAgdnMuZm9yRWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgICB2LmNJbiA9IFtdLCB2LmNPdXQgPSBbXTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmNzID0gY3M7XHJcbiAgICAgICAgY3MuZm9yRWFjaChmdW5jdGlvbiAoYykge1xyXG4gICAgICAgICAgICBjLmxlZnQuY091dC5wdXNoKGMpO1xyXG4gICAgICAgICAgICBjLnJpZ2h0LmNJbi5wdXNoKGMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuaW5hY3RpdmUgPSBjcy5tYXAoZnVuY3Rpb24gKGMpIHsgYy5hY3RpdmUgPSBmYWxzZTsgcmV0dXJuIGM7IH0pO1xyXG4gICAgICAgIHRoaXMuYnMgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgU29sdmVyLnByb3RvdHlwZS5jb3N0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmJzLmNvc3QoKTtcclxuICAgIH07XHJcbiAgICBTb2x2ZXIucHJvdG90eXBlLnNldFN0YXJ0aW5nUG9zaXRpb25zID0gZnVuY3Rpb24gKHBzKSB7XHJcbiAgICAgICAgdGhpcy5pbmFjdGl2ZSA9IHRoaXMuY3MubWFwKGZ1bmN0aW9uIChjKSB7IGMuYWN0aXZlID0gZmFsc2U7IHJldHVybiBjOyB9KTtcclxuICAgICAgICB0aGlzLmJzID0gbmV3IEJsb2Nrcyh0aGlzLnZzKTtcclxuICAgICAgICB0aGlzLmJzLmZvckVhY2goZnVuY3Rpb24gKGIsIGkpIHsgcmV0dXJuIGIucG9zbiA9IHBzW2ldOyB9KTtcclxuICAgIH07XHJcbiAgICBTb2x2ZXIucHJvdG90eXBlLnNldERlc2lyZWRQb3NpdGlvbnMgPSBmdW5jdGlvbiAocHMpIHtcclxuICAgICAgICB0aGlzLnZzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHsgcmV0dXJuIHYuZGVzaXJlZFBvc2l0aW9uID0gcHNbaV07IH0pO1xyXG4gICAgfTtcclxuICAgIFNvbHZlci5wcm90b3R5cGUubW9zdFZpb2xhdGVkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBtaW5TbGFjayA9IE51bWJlci5NQVhfVkFMVUUsIHYgPSBudWxsLCBsID0gdGhpcy5pbmFjdGl2ZSwgbiA9IGwubGVuZ3RoLCBkZWxldGVQb2ludCA9IG47XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIGMgPSBsW2ldO1xyXG4gICAgICAgICAgICBpZiAoYy51bnNhdGlzZmlhYmxlKVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIHZhciBzbGFjayA9IGMuc2xhY2soKTtcclxuICAgICAgICAgICAgaWYgKGMuZXF1YWxpdHkgfHwgc2xhY2sgPCBtaW5TbGFjaykge1xyXG4gICAgICAgICAgICAgICAgbWluU2xhY2sgPSBzbGFjaztcclxuICAgICAgICAgICAgICAgIHYgPSBjO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlUG9pbnQgPSBpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGMuZXF1YWxpdHkpXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRlbGV0ZVBvaW50ICE9PSBuICYmXHJcbiAgICAgICAgICAgIChtaW5TbGFjayA8IFNvbHZlci5aRVJPX1VQUEVSQk9VTkQgJiYgIXYuYWN0aXZlIHx8IHYuZXF1YWxpdHkpKSB7XHJcbiAgICAgICAgICAgIGxbZGVsZXRlUG9pbnRdID0gbFtuIC0gMV07XHJcbiAgICAgICAgICAgIGwubGVuZ3RoID0gbiAtIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2O1xyXG4gICAgfTtcclxuICAgIFNvbHZlci5wcm90b3R5cGUuc2F0aXNmeSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5icyA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnMgPSBuZXcgQmxvY2tzKHRoaXMudnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJzLnNwbGl0KHRoaXMuaW5hY3RpdmUpO1xyXG4gICAgICAgIHZhciB2ID0gbnVsbDtcclxuICAgICAgICB3aGlsZSAoKHYgPSB0aGlzLm1vc3RWaW9sYXRlZCgpKSAmJiAodi5lcXVhbGl0eSB8fCB2LnNsYWNrKCkgPCBTb2x2ZXIuWkVST19VUFBFUkJPVU5EICYmICF2LmFjdGl2ZSkpIHtcclxuICAgICAgICAgICAgdmFyIGxiID0gdi5sZWZ0LmJsb2NrLCByYiA9IHYucmlnaHQuYmxvY2s7XHJcbiAgICAgICAgICAgIGlmIChsYiAhPT0gcmIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnMubWVyZ2Uodik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobGIuaXNBY3RpdmVEaXJlY3RlZFBhdGhCZXR3ZWVuKHYucmlnaHQsIHYubGVmdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB2LnVuc2F0aXNmaWFibGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIHNwbGl0ID0gbGIuc3BsaXRCZXR3ZWVuKHYubGVmdCwgdi5yaWdodCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoc3BsaXQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJzLmluc2VydChzcGxpdC5sYik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5icy5pbnNlcnQoc3BsaXQucmIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnMucmVtb3ZlKGxiKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluYWN0aXZlLnB1c2goc3BsaXQuY29uc3RyYWludCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB2LnVuc2F0aXNmaWFibGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHYuc2xhY2soKSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmFjdGl2ZS5wdXNoKHYpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5icy5tZXJnZSh2KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBTb2x2ZXIucHJvdG90eXBlLnNvbHZlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuc2F0aXNmeSgpO1xyXG4gICAgICAgIHZhciBsYXN0Y29zdCA9IE51bWJlci5NQVhfVkFMVUUsIGNvc3QgPSB0aGlzLmJzLmNvc3QoKTtcclxuICAgICAgICB3aGlsZSAoTWF0aC5hYnMobGFzdGNvc3QgLSBjb3N0KSA+IDAuMDAwMSkge1xyXG4gICAgICAgICAgICB0aGlzLnNhdGlzZnkoKTtcclxuICAgICAgICAgICAgbGFzdGNvc3QgPSBjb3N0O1xyXG4gICAgICAgICAgICBjb3N0ID0gdGhpcy5icy5jb3N0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjb3N0O1xyXG4gICAgfTtcclxuICAgIFNvbHZlci5MQUdSQU5HSUFOX1RPTEVSQU5DRSA9IC0xZS00O1xyXG4gICAgU29sdmVyLlpFUk9fVVBQRVJCT1VORCA9IC0xZS0xMDtcclxuICAgIHJldHVybiBTb2x2ZXI7XHJcbn0oKSk7XHJcbmV4cG9ydHMuU29sdmVyID0gU29sdmVyO1xyXG5mdW5jdGlvbiByZW1vdmVPdmVybGFwSW5PbmVEaW1lbnNpb24oc3BhbnMsIGxvd2VyQm91bmQsIHVwcGVyQm91bmQpIHtcclxuICAgIHZhciB2cyA9IHNwYW5zLm1hcChmdW5jdGlvbiAocykgeyByZXR1cm4gbmV3IFZhcmlhYmxlKHMuZGVzaXJlZENlbnRlcik7IH0pO1xyXG4gICAgdmFyIGNzID0gW107XHJcbiAgICB2YXIgbiA9IHNwYW5zLmxlbmd0aDtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbiAtIDE7IGkrKykge1xyXG4gICAgICAgIHZhciBsZWZ0ID0gc3BhbnNbaV0sIHJpZ2h0ID0gc3BhbnNbaSArIDFdO1xyXG4gICAgICAgIGNzLnB1c2gobmV3IENvbnN0cmFpbnQodnNbaV0sIHZzW2kgKyAxXSwgKGxlZnQuc2l6ZSArIHJpZ2h0LnNpemUpIC8gMikpO1xyXG4gICAgfVxyXG4gICAgdmFyIGxlZnRNb3N0ID0gdnNbMF0sIHJpZ2h0TW9zdCA9IHZzW24gLSAxXSwgbGVmdE1vc3RTaXplID0gc3BhbnNbMF0uc2l6ZSAvIDIsIHJpZ2h0TW9zdFNpemUgPSBzcGFuc1tuIC0gMV0uc2l6ZSAvIDI7XHJcbiAgICB2YXIgdkxvd2VyID0gbnVsbCwgdlVwcGVyID0gbnVsbDtcclxuICAgIGlmIChsb3dlckJvdW5kKSB7XHJcbiAgICAgICAgdkxvd2VyID0gbmV3IFZhcmlhYmxlKGxvd2VyQm91bmQsIGxlZnRNb3N0LndlaWdodCAqIDEwMDApO1xyXG4gICAgICAgIHZzLnB1c2godkxvd2VyKTtcclxuICAgICAgICBjcy5wdXNoKG5ldyBDb25zdHJhaW50KHZMb3dlciwgbGVmdE1vc3QsIGxlZnRNb3N0U2l6ZSkpO1xyXG4gICAgfVxyXG4gICAgaWYgKHVwcGVyQm91bmQpIHtcclxuICAgICAgICB2VXBwZXIgPSBuZXcgVmFyaWFibGUodXBwZXJCb3VuZCwgcmlnaHRNb3N0LndlaWdodCAqIDEwMDApO1xyXG4gICAgICAgIHZzLnB1c2godlVwcGVyKTtcclxuICAgICAgICBjcy5wdXNoKG5ldyBDb25zdHJhaW50KHJpZ2h0TW9zdCwgdlVwcGVyLCByaWdodE1vc3RTaXplKSk7XHJcbiAgICB9XHJcbiAgICB2YXIgc29sdmVyID0gbmV3IFNvbHZlcih2cywgY3MpO1xyXG4gICAgc29sdmVyLnNvbHZlKCk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG5ld0NlbnRlcnM6IHZzLnNsaWNlKDAsIHNwYW5zLmxlbmd0aCkubWFwKGZ1bmN0aW9uICh2KSB7IHJldHVybiB2LnBvc2l0aW9uKCk7IH0pLFxyXG4gICAgICAgIGxvd2VyQm91bmQ6IHZMb3dlciA/IHZMb3dlci5wb3NpdGlvbigpIDogbGVmdE1vc3QucG9zaXRpb24oKSAtIGxlZnRNb3N0U2l6ZSxcclxuICAgICAgICB1cHBlckJvdW5kOiB2VXBwZXIgPyB2VXBwZXIucG9zaXRpb24oKSA6IHJpZ2h0TW9zdC5wb3NpdGlvbigpICsgcmlnaHRNb3N0U2l6ZVxyXG4gICAgfTtcclxufVxyXG5leHBvcnRzLnJlbW92ZU92ZXJsYXBJbk9uZURpbWVuc2lvbiA9IHJlbW92ZU92ZXJsYXBJbk9uZURpbWVuc2lvbjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dnBzYy5qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vd2ViY29sYS9kaXN0L3NyYy92cHNjLmpzXG4vLyBtb2R1bGUgaWQgPSA3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xyXG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG4gICAgfTtcclxufSkoKTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgcmVjdGFuZ2xlXzEgPSByZXF1aXJlKFwiLi9yZWN0YW5nbGVcIik7XHJcbnZhciBQb2ludCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBQb2ludCgpIHtcclxuICAgIH1cclxuICAgIHJldHVybiBQb2ludDtcclxufSgpKTtcclxuZXhwb3J0cy5Qb2ludCA9IFBvaW50O1xyXG52YXIgTGluZVNlZ21lbnQgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTGluZVNlZ21lbnQoeDEsIHkxLCB4MiwgeTIpIHtcclxuICAgICAgICB0aGlzLngxID0geDE7XHJcbiAgICAgICAgdGhpcy55MSA9IHkxO1xyXG4gICAgICAgIHRoaXMueDIgPSB4MjtcclxuICAgICAgICB0aGlzLnkyID0geTI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gTGluZVNlZ21lbnQ7XHJcbn0oKSk7XHJcbmV4cG9ydHMuTGluZVNlZ21lbnQgPSBMaW5lU2VnbWVudDtcclxudmFyIFBvbHlQb2ludCA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XHJcbiAgICBfX2V4dGVuZHMoUG9seVBvaW50LCBfc3VwZXIpO1xyXG4gICAgZnVuY3Rpb24gUG9seVBvaW50KCkge1xyXG4gICAgICAgIHJldHVybiBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcclxuICAgIH1cclxuICAgIHJldHVybiBQb2x5UG9pbnQ7XHJcbn0oUG9pbnQpKTtcclxuZXhwb3J0cy5Qb2x5UG9pbnQgPSBQb2x5UG9pbnQ7XHJcbmZ1bmN0aW9uIGlzTGVmdChQMCwgUDEsIFAyKSB7XHJcbiAgICByZXR1cm4gKFAxLnggLSBQMC54KSAqIChQMi55IC0gUDAueSkgLSAoUDIueCAtIFAwLngpICogKFAxLnkgLSBQMC55KTtcclxufVxyXG5leHBvcnRzLmlzTGVmdCA9IGlzTGVmdDtcclxuZnVuY3Rpb24gYWJvdmUocCwgdmksIHZqKSB7XHJcbiAgICByZXR1cm4gaXNMZWZ0KHAsIHZpLCB2aikgPiAwO1xyXG59XHJcbmZ1bmN0aW9uIGJlbG93KHAsIHZpLCB2aikge1xyXG4gICAgcmV0dXJuIGlzTGVmdChwLCB2aSwgdmopIDwgMDtcclxufVxyXG5mdW5jdGlvbiBDb252ZXhIdWxsKFMpIHtcclxuICAgIHZhciBQID0gUy5zbGljZSgwKS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhLnggIT09IGIueCA/IGIueCAtIGEueCA6IGIueSAtIGEueTsgfSk7XHJcbiAgICB2YXIgbiA9IFMubGVuZ3RoLCBpO1xyXG4gICAgdmFyIG1pbm1pbiA9IDA7XHJcbiAgICB2YXIgeG1pbiA9IFBbMF0ueDtcclxuICAgIGZvciAoaSA9IDE7IGkgPCBuOyArK2kpIHtcclxuICAgICAgICBpZiAoUFtpXS54ICE9PSB4bWluKVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHZhciBtaW5tYXggPSBpIC0gMTtcclxuICAgIHZhciBIID0gW107XHJcbiAgICBILnB1c2goUFttaW5taW5dKTtcclxuICAgIGlmIChtaW5tYXggPT09IG4gLSAxKSB7XHJcbiAgICAgICAgaWYgKFBbbWlubWF4XS55ICE9PSBQW21pbm1pbl0ueSlcclxuICAgICAgICAgICAgSC5wdXNoKFBbbWlubWF4XSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB2YXIgbWF4bWluLCBtYXhtYXggPSBuIC0gMTtcclxuICAgICAgICB2YXIgeG1heCA9IFBbbiAtIDFdLng7XHJcbiAgICAgICAgZm9yIChpID0gbiAtIDI7IGkgPj0gMDsgaS0tKVxyXG4gICAgICAgICAgICBpZiAoUFtpXS54ICE9PSB4bWF4KVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgbWF4bWluID0gaSArIDE7XHJcbiAgICAgICAgaSA9IG1pbm1heDtcclxuICAgICAgICB3aGlsZSAoKytpIDw9IG1heG1pbikge1xyXG4gICAgICAgICAgICBpZiAoaXNMZWZ0KFBbbWlubWluXSwgUFttYXhtaW5dLCBQW2ldKSA+PSAwICYmIGkgPCBtYXhtaW4pXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgd2hpbGUgKEgubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzTGVmdChIW0gubGVuZ3RoIC0gMl0sIEhbSC5sZW5ndGggLSAxXSwgUFtpXSkgPiAwKVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIEgubGVuZ3RoIC09IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGkgIT0gbWlubWluKVxyXG4gICAgICAgICAgICAgICAgSC5wdXNoKFBbaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobWF4bWF4ICE9IG1heG1pbilcclxuICAgICAgICAgICAgSC5wdXNoKFBbbWF4bWF4XSk7XHJcbiAgICAgICAgdmFyIGJvdCA9IEgubGVuZ3RoO1xyXG4gICAgICAgIGkgPSBtYXhtaW47XHJcbiAgICAgICAgd2hpbGUgKC0taSA+PSBtaW5tYXgpIHtcclxuICAgICAgICAgICAgaWYgKGlzTGVmdChQW21heG1heF0sIFBbbWlubWF4XSwgUFtpXSkgPj0gMCAmJiBpID4gbWlubWF4KVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIHdoaWxlIChILmxlbmd0aCA+IGJvdCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzTGVmdChIW0gubGVuZ3RoIC0gMl0sIEhbSC5sZW5ndGggLSAxXSwgUFtpXSkgPiAwKVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIEgubGVuZ3RoIC09IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGkgIT0gbWlubWluKVxyXG4gICAgICAgICAgICAgICAgSC5wdXNoKFBbaV0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBIO1xyXG59XHJcbmV4cG9ydHMuQ29udmV4SHVsbCA9IENvbnZleEh1bGw7XHJcbmZ1bmN0aW9uIGNsb2Nrd2lzZVJhZGlhbFN3ZWVwKHAsIFAsIGYpIHtcclxuICAgIFAuc2xpY2UoMCkuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gTWF0aC5hdGFuMihhLnkgLSBwLnksIGEueCAtIHAueCkgLSBNYXRoLmF0YW4yKGIueSAtIHAueSwgYi54IC0gcC54KTsgfSkuZm9yRWFjaChmKTtcclxufVxyXG5leHBvcnRzLmNsb2Nrd2lzZVJhZGlhbFN3ZWVwID0gY2xvY2t3aXNlUmFkaWFsU3dlZXA7XHJcbmZ1bmN0aW9uIG5leHRQb2x5UG9pbnQocCwgcHMpIHtcclxuICAgIGlmIChwLnBvbHlJbmRleCA9PT0gcHMubGVuZ3RoIC0gMSlcclxuICAgICAgICByZXR1cm4gcHNbMF07XHJcbiAgICByZXR1cm4gcHNbcC5wb2x5SW5kZXggKyAxXTtcclxufVxyXG5mdW5jdGlvbiBwcmV2UG9seVBvaW50KHAsIHBzKSB7XHJcbiAgICBpZiAocC5wb2x5SW5kZXggPT09IDApXHJcbiAgICAgICAgcmV0dXJuIHBzW3BzLmxlbmd0aCAtIDFdO1xyXG4gICAgcmV0dXJuIHBzW3AucG9seUluZGV4IC0gMV07XHJcbn1cclxuZnVuY3Rpb24gdGFuZ2VudF9Qb2ludFBvbHlDKFAsIFYpIHtcclxuICAgIHZhciBWY2xvc2VkID0gVi5zbGljZSgwKTtcclxuICAgIFZjbG9zZWQucHVzaChWWzBdKTtcclxuICAgIHJldHVybiB7IHJ0YW46IFJ0YW5nZW50X1BvaW50UG9seUMoUCwgVmNsb3NlZCksIGx0YW46IEx0YW5nZW50X1BvaW50UG9seUMoUCwgVmNsb3NlZCkgfTtcclxufVxyXG5mdW5jdGlvbiBSdGFuZ2VudF9Qb2ludFBvbHlDKFAsIFYpIHtcclxuICAgIHZhciBuID0gVi5sZW5ndGggLSAxO1xyXG4gICAgdmFyIGEsIGIsIGM7XHJcbiAgICB2YXIgdXBBLCBkbkM7XHJcbiAgICBpZiAoYmVsb3coUCwgVlsxXSwgVlswXSkgJiYgIWFib3ZlKFAsIFZbbiAtIDFdLCBWWzBdKSlcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIGZvciAoYSA9IDAsIGIgPSBuOzspIHtcclxuICAgICAgICBpZiAoYiAtIGEgPT09IDEpXHJcbiAgICAgICAgICAgIGlmIChhYm92ZShQLCBWW2FdLCBWW2JdKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBhO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYjtcclxuICAgICAgICBjID0gTWF0aC5mbG9vcigoYSArIGIpIC8gMik7XHJcbiAgICAgICAgZG5DID0gYmVsb3coUCwgVltjICsgMV0sIFZbY10pO1xyXG4gICAgICAgIGlmIChkbkMgJiYgIWFib3ZlKFAsIFZbYyAtIDFdLCBWW2NdKSlcclxuICAgICAgICAgICAgcmV0dXJuIGM7XHJcbiAgICAgICAgdXBBID0gYWJvdmUoUCwgVlthICsgMV0sIFZbYV0pO1xyXG4gICAgICAgIGlmICh1cEEpIHtcclxuICAgICAgICAgICAgaWYgKGRuQylcclxuICAgICAgICAgICAgICAgIGIgPSBjO1xyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChhYm92ZShQLCBWW2FdLCBWW2NdKSlcclxuICAgICAgICAgICAgICAgICAgICBiID0gYztcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBhID0gYztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKCFkbkMpXHJcbiAgICAgICAgICAgICAgICBhID0gYztcclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYmVsb3coUCwgVlthXSwgVltjXSkpXHJcbiAgICAgICAgICAgICAgICAgICAgYiA9IGM7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgYSA9IGM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gTHRhbmdlbnRfUG9pbnRQb2x5QyhQLCBWKSB7XHJcbiAgICB2YXIgbiA9IFYubGVuZ3RoIC0gMTtcclxuICAgIHZhciBhLCBiLCBjO1xyXG4gICAgdmFyIGRuQSwgZG5DO1xyXG4gICAgaWYgKGFib3ZlKFAsIFZbbiAtIDFdLCBWWzBdKSAmJiAhYmVsb3coUCwgVlsxXSwgVlswXSkpXHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICBmb3IgKGEgPSAwLCBiID0gbjs7KSB7XHJcbiAgICAgICAgaWYgKGIgLSBhID09PSAxKVxyXG4gICAgICAgICAgICBpZiAoYmVsb3coUCwgVlthXSwgVltiXSkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGI7XHJcbiAgICAgICAgYyA9IE1hdGguZmxvb3IoKGEgKyBiKSAvIDIpO1xyXG4gICAgICAgIGRuQyA9IGJlbG93KFAsIFZbYyArIDFdLCBWW2NdKTtcclxuICAgICAgICBpZiAoYWJvdmUoUCwgVltjIC0gMV0sIFZbY10pICYmICFkbkMpXHJcbiAgICAgICAgICAgIHJldHVybiBjO1xyXG4gICAgICAgIGRuQSA9IGJlbG93KFAsIFZbYSArIDFdLCBWW2FdKTtcclxuICAgICAgICBpZiAoZG5BKSB7XHJcbiAgICAgICAgICAgIGlmICghZG5DKVxyXG4gICAgICAgICAgICAgICAgYiA9IGM7XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKGJlbG93KFAsIFZbYV0sIFZbY10pKVxyXG4gICAgICAgICAgICAgICAgICAgIGIgPSBjO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIGEgPSBjO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoZG5DKVxyXG4gICAgICAgICAgICAgICAgYSA9IGM7XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFib3ZlKFAsIFZbYV0sIFZbY10pKVxyXG4gICAgICAgICAgICAgICAgICAgIGIgPSBjO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIGEgPSBjO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmZ1bmN0aW9uIHRhbmdlbnRfUG9seVBvbHlDKFYsIFcsIHQxLCB0MiwgY21wMSwgY21wMikge1xyXG4gICAgdmFyIGl4MSwgaXgyO1xyXG4gICAgaXgxID0gdDEoV1swXSwgVik7XHJcbiAgICBpeDIgPSB0MihWW2l4MV0sIFcpO1xyXG4gICAgdmFyIGRvbmUgPSBmYWxzZTtcclxuICAgIHdoaWxlICghZG9uZSkge1xyXG4gICAgICAgIGRvbmUgPSB0cnVlO1xyXG4gICAgICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgICAgICAgIGlmIChpeDEgPT09IFYubGVuZ3RoIC0gMSlcclxuICAgICAgICAgICAgICAgIGl4MSA9IDA7XHJcbiAgICAgICAgICAgIGlmIChjbXAxKFdbaXgyXSwgVltpeDFdLCBWW2l4MSArIDFdKSlcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICArK2l4MTtcclxuICAgICAgICB9XHJcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcclxuICAgICAgICAgICAgaWYgKGl4MiA9PT0gMClcclxuICAgICAgICAgICAgICAgIGl4MiA9IFcubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgaWYgKGNtcDIoVltpeDFdLCBXW2l4Ml0sIFdbaXgyIC0gMV0pKVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIC0taXgyO1xyXG4gICAgICAgICAgICBkb25lID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHsgdDE6IGl4MSwgdDI6IGl4MiB9O1xyXG59XHJcbmV4cG9ydHMudGFuZ2VudF9Qb2x5UG9seUMgPSB0YW5nZW50X1BvbHlQb2x5QztcclxuZnVuY3Rpb24gTFJ0YW5nZW50X1BvbHlQb2x5QyhWLCBXKSB7XHJcbiAgICB2YXIgcmwgPSBSTHRhbmdlbnRfUG9seVBvbHlDKFcsIFYpO1xyXG4gICAgcmV0dXJuIHsgdDE6IHJsLnQyLCB0MjogcmwudDEgfTtcclxufVxyXG5leHBvcnRzLkxSdGFuZ2VudF9Qb2x5UG9seUMgPSBMUnRhbmdlbnRfUG9seVBvbHlDO1xyXG5mdW5jdGlvbiBSTHRhbmdlbnRfUG9seVBvbHlDKFYsIFcpIHtcclxuICAgIHJldHVybiB0YW5nZW50X1BvbHlQb2x5QyhWLCBXLCBSdGFuZ2VudF9Qb2ludFBvbHlDLCBMdGFuZ2VudF9Qb2ludFBvbHlDLCBhYm92ZSwgYmVsb3cpO1xyXG59XHJcbmV4cG9ydHMuUkx0YW5nZW50X1BvbHlQb2x5QyA9IFJMdGFuZ2VudF9Qb2x5UG9seUM7XHJcbmZ1bmN0aW9uIExMdGFuZ2VudF9Qb2x5UG9seUMoViwgVykge1xyXG4gICAgcmV0dXJuIHRhbmdlbnRfUG9seVBvbHlDKFYsIFcsIEx0YW5nZW50X1BvaW50UG9seUMsIEx0YW5nZW50X1BvaW50UG9seUMsIGJlbG93LCBiZWxvdyk7XHJcbn1cclxuZXhwb3J0cy5MTHRhbmdlbnRfUG9seVBvbHlDID0gTEx0YW5nZW50X1BvbHlQb2x5QztcclxuZnVuY3Rpb24gUlJ0YW5nZW50X1BvbHlQb2x5QyhWLCBXKSB7XHJcbiAgICByZXR1cm4gdGFuZ2VudF9Qb2x5UG9seUMoViwgVywgUnRhbmdlbnRfUG9pbnRQb2x5QywgUnRhbmdlbnRfUG9pbnRQb2x5QywgYWJvdmUsIGFib3ZlKTtcclxufVxyXG5leHBvcnRzLlJSdGFuZ2VudF9Qb2x5UG9seUMgPSBSUnRhbmdlbnRfUG9seVBvbHlDO1xyXG52YXIgQmlUYW5nZW50ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIEJpVGFuZ2VudCh0MSwgdDIpIHtcclxuICAgICAgICB0aGlzLnQxID0gdDE7XHJcbiAgICAgICAgdGhpcy50MiA9IHQyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIEJpVGFuZ2VudDtcclxufSgpKTtcclxuZXhwb3J0cy5CaVRhbmdlbnQgPSBCaVRhbmdlbnQ7XHJcbnZhciBCaVRhbmdlbnRzID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIEJpVGFuZ2VudHMoKSB7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gQmlUYW5nZW50cztcclxufSgpKTtcclxuZXhwb3J0cy5CaVRhbmdlbnRzID0gQmlUYW5nZW50cztcclxudmFyIFRWR1BvaW50ID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgIF9fZXh0ZW5kcyhUVkdQb2ludCwgX3N1cGVyKTtcclxuICAgIGZ1bmN0aW9uIFRWR1BvaW50KCkge1xyXG4gICAgICAgIHJldHVybiBfc3VwZXIgIT09IG51bGwgJiYgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgdGhpcztcclxuICAgIH1cclxuICAgIHJldHVybiBUVkdQb2ludDtcclxufShQb2ludCkpO1xyXG5leHBvcnRzLlRWR1BvaW50ID0gVFZHUG9pbnQ7XHJcbnZhciBWaXNpYmlsaXR5VmVydGV4ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFZpc2liaWxpdHlWZXJ0ZXgoaWQsIHBvbHlpZCwgcG9seXZlcnRpZCwgcCkge1xyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgICAgICB0aGlzLnBvbHlpZCA9IHBvbHlpZDtcclxuICAgICAgICB0aGlzLnBvbHl2ZXJ0aWQgPSBwb2x5dmVydGlkO1xyXG4gICAgICAgIHRoaXMucCA9IHA7XHJcbiAgICAgICAgcC52diA9IHRoaXM7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gVmlzaWJpbGl0eVZlcnRleDtcclxufSgpKTtcclxuZXhwb3J0cy5WaXNpYmlsaXR5VmVydGV4ID0gVmlzaWJpbGl0eVZlcnRleDtcclxudmFyIFZpc2liaWxpdHlFZGdlID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFZpc2liaWxpdHlFZGdlKHNvdXJjZSwgdGFyZ2V0KSB7XHJcbiAgICAgICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XHJcbiAgICB9XHJcbiAgICBWaXNpYmlsaXR5RWRnZS5wcm90b3R5cGUubGVuZ3RoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBkeCA9IHRoaXMuc291cmNlLnAueCAtIHRoaXMudGFyZ2V0LnAueDtcclxuICAgICAgICB2YXIgZHkgPSB0aGlzLnNvdXJjZS5wLnkgLSB0aGlzLnRhcmdldC5wLnk7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFZpc2liaWxpdHlFZGdlO1xyXG59KCkpO1xyXG5leHBvcnRzLlZpc2liaWxpdHlFZGdlID0gVmlzaWJpbGl0eUVkZ2U7XHJcbnZhciBUYW5nZW50VmlzaWJpbGl0eUdyYXBoID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFRhbmdlbnRWaXNpYmlsaXR5R3JhcGgoUCwgZzApIHtcclxuICAgICAgICB0aGlzLlAgPSBQO1xyXG4gICAgICAgIHRoaXMuViA9IFtdO1xyXG4gICAgICAgIHRoaXMuRSA9IFtdO1xyXG4gICAgICAgIGlmICghZzApIHtcclxuICAgICAgICAgICAgdmFyIG4gPSBQLmxlbmd0aDtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBwID0gUFtpXTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcC5sZW5ndGg7ICsraikge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwaiA9IHBbal0sIHZ2ID0gbmV3IFZpc2liaWxpdHlWZXJ0ZXgodGhpcy5WLmxlbmd0aCwgaSwgaiwgcGopO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuVi5wdXNoKHZ2KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaiA+IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuRS5wdXNoKG5ldyBWaXNpYmlsaXR5RWRnZShwW2ogLSAxXS52diwgdnYpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChwLmxlbmd0aCA+IDEpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5FLnB1c2gobmV3IFZpc2liaWxpdHlFZGdlKHBbMF0udnYsIHBbcC5sZW5ndGggLSAxXS52dikpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbiAtIDE7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIFBpID0gUFtpXTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSBpICsgMTsgaiA8IG47IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBQaiA9IFBbal0sIHQgPSB0YW5nZW50cyhQaSwgUGopO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHEgaW4gdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYyA9IHRbcV0sIHNvdXJjZSA9IFBpW2MudDFdLCB0YXJnZXQgPSBQaltjLnQyXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRFZGdlSWZWaXNpYmxlKHNvdXJjZSwgdGFyZ2V0LCBpLCBqKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuViA9IGcwLlYuc2xpY2UoMCk7XHJcbiAgICAgICAgICAgIHRoaXMuRSA9IGcwLkUuc2xpY2UoMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgVGFuZ2VudFZpc2liaWxpdHlHcmFwaC5wcm90b3R5cGUuYWRkRWRnZUlmVmlzaWJsZSA9IGZ1bmN0aW9uICh1LCB2LCBpMSwgaTIpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaW50ZXJzZWN0c1BvbHlzKG5ldyBMaW5lU2VnbWVudCh1LngsIHUueSwgdi54LCB2LnkpLCBpMSwgaTIpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuRS5wdXNoKG5ldyBWaXNpYmlsaXR5RWRnZSh1LnZ2LCB2LnZ2KSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFRhbmdlbnRWaXNpYmlsaXR5R3JhcGgucHJvdG90eXBlLmFkZFBvaW50ID0gZnVuY3Rpb24gKHAsIGkxKSB7XHJcbiAgICAgICAgdmFyIG4gPSB0aGlzLlAubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMuVi5wdXNoKG5ldyBWaXNpYmlsaXR5VmVydGV4KHRoaXMuVi5sZW5ndGgsIG4sIDAsIHApKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSkge1xyXG4gICAgICAgICAgICBpZiAoaSA9PT0gaTEpXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgdmFyIHBvbHkgPSB0aGlzLlBbaV0sIHQgPSB0YW5nZW50X1BvaW50UG9seUMocCwgcG9seSk7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkRWRnZUlmVmlzaWJsZShwLCBwb2x5W3QubHRhbl0sIGkxLCBpKTtcclxuICAgICAgICAgICAgdGhpcy5hZGRFZGdlSWZWaXNpYmxlKHAsIHBvbHlbdC5ydGFuXSwgaTEsIGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcC52djtcclxuICAgIH07XHJcbiAgICBUYW5nZW50VmlzaWJpbGl0eUdyYXBoLnByb3RvdHlwZS5pbnRlcnNlY3RzUG9seXMgPSBmdW5jdGlvbiAobCwgaTEsIGkyKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSB0aGlzLlAubGVuZ3RoOyBpIDwgbjsgKytpKSB7XHJcbiAgICAgICAgICAgIGlmIChpICE9IGkxICYmIGkgIT0gaTIgJiYgaW50ZXJzZWN0cyhsLCB0aGlzLlBbaV0pLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gVGFuZ2VudFZpc2liaWxpdHlHcmFwaDtcclxufSgpKTtcclxuZXhwb3J0cy5UYW5nZW50VmlzaWJpbGl0eUdyYXBoID0gVGFuZ2VudFZpc2liaWxpdHlHcmFwaDtcclxuZnVuY3Rpb24gaW50ZXJzZWN0cyhsLCBQKSB7XHJcbiAgICB2YXIgaW50cyA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDEsIG4gPSBQLmxlbmd0aDsgaSA8IG47ICsraSkge1xyXG4gICAgICAgIHZhciBpbnQgPSByZWN0YW5nbGVfMS5SZWN0YW5nbGUubGluZUludGVyc2VjdGlvbihsLngxLCBsLnkxLCBsLngyLCBsLnkyLCBQW2kgLSAxXS54LCBQW2kgLSAxXS55LCBQW2ldLngsIFBbaV0ueSk7XHJcbiAgICAgICAgaWYgKGludClcclxuICAgICAgICAgICAgaW50cy5wdXNoKGludCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaW50cztcclxufVxyXG5mdW5jdGlvbiB0YW5nZW50cyhWLCBXKSB7XHJcbiAgICB2YXIgbSA9IFYubGVuZ3RoIC0gMSwgbiA9IFcubGVuZ3RoIC0gMTtcclxuICAgIHZhciBidCA9IG5ldyBCaVRhbmdlbnRzKCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG07ICsraSkge1xyXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbjsgKytqKSB7XHJcbiAgICAgICAgICAgIHZhciB2MSA9IFZbaSA9PSAwID8gbSAtIDEgOiBpIC0gMV07XHJcbiAgICAgICAgICAgIHZhciB2MiA9IFZbaV07XHJcbiAgICAgICAgICAgIHZhciB2MyA9IFZbaSArIDFdO1xyXG4gICAgICAgICAgICB2YXIgdzEgPSBXW2ogPT0gMCA/IG4gLSAxIDogaiAtIDFdO1xyXG4gICAgICAgICAgICB2YXIgdzIgPSBXW2pdO1xyXG4gICAgICAgICAgICB2YXIgdzMgPSBXW2ogKyAxXTtcclxuICAgICAgICAgICAgdmFyIHYxdjJ3MiA9IGlzTGVmdCh2MSwgdjIsIHcyKTtcclxuICAgICAgICAgICAgdmFyIHYydzF3MiA9IGlzTGVmdCh2MiwgdzEsIHcyKTtcclxuICAgICAgICAgICAgdmFyIHYydzJ3MyA9IGlzTGVmdCh2MiwgdzIsIHczKTtcclxuICAgICAgICAgICAgdmFyIHcxdzJ2MiA9IGlzTGVmdCh3MSwgdzIsIHYyKTtcclxuICAgICAgICAgICAgdmFyIHcydjF2MiA9IGlzTGVmdCh3MiwgdjEsIHYyKTtcclxuICAgICAgICAgICAgdmFyIHcydjJ2MyA9IGlzTGVmdCh3MiwgdjIsIHYzKTtcclxuICAgICAgICAgICAgaWYgKHYxdjJ3MiA+PSAwICYmIHYydzF3MiA+PSAwICYmIHYydzJ3MyA8IDBcclxuICAgICAgICAgICAgICAgICYmIHcxdzJ2MiA+PSAwICYmIHcydjF2MiA+PSAwICYmIHcydjJ2MyA8IDApIHtcclxuICAgICAgICAgICAgICAgIGJ0LmxsID0gbmV3IEJpVGFuZ2VudChpLCBqKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh2MXYydzIgPD0gMCAmJiB2MncxdzIgPD0gMCAmJiB2MncydzMgPiAwXHJcbiAgICAgICAgICAgICAgICAmJiB3MXcydjIgPD0gMCAmJiB3MnYxdjIgPD0gMCAmJiB3MnYydjMgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBidC5yciA9IG5ldyBCaVRhbmdlbnQoaSwgaik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodjF2MncyIDw9IDAgJiYgdjJ3MXcyID4gMCAmJiB2MncydzMgPD0gMFxyXG4gICAgICAgICAgICAgICAgJiYgdzF3MnYyID49IDAgJiYgdzJ2MXYyIDwgMCAmJiB3MnYydjMgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgYnQucmwgPSBuZXcgQmlUYW5nZW50KGksIGopO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHYxdjJ3MiA+PSAwICYmIHYydzF3MiA8IDAgJiYgdjJ3MnczID49IDBcclxuICAgICAgICAgICAgICAgICYmIHcxdzJ2MiA8PSAwICYmIHcydjF2MiA+IDAgJiYgdzJ2MnYzIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIGJ0LmxyID0gbmV3IEJpVGFuZ2VudChpLCBqKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBidDtcclxufVxyXG5leHBvcnRzLnRhbmdlbnRzID0gdGFuZ2VudHM7XHJcbmZ1bmN0aW9uIGlzUG9pbnRJbnNpZGVQb2x5KHAsIHBvbHkpIHtcclxuICAgIGZvciAodmFyIGkgPSAxLCBuID0gcG9seS5sZW5ndGg7IGkgPCBuOyArK2kpXHJcbiAgICAgICAgaWYgKGJlbG93KHBvbHlbaSAtIDFdLCBwb2x5W2ldLCBwKSlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuZnVuY3Rpb24gaXNBbnlQSW5RKHAsIHEpIHtcclxuICAgIHJldHVybiAhcC5ldmVyeShmdW5jdGlvbiAodikgeyByZXR1cm4gIWlzUG9pbnRJbnNpZGVQb2x5KHYsIHEpOyB9KTtcclxufVxyXG5mdW5jdGlvbiBwb2x5c092ZXJsYXAocCwgcSkge1xyXG4gICAgaWYgKGlzQW55UEluUShwLCBxKSlcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIGlmIChpc0FueVBJblEocSwgcCkpXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICBmb3IgKHZhciBpID0gMSwgbiA9IHAubGVuZ3RoOyBpIDwgbjsgKytpKSB7XHJcbiAgICAgICAgdmFyIHYgPSBwW2ldLCB1ID0gcFtpIC0gMV07XHJcbiAgICAgICAgaWYgKGludGVyc2VjdHMobmV3IExpbmVTZWdtZW50KHUueCwgdS55LCB2LngsIHYueSksIHEpLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59XHJcbmV4cG9ydHMucG9seXNPdmVybGFwID0gcG9seXNPdmVybGFwO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1nZW9tLmpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi93ZWJjb2xhL2Rpc3Qvc3JjL2dlb20uanNcbi8vIG1vZHVsZSBpZCA9IDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIHJlY3RhbmdsZV8xID0gcmVxdWlyZShcIi4vcmVjdGFuZ2xlXCIpO1xyXG52YXIgdnBzY18xID0gcmVxdWlyZShcIi4vdnBzY1wiKTtcclxudmFyIHNob3J0ZXN0cGF0aHNfMSA9IHJlcXVpcmUoXCIuL3Nob3J0ZXN0cGF0aHNcIik7XHJcbnZhciBOb2RlV3JhcHBlciA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBOb2RlV3JhcHBlcihpZCwgcmVjdCwgY2hpbGRyZW4pIHtcclxuICAgICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICAgICAgdGhpcy5yZWN0ID0gcmVjdDtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XHJcbiAgICAgICAgdGhpcy5sZWFmID0gdHlwZW9mIGNoaWxkcmVuID09PSAndW5kZWZpbmVkJyB8fCBjaGlsZHJlbi5sZW5ndGggPT09IDA7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gTm9kZVdyYXBwZXI7XHJcbn0oKSk7XHJcbmV4cG9ydHMuTm9kZVdyYXBwZXIgPSBOb2RlV3JhcHBlcjtcclxudmFyIFZlcnQgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gVmVydChpZCwgeCwgeSwgbm9kZSwgbGluZSkge1xyXG4gICAgICAgIGlmIChub2RlID09PSB2b2lkIDApIHsgbm9kZSA9IG51bGw7IH1cclxuICAgICAgICBpZiAobGluZSA9PT0gdm9pZCAwKSB7IGxpbmUgPSBudWxsOyB9XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgICAgICB0aGlzLm5vZGUgPSBub2RlO1xyXG4gICAgICAgIHRoaXMubGluZSA9IGxpbmU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gVmVydDtcclxufSgpKTtcclxuZXhwb3J0cy5WZXJ0ID0gVmVydDtcclxudmFyIExvbmdlc3RDb21tb25TdWJzZXF1ZW5jZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBMb25nZXN0Q29tbW9uU3Vic2VxdWVuY2UocywgdCkge1xyXG4gICAgICAgIHRoaXMucyA9IHM7XHJcbiAgICAgICAgdGhpcy50ID0gdDtcclxuICAgICAgICB2YXIgbWYgPSBMb25nZXN0Q29tbW9uU3Vic2VxdWVuY2UuZmluZE1hdGNoKHMsIHQpO1xyXG4gICAgICAgIHZhciB0ciA9IHQuc2xpY2UoMCkucmV2ZXJzZSgpO1xyXG4gICAgICAgIHZhciBtciA9IExvbmdlc3RDb21tb25TdWJzZXF1ZW5jZS5maW5kTWF0Y2gocywgdHIpO1xyXG4gICAgICAgIGlmIChtZi5sZW5ndGggPj0gbXIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGVuZ3RoID0gbWYubGVuZ3RoO1xyXG4gICAgICAgICAgICB0aGlzLnNpID0gbWYuc2k7XHJcbiAgICAgICAgICAgIHRoaXMudGkgPSBtZi50aTtcclxuICAgICAgICAgICAgdGhpcy5yZXZlcnNlZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5sZW5ndGggPSBtci5sZW5ndGg7XHJcbiAgICAgICAgICAgIHRoaXMuc2kgPSBtci5zaTtcclxuICAgICAgICAgICAgdGhpcy50aSA9IHQubGVuZ3RoIC0gbXIudGkgLSBtci5sZW5ndGg7XHJcbiAgICAgICAgICAgIHRoaXMucmV2ZXJzZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIExvbmdlc3RDb21tb25TdWJzZXF1ZW5jZS5maW5kTWF0Y2ggPSBmdW5jdGlvbiAocywgdCkge1xyXG4gICAgICAgIHZhciBtID0gcy5sZW5ndGg7XHJcbiAgICAgICAgdmFyIG4gPSB0Lmxlbmd0aDtcclxuICAgICAgICB2YXIgbWF0Y2ggPSB7IGxlbmd0aDogMCwgc2k6IC0xLCB0aTogLTEgfTtcclxuICAgICAgICB2YXIgbCA9IG5ldyBBcnJheShtKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG07IGkrKykge1xyXG4gICAgICAgICAgICBsW2ldID0gbmV3IEFycmF5KG4pO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG47IGorKylcclxuICAgICAgICAgICAgICAgIGlmIChzW2ldID09PSB0W2pdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHYgPSBsW2ldW2pdID0gKGkgPT09IDAgfHwgaiA9PT0gMCkgPyAxIDogbFtpIC0gMV1baiAtIDFdICsgMTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodiA+IG1hdGNoLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaC5sZW5ndGggPSB2O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaC5zaSA9IGkgLSB2ICsgMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2gudGkgPSBqIC0gdiArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBsW2ldW2pdID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1hdGNoO1xyXG4gICAgfTtcclxuICAgIExvbmdlc3RDb21tb25TdWJzZXF1ZW5jZS5wcm90b3R5cGUuZ2V0U2VxdWVuY2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGVuZ3RoID49IDAgPyB0aGlzLnMuc2xpY2UodGhpcy5zaSwgdGhpcy5zaSArIHRoaXMubGVuZ3RoKSA6IFtdO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBMb25nZXN0Q29tbW9uU3Vic2VxdWVuY2U7XHJcbn0oKSk7XHJcbmV4cG9ydHMuTG9uZ2VzdENvbW1vblN1YnNlcXVlbmNlID0gTG9uZ2VzdENvbW1vblN1YnNlcXVlbmNlO1xyXG52YXIgR3JpZFJvdXRlciA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBHcmlkUm91dGVyKG9yaWdpbmFsbm9kZXMsIGFjY2Vzc29yLCBncm91cFBhZGRpbmcpIHtcclxuICAgICAgICBpZiAoZ3JvdXBQYWRkaW5nID09PSB2b2lkIDApIHsgZ3JvdXBQYWRkaW5nID0gMTI7IH1cclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxub2RlcyA9IG9yaWdpbmFsbm9kZXM7XHJcbiAgICAgICAgdGhpcy5ncm91cFBhZGRpbmcgPSBncm91cFBhZGRpbmc7XHJcbiAgICAgICAgdGhpcy5sZWF2ZXMgPSBudWxsO1xyXG4gICAgICAgIHRoaXMubm9kZXMgPSBvcmlnaW5hbG5vZGVzLm1hcChmdW5jdGlvbiAodiwgaSkgeyByZXR1cm4gbmV3IE5vZGVXcmFwcGVyKGksIGFjY2Vzc29yLmdldEJvdW5kcyh2KSwgYWNjZXNzb3IuZ2V0Q2hpbGRyZW4odikpOyB9KTtcclxuICAgICAgICB0aGlzLmxlYXZlcyA9IHRoaXMubm9kZXMuZmlsdGVyKGZ1bmN0aW9uICh2KSB7IHJldHVybiB2LmxlYWY7IH0pO1xyXG4gICAgICAgIHRoaXMuZ3JvdXBzID0gdGhpcy5ub2Rlcy5maWx0ZXIoZnVuY3Rpb24gKGcpIHsgcmV0dXJuICFnLmxlYWY7IH0pO1xyXG4gICAgICAgIHRoaXMuY29scyA9IHRoaXMuZ2V0R3JpZExpbmVzKCd4Jyk7XHJcbiAgICAgICAgdGhpcy5yb3dzID0gdGhpcy5nZXRHcmlkTGluZXMoJ3knKTtcclxuICAgICAgICB0aGlzLmdyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2LmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGMpIHsgcmV0dXJuIF90aGlzLm5vZGVzW2NdLnBhcmVudCA9IHY7IH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucm9vdCA9IHsgY2hpbGRyZW46IFtdIH07XHJcbiAgICAgICAgdGhpcy5ub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygdi5wYXJlbnQgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICB2LnBhcmVudCA9IF90aGlzLnJvb3Q7XHJcbiAgICAgICAgICAgICAgICBfdGhpcy5yb290LmNoaWxkcmVuLnB1c2godi5pZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdi5wb3J0cyA9IFtdO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuYmFja1RvRnJvbnQgPSB0aGlzLm5vZGVzLnNsaWNlKDApO1xyXG4gICAgICAgIHRoaXMuYmFja1RvRnJvbnQuc29ydChmdW5jdGlvbiAoeCwgeSkgeyByZXR1cm4gX3RoaXMuZ2V0RGVwdGgoeCkgLSBfdGhpcy5nZXREZXB0aCh5KTsgfSk7XHJcbiAgICAgICAgdmFyIGZyb250VG9CYWNrR3JvdXBzID0gdGhpcy5iYWNrVG9Gcm9udC5zbGljZSgwKS5yZXZlcnNlKCkuZmlsdGVyKGZ1bmN0aW9uIChnKSB7IHJldHVybiAhZy5sZWFmOyB9KTtcclxuICAgICAgICBmcm9udFRvQmFja0dyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgIHZhciByID0gcmVjdGFuZ2xlXzEuUmVjdGFuZ2xlLmVtcHR5KCk7XHJcbiAgICAgICAgICAgIHYuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAoYykgeyByZXR1cm4gciA9IHIudW5pb24oX3RoaXMubm9kZXNbY10ucmVjdCk7IH0pO1xyXG4gICAgICAgICAgICB2LnJlY3QgPSByLmluZmxhdGUoX3RoaXMuZ3JvdXBQYWRkaW5nKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgY29sTWlkcyA9IHRoaXMubWlkUG9pbnRzKHRoaXMuY29scy5tYXAoZnVuY3Rpb24gKHIpIHsgcmV0dXJuIHIucG9zOyB9KSk7XHJcbiAgICAgICAgdmFyIHJvd01pZHMgPSB0aGlzLm1pZFBvaW50cyh0aGlzLnJvd3MubWFwKGZ1bmN0aW9uIChyKSB7IHJldHVybiByLnBvczsgfSkpO1xyXG4gICAgICAgIHZhciByb3d4ID0gY29sTWlkc1swXSwgcm93WCA9IGNvbE1pZHNbY29sTWlkcy5sZW5ndGggLSAxXTtcclxuICAgICAgICB2YXIgY29seSA9IHJvd01pZHNbMF0sIGNvbFkgPSByb3dNaWRzW3Jvd01pZHMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgdmFyIGhsaW5lcyA9IHRoaXMucm93cy5tYXAoZnVuY3Rpb24gKHIpIHsgcmV0dXJuICh7IHgxOiByb3d4LCB4Mjogcm93WCwgeTE6IHIucG9zLCB5Mjogci5wb3MgfSk7IH0pXHJcbiAgICAgICAgICAgIC5jb25jYXQocm93TWlkcy5tYXAoZnVuY3Rpb24gKG0pIHsgcmV0dXJuICh7IHgxOiByb3d4LCB4Mjogcm93WCwgeTE6IG0sIHkyOiBtIH0pOyB9KSk7XHJcbiAgICAgICAgdmFyIHZsaW5lcyA9IHRoaXMuY29scy5tYXAoZnVuY3Rpb24gKGMpIHsgcmV0dXJuICh7IHgxOiBjLnBvcywgeDI6IGMucG9zLCB5MTogY29seSwgeTI6IGNvbFkgfSk7IH0pXHJcbiAgICAgICAgICAgIC5jb25jYXQoY29sTWlkcy5tYXAoZnVuY3Rpb24gKG0pIHsgcmV0dXJuICh7IHgxOiBtLCB4MjogbSwgeTE6IGNvbHksIHkyOiBjb2xZIH0pOyB9KSk7XHJcbiAgICAgICAgdmFyIGxpbmVzID0gaGxpbmVzLmNvbmNhdCh2bGluZXMpO1xyXG4gICAgICAgIGxpbmVzLmZvckVhY2goZnVuY3Rpb24gKGwpIHsgcmV0dXJuIGwudmVydHMgPSBbXTsgfSk7XHJcbiAgICAgICAgdGhpcy52ZXJ0cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZWRnZXMgPSBbXTtcclxuICAgICAgICBobGluZXMuZm9yRWFjaChmdW5jdGlvbiAoaCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdmxpbmVzLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICAgICAgICAgIHZhciBwID0gbmV3IFZlcnQoX3RoaXMudmVydHMubGVuZ3RoLCB2LngxLCBoLnkxKTtcclxuICAgICAgICAgICAgICAgIGgudmVydHMucHVzaChwKTtcclxuICAgICAgICAgICAgICAgIHYudmVydHMucHVzaChwKTtcclxuICAgICAgICAgICAgICAgIF90aGlzLnZlcnRzLnB1c2gocCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgaSA9IF90aGlzLmJhY2tUb0Zyb250Lmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIHdoaWxlIChpLS0gPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vZGUgPSBfdGhpcy5iYWNrVG9Gcm9udFtpXSwgciA9IG5vZGUucmVjdDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZHggPSBNYXRoLmFicyhwLnggLSByLmN4KCkpLCBkeSA9IE1hdGguYWJzKHAueSAtIHIuY3koKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGR4IDwgci53aWR0aCgpIC8gMiAmJiBkeSA8IHIuaGVpZ2h0KCkgLyAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHAubm9kZSA9IG5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbGluZXMuZm9yRWFjaChmdW5jdGlvbiAobCwgbGkpIHtcclxuICAgICAgICAgICAgX3RoaXMubm9kZXMuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkge1xyXG4gICAgICAgICAgICAgICAgdi5yZWN0LmxpbmVJbnRlcnNlY3Rpb25zKGwueDEsIGwueTEsIGwueDIsIGwueTIpLmZvckVhY2goZnVuY3Rpb24gKGludGVyc2VjdCwgaikge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwID0gbmV3IFZlcnQoX3RoaXMudmVydHMubGVuZ3RoLCBpbnRlcnNlY3QueCwgaW50ZXJzZWN0LnksIHYsIGwpO1xyXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnZlcnRzLnB1c2gocCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbC52ZXJ0cy5wdXNoKHApO1xyXG4gICAgICAgICAgICAgICAgICAgIHYucG9ydHMucHVzaChwKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdmFyIGlzSG9yaXogPSBNYXRoLmFicyhsLnkxIC0gbC55MikgPCAwLjE7XHJcbiAgICAgICAgICAgIHZhciBkZWx0YSA9IGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBpc0hvcml6ID8gYi54IC0gYS54IDogYi55IC0gYS55OyB9O1xyXG4gICAgICAgICAgICBsLnZlcnRzLnNvcnQoZGVsdGEpO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGwudmVydHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciB1ID0gbC52ZXJ0c1tpIC0gMV0sIHYgPSBsLnZlcnRzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHUubm9kZSAmJiB1Lm5vZGUgPT09IHYubm9kZSAmJiB1Lm5vZGUubGVhZilcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIF90aGlzLmVkZ2VzLnB1c2goeyBzb3VyY2U6IHUuaWQsIHRhcmdldDogdi5pZCwgbGVuZ3RoOiBNYXRoLmFicyhkZWx0YSh1LCB2KSkgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIEdyaWRSb3V0ZXIucHJvdG90eXBlLmF2ZyA9IGZ1bmN0aW9uIChhKSB7IHJldHVybiBhLnJlZHVjZShmdW5jdGlvbiAoeCwgeSkgeyByZXR1cm4geCArIHk7IH0pIC8gYS5sZW5ndGg7IH07XHJcbiAgICBHcmlkUm91dGVyLnByb3RvdHlwZS5nZXRHcmlkTGluZXMgPSBmdW5jdGlvbiAoYXhpcykge1xyXG4gICAgICAgIHZhciBjb2x1bW5zID0gW107XHJcbiAgICAgICAgdmFyIGxzID0gdGhpcy5sZWF2ZXMuc2xpY2UoMCwgdGhpcy5sZWF2ZXMubGVuZ3RoKTtcclxuICAgICAgICB3aGlsZSAobHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB2YXIgb3ZlcmxhcHBpbmcgPSBscy5maWx0ZXIoZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHYucmVjdFsnb3ZlcmxhcCcgKyBheGlzLnRvVXBwZXJDYXNlKCldKGxzWzBdLnJlY3QpOyB9KTtcclxuICAgICAgICAgICAgdmFyIGNvbCA9IHtcclxuICAgICAgICAgICAgICAgIG5vZGVzOiBvdmVybGFwcGluZyxcclxuICAgICAgICAgICAgICAgIHBvczogdGhpcy5hdmcob3ZlcmxhcHBpbmcubWFwKGZ1bmN0aW9uICh2KSB7IHJldHVybiB2LnJlY3RbJ2MnICsgYXhpc10oKTsgfSkpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbHVtbnMucHVzaChjb2wpO1xyXG4gICAgICAgICAgICBjb2wubm9kZXMuZm9yRWFjaChmdW5jdGlvbiAodikgeyByZXR1cm4gbHMuc3BsaWNlKGxzLmluZGV4T2YodiksIDEpOyB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29sdW1ucy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhLnBvcyAtIGIucG9zOyB9KTtcclxuICAgICAgICByZXR1cm4gY29sdW1ucztcclxuICAgIH07XHJcbiAgICBHcmlkUm91dGVyLnByb3RvdHlwZS5nZXREZXB0aCA9IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgdmFyIGRlcHRoID0gMDtcclxuICAgICAgICB3aGlsZSAodi5wYXJlbnQgIT09IHRoaXMucm9vdCkge1xyXG4gICAgICAgICAgICBkZXB0aCsrO1xyXG4gICAgICAgICAgICB2ID0gdi5wYXJlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkZXB0aDtcclxuICAgIH07XHJcbiAgICBHcmlkUm91dGVyLnByb3RvdHlwZS5taWRQb2ludHMgPSBmdW5jdGlvbiAoYSkge1xyXG4gICAgICAgIHZhciBnYXAgPSBhWzFdIC0gYVswXTtcclxuICAgICAgICB2YXIgbWlkcyA9IFthWzBdIC0gZ2FwIC8gMl07XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIG1pZHMucHVzaCgoYVtpXSArIGFbaSAtIDFdKSAvIDIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtaWRzLnB1c2goYVthLmxlbmd0aCAtIDFdICsgZ2FwIC8gMik7XHJcbiAgICAgICAgcmV0dXJuIG1pZHM7XHJcbiAgICB9O1xyXG4gICAgR3JpZFJvdXRlci5wcm90b3R5cGUuZmluZExpbmVhZ2UgPSBmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHZhciBsaW5lYWdlID0gW3ZdO1xyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgdiA9IHYucGFyZW50O1xyXG4gICAgICAgICAgICBsaW5lYWdlLnB1c2godik7XHJcbiAgICAgICAgfSB3aGlsZSAodiAhPT0gdGhpcy5yb290KTtcclxuICAgICAgICByZXR1cm4gbGluZWFnZS5yZXZlcnNlKCk7XHJcbiAgICB9O1xyXG4gICAgR3JpZFJvdXRlci5wcm90b3R5cGUuZmluZEFuY2VzdG9yUGF0aEJldHdlZW4gPSBmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgIHZhciBhYSA9IHRoaXMuZmluZExpbmVhZ2UoYSksIGJhID0gdGhpcy5maW5kTGluZWFnZShiKSwgaSA9IDA7XHJcbiAgICAgICAgd2hpbGUgKGFhW2ldID09PSBiYVtpXSlcclxuICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgIHJldHVybiB7IGNvbW1vbkFuY2VzdG9yOiBhYVtpIC0gMV0sIGxpbmVhZ2VzOiBhYS5zbGljZShpKS5jb25jYXQoYmEuc2xpY2UoaSkpIH07XHJcbiAgICB9O1xyXG4gICAgR3JpZFJvdXRlci5wcm90b3R5cGUuc2libGluZ09ic3RhY2xlcyA9IGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgcGF0aCA9IHRoaXMuZmluZEFuY2VzdG9yUGF0aEJldHdlZW4oYSwgYik7XHJcbiAgICAgICAgdmFyIGxpbmVhZ2VMb29rdXAgPSB7fTtcclxuICAgICAgICBwYXRoLmxpbmVhZ2VzLmZvckVhY2goZnVuY3Rpb24gKHYpIHsgcmV0dXJuIGxpbmVhZ2VMb29rdXBbdi5pZF0gPSB7fTsgfSk7XHJcbiAgICAgICAgdmFyIG9ic3RhY2xlcyA9IHBhdGguY29tbW9uQW5jZXN0b3IuY2hpbGRyZW4uZmlsdGVyKGZ1bmN0aW9uICh2KSB7IHJldHVybiAhKHYgaW4gbGluZWFnZUxvb2t1cCk7IH0pO1xyXG4gICAgICAgIHBhdGgubGluZWFnZXNcclxuICAgICAgICAgICAgLmZpbHRlcihmdW5jdGlvbiAodikgeyByZXR1cm4gdi5wYXJlbnQgIT09IHBhdGguY29tbW9uQW5jZXN0b3I7IH0pXHJcbiAgICAgICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7IHJldHVybiBvYnN0YWNsZXMgPSBvYnN0YWNsZXMuY29uY2F0KHYucGFyZW50LmNoaWxkcmVuLmZpbHRlcihmdW5jdGlvbiAoYykgeyByZXR1cm4gYyAhPT0gdi5pZDsgfSkpOyB9KTtcclxuICAgICAgICByZXR1cm4gb2JzdGFjbGVzLm1hcChmdW5jdGlvbiAodikgeyByZXR1cm4gX3RoaXMubm9kZXNbdl07IH0pO1xyXG4gICAgfTtcclxuICAgIEdyaWRSb3V0ZXIuZ2V0U2VnbWVudFNldHMgPSBmdW5jdGlvbiAocm91dGVzLCB4LCB5KSB7XHJcbiAgICAgICAgdmFyIHZzZWdtZW50cyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGVpID0gMDsgZWkgPCByb3V0ZXMubGVuZ3RoOyBlaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciByb3V0ZSA9IHJvdXRlc1tlaV07XHJcbiAgICAgICAgICAgIGZvciAodmFyIHNpID0gMDsgc2kgPCByb3V0ZS5sZW5ndGg7IHNpKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBzID0gcm91dGVbc2ldO1xyXG4gICAgICAgICAgICAgICAgcy5lZGdlaWQgPSBlaTtcclxuICAgICAgICAgICAgICAgIHMuaSA9IHNpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHNkeCA9IHNbMV1beF0gLSBzWzBdW3hdO1xyXG4gICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKHNkeCkgPCAwLjEpIHtcclxuICAgICAgICAgICAgICAgICAgICB2c2VnbWVudHMucHVzaChzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2c2VnbWVudHMuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYVswXVt4XSAtIGJbMF1beF07IH0pO1xyXG4gICAgICAgIHZhciB2c2VnbWVudHNldHMgPSBbXTtcclxuICAgICAgICB2YXIgc2VnbWVudHNldCA9IG51bGw7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2c2VnbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHMgPSB2c2VnbWVudHNbaV07XHJcbiAgICAgICAgICAgIGlmICghc2VnbWVudHNldCB8fCBNYXRoLmFicyhzWzBdW3hdIC0gc2VnbWVudHNldC5wb3MpID4gMC4xKSB7XHJcbiAgICAgICAgICAgICAgICBzZWdtZW50c2V0ID0geyBwb3M6IHNbMF1beF0sIHNlZ21lbnRzOiBbXSB9O1xyXG4gICAgICAgICAgICAgICAgdnNlZ21lbnRzZXRzLnB1c2goc2VnbWVudHNldCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2VnbWVudHNldC5zZWdtZW50cy5wdXNoKHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdnNlZ21lbnRzZXRzO1xyXG4gICAgfTtcclxuICAgIEdyaWRSb3V0ZXIubnVkZ2VTZWdzID0gZnVuY3Rpb24gKHgsIHksIHJvdXRlcywgc2VnbWVudHMsIGxlZnRPZiwgZ2FwKSB7XHJcbiAgICAgICAgdmFyIG4gPSBzZWdtZW50cy5sZW5ndGg7XHJcbiAgICAgICAgaWYgKG4gPD0gMSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHZhciB2cyA9IHNlZ21lbnRzLm1hcChmdW5jdGlvbiAocykgeyByZXR1cm4gbmV3IHZwc2NfMS5WYXJpYWJsZShzWzBdW3hdKTsgfSk7XHJcbiAgICAgICAgdmFyIGNzID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBuOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChpID09PSBqKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgdmFyIHMxID0gc2VnbWVudHNbaV0sIHMyID0gc2VnbWVudHNbal0sIGUxID0gczEuZWRnZWlkLCBlMiA9IHMyLmVkZ2VpZCwgbGluZCA9IC0xLCByaW5kID0gLTE7XHJcbiAgICAgICAgICAgICAgICBpZiAoeCA9PSAneCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGVmdE9mKGUxLCBlMikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHMxWzBdW3ldIDwgczFbMV1beV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmQgPSBqLCByaW5kID0gaTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmQgPSBpLCByaW5kID0gajtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsZWZ0T2YoZTEsIGUyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoczFbMF1beV0gPCBzMVsxXVt5XSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZCA9IGksIHJpbmQgPSBqO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZCA9IGosIHJpbmQgPSBpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGxpbmQgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNzLnB1c2gobmV3IHZwc2NfMS5Db25zdHJhaW50KHZzW2xpbmRdLCB2c1tyaW5kXSwgZ2FwKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHNvbHZlciA9IG5ldyB2cHNjXzEuU29sdmVyKHZzLCBjcyk7XHJcbiAgICAgICAgc29sdmVyLnNvbHZlKCk7XHJcbiAgICAgICAgdnMuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkge1xyXG4gICAgICAgICAgICB2YXIgcyA9IHNlZ21lbnRzW2ldO1xyXG4gICAgICAgICAgICB2YXIgcG9zID0gdi5wb3NpdGlvbigpO1xyXG4gICAgICAgICAgICBzWzBdW3hdID0gc1sxXVt4XSA9IHBvcztcclxuICAgICAgICAgICAgdmFyIHJvdXRlID0gcm91dGVzW3MuZWRnZWlkXTtcclxuICAgICAgICAgICAgaWYgKHMuaSA+IDApXHJcbiAgICAgICAgICAgICAgICByb3V0ZVtzLmkgLSAxXVsxXVt4XSA9IHBvcztcclxuICAgICAgICAgICAgaWYgKHMuaSA8IHJvdXRlLmxlbmd0aCAtIDEpXHJcbiAgICAgICAgICAgICAgICByb3V0ZVtzLmkgKyAxXVswXVt4XSA9IHBvcztcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBHcmlkUm91dGVyLm51ZGdlU2VnbWVudHMgPSBmdW5jdGlvbiAocm91dGVzLCB4LCB5LCBsZWZ0T2YsIGdhcCkge1xyXG4gICAgICAgIHZhciB2c2VnbWVudHNldHMgPSBHcmlkUm91dGVyLmdldFNlZ21lbnRTZXRzKHJvdXRlcywgeCwgeSk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2c2VnbWVudHNldHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHNzID0gdnNlZ21lbnRzZXRzW2ldO1xyXG4gICAgICAgICAgICB2YXIgZXZlbnRzID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc3Muc2VnbWVudHMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBzID0gc3Muc2VnbWVudHNbal07XHJcbiAgICAgICAgICAgICAgICBldmVudHMucHVzaCh7IHR5cGU6IDAsIHM6IHMsIHBvczogTWF0aC5taW4oc1swXVt5XSwgc1sxXVt5XSkgfSk7XHJcbiAgICAgICAgICAgICAgICBldmVudHMucHVzaCh7IHR5cGU6IDEsIHM6IHMsIHBvczogTWF0aC5tYXgoc1swXVt5XSwgc1sxXVt5XSkgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZXZlbnRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIGEucG9zIC0gYi5wb3MgKyBhLnR5cGUgLSBiLnR5cGU7IH0pO1xyXG4gICAgICAgICAgICB2YXIgb3BlbiA9IFtdO1xyXG4gICAgICAgICAgICB2YXIgb3BlbkNvdW50ID0gMDtcclxuICAgICAgICAgICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlLnR5cGUgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBvcGVuLnB1c2goZS5zKTtcclxuICAgICAgICAgICAgICAgICAgICBvcGVuQ291bnQrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG9wZW5Db3VudC0tO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG9wZW5Db3VudCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgR3JpZFJvdXRlci5udWRnZVNlZ3MoeCwgeSwgcm91dGVzLCBvcGVuLCBsZWZ0T2YsIGdhcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgb3BlbiA9IFtdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgR3JpZFJvdXRlci5wcm90b3R5cGUucm91dGVFZGdlcyA9IGZ1bmN0aW9uIChlZGdlcywgbnVkZ2VHYXAsIHNvdXJjZSwgdGFyZ2V0KSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB2YXIgcm91dGVQYXRocyA9IGVkZ2VzLm1hcChmdW5jdGlvbiAoZSkgeyByZXR1cm4gX3RoaXMucm91dGUoc291cmNlKGUpLCB0YXJnZXQoZSkpOyB9KTtcclxuICAgICAgICB2YXIgb3JkZXIgPSBHcmlkUm91dGVyLm9yZGVyRWRnZXMocm91dGVQYXRocyk7XHJcbiAgICAgICAgdmFyIHJvdXRlcyA9IHJvdXRlUGF0aHMubWFwKGZ1bmN0aW9uIChlKSB7IHJldHVybiBHcmlkUm91dGVyLm1ha2VTZWdtZW50cyhlKTsgfSk7XHJcbiAgICAgICAgR3JpZFJvdXRlci5udWRnZVNlZ21lbnRzKHJvdXRlcywgJ3gnLCAneScsIG9yZGVyLCBudWRnZUdhcCk7XHJcbiAgICAgICAgR3JpZFJvdXRlci5udWRnZVNlZ21lbnRzKHJvdXRlcywgJ3knLCAneCcsIG9yZGVyLCBudWRnZUdhcCk7XHJcbiAgICAgICAgR3JpZFJvdXRlci51bnJldmVyc2VFZGdlcyhyb3V0ZXMsIHJvdXRlUGF0aHMpO1xyXG4gICAgICAgIHJldHVybiByb3V0ZXM7XHJcbiAgICB9O1xyXG4gICAgR3JpZFJvdXRlci51bnJldmVyc2VFZGdlcyA9IGZ1bmN0aW9uIChyb3V0ZXMsIHJvdXRlUGF0aHMpIHtcclxuICAgICAgICByb3V0ZXMuZm9yRWFjaChmdW5jdGlvbiAoc2VnbWVudHMsIGkpIHtcclxuICAgICAgICAgICAgdmFyIHBhdGggPSByb3V0ZVBhdGhzW2ldO1xyXG4gICAgICAgICAgICBpZiAocGF0aC5yZXZlcnNlZCkge1xyXG4gICAgICAgICAgICAgICAgc2VnbWVudHMucmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICAgICAgc2VnbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoc2VnbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlZ21lbnQucmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBHcmlkUm91dGVyLmFuZ2xlQmV0d2VlbjJMaW5lcyA9IGZ1bmN0aW9uIChsaW5lMSwgbGluZTIpIHtcclxuICAgICAgICB2YXIgYW5nbGUxID0gTWF0aC5hdGFuMihsaW5lMVswXS55IC0gbGluZTFbMV0ueSwgbGluZTFbMF0ueCAtIGxpbmUxWzFdLngpO1xyXG4gICAgICAgIHZhciBhbmdsZTIgPSBNYXRoLmF0YW4yKGxpbmUyWzBdLnkgLSBsaW5lMlsxXS55LCBsaW5lMlswXS54IC0gbGluZTJbMV0ueCk7XHJcbiAgICAgICAgdmFyIGRpZmYgPSBhbmdsZTEgLSBhbmdsZTI7XHJcbiAgICAgICAgaWYgKGRpZmYgPiBNYXRoLlBJIHx8IGRpZmYgPCAtTWF0aC5QSSkge1xyXG4gICAgICAgICAgICBkaWZmID0gYW5nbGUyIC0gYW5nbGUxO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGlmZjtcclxuICAgIH07XHJcbiAgICBHcmlkUm91dGVyLmlzTGVmdCA9IGZ1bmN0aW9uIChhLCBiLCBjKSB7XHJcbiAgICAgICAgcmV0dXJuICgoYi54IC0gYS54KSAqIChjLnkgLSBhLnkpIC0gKGIueSAtIGEueSkgKiAoYy54IC0gYS54KSkgPD0gMDtcclxuICAgIH07XHJcbiAgICBHcmlkUm91dGVyLmdldE9yZGVyID0gZnVuY3Rpb24gKHBhaXJzKSB7XHJcbiAgICAgICAgdmFyIG91dGdvaW5nID0ge307XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYWlycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgcCA9IHBhaXJzW2ldO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIG91dGdvaW5nW3AubF0gPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICAgICAgICAgICAgb3V0Z29pbmdbcC5sXSA9IHt9O1xyXG4gICAgICAgICAgICBvdXRnb2luZ1twLmxdW3Aucl0gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGwsIHIpIHsgcmV0dXJuIHR5cGVvZiBvdXRnb2luZ1tsXSAhPT0gJ3VuZGVmaW5lZCcgJiYgb3V0Z29pbmdbbF1bcl07IH07XHJcbiAgICB9O1xyXG4gICAgR3JpZFJvdXRlci5vcmRlckVkZ2VzID0gZnVuY3Rpb24gKGVkZ2VzKSB7XHJcbiAgICAgICAgdmFyIGVkZ2VPcmRlciA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWRnZXMubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSBpICsgMTsgaiA8IGVkZ2VzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZSA9IGVkZ2VzW2ldLCBmID0gZWRnZXNbal0sIGxjcyA9IG5ldyBMb25nZXN0Q29tbW9uU3Vic2VxdWVuY2UoZSwgZik7XHJcbiAgICAgICAgICAgICAgICB2YXIgdSwgdmksIHZqO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxjcy5sZW5ndGggPT09IDApXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBpZiAobGNzLnJldmVyc2VkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZi5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZi5yZXZlcnNlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgbGNzID0gbmV3IExvbmdlc3RDb21tb25TdWJzZXF1ZW5jZShlLCBmKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICgobGNzLnNpIDw9IDAgfHwgbGNzLnRpIDw9IDApICYmXHJcbiAgICAgICAgICAgICAgICAgICAgKGxjcy5zaSArIGxjcy5sZW5ndGggPj0gZS5sZW5ndGggfHwgbGNzLnRpICsgbGNzLmxlbmd0aCA+PSBmLmxlbmd0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBlZGdlT3JkZXIucHVzaCh7IGw6IGksIHI6IGogfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAobGNzLnNpICsgbGNzLmxlbmd0aCA+PSBlLmxlbmd0aCB8fCBsY3MudGkgKyBsY3MubGVuZ3RoID49IGYubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdSA9IGVbbGNzLnNpICsgMV07XHJcbiAgICAgICAgICAgICAgICAgICAgdmogPSBlW2xjcy5zaSAtIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgIHZpID0gZltsY3MudGkgLSAxXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHUgPSBlW2xjcy5zaSArIGxjcy5sZW5ndGggLSAyXTtcclxuICAgICAgICAgICAgICAgICAgICB2aSA9IGVbbGNzLnNpICsgbGNzLmxlbmd0aF07XHJcbiAgICAgICAgICAgICAgICAgICAgdmogPSBmW2xjcy50aSArIGxjcy5sZW5ndGhdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKEdyaWRSb3V0ZXIuaXNMZWZ0KHUsIHZpLCB2aikpIHtcclxuICAgICAgICAgICAgICAgICAgICBlZGdlT3JkZXIucHVzaCh7IGw6IGosIHI6IGkgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBlZGdlT3JkZXIucHVzaCh7IGw6IGksIHI6IGogfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIEdyaWRSb3V0ZXIuZ2V0T3JkZXIoZWRnZU9yZGVyKTtcclxuICAgIH07XHJcbiAgICBHcmlkUm91dGVyLm1ha2VTZWdtZW50cyA9IGZ1bmN0aW9uIChwYXRoKSB7XHJcbiAgICAgICAgZnVuY3Rpb24gY29weVBvaW50KHApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHsgeDogcC54LCB5OiBwLnkgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGlzU3RyYWlnaHQgPSBmdW5jdGlvbiAoYSwgYiwgYykgeyByZXR1cm4gTWF0aC5hYnMoKGIueCAtIGEueCkgKiAoYy55IC0gYS55KSAtIChiLnkgLSBhLnkpICogKGMueCAtIGEueCkpIDwgMC4wMDE7IH07XHJcbiAgICAgICAgdmFyIHNlZ21lbnRzID0gW107XHJcbiAgICAgICAgdmFyIGEgPSBjb3B5UG9pbnQocGF0aFswXSk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBwYXRoLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBiID0gY29weVBvaW50KHBhdGhbaV0pLCBjID0gaSA8IHBhdGgubGVuZ3RoIC0gMSA/IHBhdGhbaSArIDFdIDogbnVsbDtcclxuICAgICAgICAgICAgaWYgKCFjIHx8ICFpc1N0cmFpZ2h0KGEsIGIsIGMpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWdtZW50cy5wdXNoKFthLCBiXSk7XHJcbiAgICAgICAgICAgICAgICBhID0gYjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc2VnbWVudHM7XHJcbiAgICB9O1xyXG4gICAgR3JpZFJvdXRlci5wcm90b3R5cGUucm91dGUgPSBmdW5jdGlvbiAocywgdCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdmFyIHNvdXJjZSA9IHRoaXMubm9kZXNbc10sIHRhcmdldCA9IHRoaXMubm9kZXNbdF07XHJcbiAgICAgICAgdGhpcy5vYnN0YWNsZXMgPSB0aGlzLnNpYmxpbmdPYnN0YWNsZXMoc291cmNlLCB0YXJnZXQpO1xyXG4gICAgICAgIHZhciBvYnN0YWNsZUxvb2t1cCA9IHt9O1xyXG4gICAgICAgIHRoaXMub2JzdGFjbGVzLmZvckVhY2goZnVuY3Rpb24gKG8pIHsgcmV0dXJuIG9ic3RhY2xlTG9va3VwW28uaWRdID0gbzsgfSk7XHJcbiAgICAgICAgdGhpcy5wYXNzYWJsZUVkZ2VzID0gdGhpcy5lZGdlcy5maWx0ZXIoZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyIHUgPSBfdGhpcy52ZXJ0c1tlLnNvdXJjZV0sIHYgPSBfdGhpcy52ZXJ0c1tlLnRhcmdldF07XHJcbiAgICAgICAgICAgIHJldHVybiAhKHUubm9kZSAmJiB1Lm5vZGUuaWQgaW4gb2JzdGFjbGVMb29rdXBcclxuICAgICAgICAgICAgICAgIHx8IHYubm9kZSAmJiB2Lm5vZGUuaWQgaW4gb2JzdGFjbGVMb29rdXApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgc291cmNlLnBvcnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciB1ID0gc291cmNlLnBvcnRzWzBdLmlkO1xyXG4gICAgICAgICAgICB2YXIgdiA9IHNvdXJjZS5wb3J0c1tpXS5pZDtcclxuICAgICAgICAgICAgdGhpcy5wYXNzYWJsZUVkZ2VzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgc291cmNlOiB1LFxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiB2LFxyXG4gICAgICAgICAgICAgICAgbGVuZ3RoOiAwXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IHRhcmdldC5wb3J0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgdSA9IHRhcmdldC5wb3J0c1swXS5pZDtcclxuICAgICAgICAgICAgdmFyIHYgPSB0YXJnZXQucG9ydHNbaV0uaWQ7XHJcbiAgICAgICAgICAgIHRoaXMucGFzc2FibGVFZGdlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIHNvdXJjZTogdSxcclxuICAgICAgICAgICAgICAgIHRhcmdldDogdixcclxuICAgICAgICAgICAgICAgIGxlbmd0aDogMFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGdldFNvdXJjZSA9IGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnNvdXJjZTsgfSwgZ2V0VGFyZ2V0ID0gZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUudGFyZ2V0OyB9LCBnZXRMZW5ndGggPSBmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS5sZW5ndGg7IH07XHJcbiAgICAgICAgdmFyIHNob3J0ZXN0UGF0aENhbGN1bGF0b3IgPSBuZXcgc2hvcnRlc3RwYXRoc18xLkNhbGN1bGF0b3IodGhpcy52ZXJ0cy5sZW5ndGgsIHRoaXMucGFzc2FibGVFZGdlcywgZ2V0U291cmNlLCBnZXRUYXJnZXQsIGdldExlbmd0aCk7XHJcbiAgICAgICAgdmFyIGJlbmRQZW5hbHR5ID0gZnVuY3Rpb24gKHUsIHYsIHcpIHtcclxuICAgICAgICAgICAgdmFyIGEgPSBfdGhpcy52ZXJ0c1t1XSwgYiA9IF90aGlzLnZlcnRzW3ZdLCBjID0gX3RoaXMudmVydHNbd107XHJcbiAgICAgICAgICAgIHZhciBkeCA9IE1hdGguYWJzKGMueCAtIGEueCksIGR5ID0gTWF0aC5hYnMoYy55IC0gYS55KTtcclxuICAgICAgICAgICAgaWYgKGEubm9kZSA9PT0gc291cmNlICYmIGEubm9kZSA9PT0gYi5ub2RlIHx8IGIubm9kZSA9PT0gdGFyZ2V0ICYmIGIubm9kZSA9PT0gYy5ub2RlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgIHJldHVybiBkeCA+IDEgJiYgZHkgPiAxID8gMTAwMCA6IDA7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgc2hvcnRlc3RQYXRoID0gc2hvcnRlc3RQYXRoQ2FsY3VsYXRvci5QYXRoRnJvbU5vZGVUb05vZGVXaXRoUHJldkNvc3Qoc291cmNlLnBvcnRzWzBdLmlkLCB0YXJnZXQucG9ydHNbMF0uaWQsIGJlbmRQZW5hbHR5KTtcclxuICAgICAgICB2YXIgcGF0aFBvaW50cyA9IHNob3J0ZXN0UGF0aC5yZXZlcnNlKCkubWFwKGZ1bmN0aW9uICh2aSkgeyByZXR1cm4gX3RoaXMudmVydHNbdmldOyB9KTtcclxuICAgICAgICBwYXRoUG9pbnRzLnB1c2godGhpcy5ub2Rlc1t0YXJnZXQuaWRdLnBvcnRzWzBdKTtcclxuICAgICAgICByZXR1cm4gcGF0aFBvaW50cy5maWx0ZXIoZnVuY3Rpb24gKHYsIGkpIHtcclxuICAgICAgICAgICAgcmV0dXJuICEoaSA8IHBhdGhQb2ludHMubGVuZ3RoIC0gMSAmJiBwYXRoUG9pbnRzW2kgKyAxXS5ub2RlID09PSBzb3VyY2UgJiYgdi5ub2RlID09PSBzb3VyY2VcclxuICAgICAgICAgICAgICAgIHx8IGkgPiAwICYmIHYubm9kZSA9PT0gdGFyZ2V0ICYmIHBhdGhQb2ludHNbaSAtIDFdLm5vZGUgPT09IHRhcmdldCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgR3JpZFJvdXRlci5nZXRSb3V0ZVBhdGggPSBmdW5jdGlvbiAocm91dGUsIGNvcm5lcnJhZGl1cywgYXJyb3d3aWR0aCwgYXJyb3doZWlnaHQpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0ge1xyXG4gICAgICAgICAgICByb3V0ZXBhdGg6ICdNICcgKyByb3V0ZVswXVswXS54ICsgJyAnICsgcm91dGVbMF1bMF0ueSArICcgJyxcclxuICAgICAgICAgICAgYXJyb3dwYXRoOiAnJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKHJvdXRlLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3V0ZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGxpID0gcm91dGVbaV07XHJcbiAgICAgICAgICAgICAgICB2YXIgeCA9IGxpWzFdLngsIHkgPSBsaVsxXS55O1xyXG4gICAgICAgICAgICAgICAgdmFyIGR4ID0geCAtIGxpWzBdLng7XHJcbiAgICAgICAgICAgICAgICB2YXIgZHkgPSB5IC0gbGlbMF0ueTtcclxuICAgICAgICAgICAgICAgIGlmIChpIDwgcm91dGUubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChNYXRoLmFicyhkeCkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHggLT0gZHggLyBNYXRoLmFicyhkeCkgKiBjb3JuZXJyYWRpdXM7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5IC09IGR5IC8gTWF0aC5hYnMoZHkpICogY29ybmVycmFkaXVzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucm91dGVwYXRoICs9ICdMICcgKyB4ICsgJyAnICsgeSArICcgJztcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbCA9IHJvdXRlW2kgKyAxXTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgeDAgPSBsWzBdLngsIHkwID0gbFswXS55O1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB4MSA9IGxbMV0ueDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgeTEgPSBsWzFdLnk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHggPSB4MSAtIHgwO1xyXG4gICAgICAgICAgICAgICAgICAgIGR5ID0geTEgLSB5MDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYW5nbGUgPSBHcmlkUm91dGVyLmFuZ2xlQmV0d2VlbjJMaW5lcyhsaSwgbCkgPCAwID8gMSA6IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHgyLCB5MjtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnMoZHgpID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4MiA9IHgwICsgZHggLyBNYXRoLmFicyhkeCkgKiBjb3JuZXJyYWRpdXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHkyID0geTA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4MiA9IHgwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5MiA9IHkwICsgZHkgLyBNYXRoLmFicyhkeSkgKiBjb3JuZXJyYWRpdXM7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjeCA9IE1hdGguYWJzKHgyIC0geCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN5ID0gTWF0aC5hYnMoeTIgLSB5KTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucm91dGVwYXRoICs9ICdBICcgKyBjeCArICcgJyArIGN5ICsgJyAwIDAgJyArIGFuZ2xlICsgJyAnICsgeDIgKyAnICcgKyB5MiArICcgJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBhcnJvd3RpcCA9IFt4LCB5XTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYXJyb3djb3JuZXIxLCBhcnJvd2Nvcm5lcjI7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKGR4KSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeCAtPSBkeCAvIE1hdGguYWJzKGR4KSAqIGFycm93aGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnJvd2Nvcm5lcjEgPSBbeCwgeSArIGFycm93d2lkdGhdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnJvd2Nvcm5lcjIgPSBbeCwgeSAtIGFycm93d2lkdGhdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeSAtPSBkeSAvIE1hdGguYWJzKGR5KSAqIGFycm93aGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnJvd2Nvcm5lcjEgPSBbeCArIGFycm93d2lkdGgsIHldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnJvd2Nvcm5lcjIgPSBbeCAtIGFycm93d2lkdGgsIHldO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucm91dGVwYXRoICs9ICdMICcgKyB4ICsgJyAnICsgeSArICcgJztcclxuICAgICAgICAgICAgICAgICAgICBpZiAoYXJyb3doZWlnaHQgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5hcnJvd3BhdGggPSAnTSAnICsgYXJyb3d0aXBbMF0gKyAnICcgKyBhcnJvd3RpcFsxXSArICcgTCAnICsgYXJyb3djb3JuZXIxWzBdICsgJyAnICsgYXJyb3djb3JuZXIxWzFdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICArICcgTCAnICsgYXJyb3djb3JuZXIyWzBdICsgJyAnICsgYXJyb3djb3JuZXIyWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIGxpID0gcm91dGVbMF07XHJcbiAgICAgICAgICAgIHZhciB4ID0gbGlbMV0ueCwgeSA9IGxpWzFdLnk7XHJcbiAgICAgICAgICAgIHZhciBkeCA9IHggLSBsaVswXS54O1xyXG4gICAgICAgICAgICB2YXIgZHkgPSB5IC0gbGlbMF0ueTtcclxuICAgICAgICAgICAgdmFyIGFycm93dGlwID0gW3gsIHldO1xyXG4gICAgICAgICAgICB2YXIgYXJyb3djb3JuZXIxLCBhcnJvd2Nvcm5lcjI7XHJcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhkeCkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB4IC09IGR4IC8gTWF0aC5hYnMoZHgpICogYXJyb3doZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICBhcnJvd2Nvcm5lcjEgPSBbeCwgeSArIGFycm93d2lkdGhdO1xyXG4gICAgICAgICAgICAgICAgYXJyb3djb3JuZXIyID0gW3gsIHkgLSBhcnJvd3dpZHRoXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHkgLT0gZHkgLyBNYXRoLmFicyhkeSkgKiBhcnJvd2hlaWdodDtcclxuICAgICAgICAgICAgICAgIGFycm93Y29ybmVyMSA9IFt4ICsgYXJyb3d3aWR0aCwgeV07XHJcbiAgICAgICAgICAgICAgICBhcnJvd2Nvcm5lcjIgPSBbeCAtIGFycm93d2lkdGgsIHldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3VsdC5yb3V0ZXBhdGggKz0gJ0wgJyArIHggKyAnICcgKyB5ICsgJyAnO1xyXG4gICAgICAgICAgICBpZiAoYXJyb3doZWlnaHQgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQuYXJyb3dwYXRoID0gJ00gJyArIGFycm93dGlwWzBdICsgJyAnICsgYXJyb3d0aXBbMV0gKyAnIEwgJyArIGFycm93Y29ybmVyMVswXSArICcgJyArIGFycm93Y29ybmVyMVsxXVxyXG4gICAgICAgICAgICAgICAgICAgICsgJyBMICcgKyBhcnJvd2Nvcm5lcjJbMF0gKyAnICcgKyBhcnJvd2Nvcm5lcjJbMV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICByZXR1cm4gR3JpZFJvdXRlcjtcclxufSgpKTtcclxuZXhwb3J0cy5HcmlkUm91dGVyID0gR3JpZFJvdXRlcjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z3JpZHJvdXRlci5qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vd2ViY29sYS9kaXN0L3NyYy9ncmlkcm91dGVyLmpzXG4vLyBtb2R1bGUgaWQgPSA5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBwYWNraW5nT3B0aW9ucyA9IHtcclxuICAgIFBBRERJTkc6IDEwLFxyXG4gICAgR09MREVOX1NFQ1RJT046ICgxICsgTWF0aC5zcXJ0KDUpKSAvIDIsXHJcbiAgICBGTE9BVF9FUFNJTE9OOiAwLjAwMDEsXHJcbiAgICBNQVhfSU5FUkFUSU9OUzogMTAwXHJcbn07XHJcbmZ1bmN0aW9uIGFwcGx5UGFja2luZyhncmFwaHMsIHcsIGgsIG5vZGVfc2l6ZSwgZGVzaXJlZF9yYXRpbykge1xyXG4gICAgaWYgKGRlc2lyZWRfcmF0aW8gPT09IHZvaWQgMCkgeyBkZXNpcmVkX3JhdGlvID0gMTsgfVxyXG4gICAgdmFyIGluaXRfeCA9IDAsIGluaXRfeSA9IDAsIHN2Z193aWR0aCA9IHcsIHN2Z19oZWlnaHQgPSBoLCBkZXNpcmVkX3JhdGlvID0gdHlwZW9mIGRlc2lyZWRfcmF0aW8gIT09ICd1bmRlZmluZWQnID8gZGVzaXJlZF9yYXRpbyA6IDEsIG5vZGVfc2l6ZSA9IHR5cGVvZiBub2RlX3NpemUgIT09ICd1bmRlZmluZWQnID8gbm9kZV9zaXplIDogMCwgcmVhbF93aWR0aCA9IDAsIHJlYWxfaGVpZ2h0ID0gMCwgbWluX3dpZHRoID0gMCwgZ2xvYmFsX2JvdHRvbSA9IDAsIGxpbmUgPSBbXTtcclxuICAgIGlmIChncmFwaHMubGVuZ3RoID09IDApXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgY2FsY3VsYXRlX2JiKGdyYXBocyk7XHJcbiAgICBhcHBseShncmFwaHMsIGRlc2lyZWRfcmF0aW8pO1xyXG4gICAgcHV0X25vZGVzX3RvX3JpZ2h0X3Bvc2l0aW9ucyhncmFwaHMpO1xyXG4gICAgZnVuY3Rpb24gY2FsY3VsYXRlX2JiKGdyYXBocykge1xyXG4gICAgICAgIGdyYXBocy5mb3JFYWNoKGZ1bmN0aW9uIChnKSB7XHJcbiAgICAgICAgICAgIGNhbGN1bGF0ZV9zaW5nbGVfYmIoZyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZnVuY3Rpb24gY2FsY3VsYXRlX3NpbmdsZV9iYihncmFwaCkge1xyXG4gICAgICAgICAgICB2YXIgbWluX3ggPSBOdW1iZXIuTUFYX1ZBTFVFLCBtaW5feSA9IE51bWJlci5NQVhfVkFMVUUsIG1heF94ID0gMCwgbWF4X3kgPSAwO1xyXG4gICAgICAgICAgICBncmFwaC5hcnJheS5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdyA9IHR5cGVvZiB2LndpZHRoICE9PSAndW5kZWZpbmVkJyA/IHYud2lkdGggOiBub2RlX3NpemU7XHJcbiAgICAgICAgICAgICAgICB2YXIgaCA9IHR5cGVvZiB2LmhlaWdodCAhPT0gJ3VuZGVmaW5lZCcgPyB2LmhlaWdodCA6IG5vZGVfc2l6ZTtcclxuICAgICAgICAgICAgICAgIHcgLz0gMjtcclxuICAgICAgICAgICAgICAgIGggLz0gMjtcclxuICAgICAgICAgICAgICAgIG1heF94ID0gTWF0aC5tYXgodi54ICsgdywgbWF4X3gpO1xyXG4gICAgICAgICAgICAgICAgbWluX3ggPSBNYXRoLm1pbih2LnggLSB3LCBtaW5feCk7XHJcbiAgICAgICAgICAgICAgICBtYXhfeSA9IE1hdGgubWF4KHYueSArIGgsIG1heF95KTtcclxuICAgICAgICAgICAgICAgIG1pbl95ID0gTWF0aC5taW4odi55IC0gaCwgbWluX3kpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZ3JhcGgud2lkdGggPSBtYXhfeCAtIG1pbl94O1xyXG4gICAgICAgICAgICBncmFwaC5oZWlnaHQgPSBtYXhfeSAtIG1pbl95O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHB1dF9ub2Rlc190b19yaWdodF9wb3NpdGlvbnMoZ3JhcGhzKSB7XHJcbiAgICAgICAgZ3JhcGhzLmZvckVhY2goZnVuY3Rpb24gKGcpIHtcclxuICAgICAgICAgICAgdmFyIGNlbnRlciA9IHsgeDogMCwgeTogMCB9O1xyXG4gICAgICAgICAgICBnLmFycmF5LmZvckVhY2goZnVuY3Rpb24gKG5vZGUpIHtcclxuICAgICAgICAgICAgICAgIGNlbnRlci54ICs9IG5vZGUueDtcclxuICAgICAgICAgICAgICAgIGNlbnRlci55ICs9IG5vZGUueTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNlbnRlci54IC89IGcuYXJyYXkubGVuZ3RoO1xyXG4gICAgICAgICAgICBjZW50ZXIueSAvPSBnLmFycmF5Lmxlbmd0aDtcclxuICAgICAgICAgICAgdmFyIGNvcm5lciA9IHsgeDogY2VudGVyLnggLSBnLndpZHRoIC8gMiwgeTogY2VudGVyLnkgLSBnLmhlaWdodCAvIDIgfTtcclxuICAgICAgICAgICAgdmFyIG9mZnNldCA9IHsgeDogZy54IC0gY29ybmVyLnggKyBzdmdfd2lkdGggLyAyIC0gcmVhbF93aWR0aCAvIDIsIHk6IGcueSAtIGNvcm5lci55ICsgc3ZnX2hlaWdodCAvIDIgLSByZWFsX2hlaWdodCAvIDIgfTtcclxuICAgICAgICAgICAgZy5hcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlLnggKz0gb2Zmc2V0Lng7XHJcbiAgICAgICAgICAgICAgICBub2RlLnkgKz0gb2Zmc2V0Lnk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gYXBwbHkoZGF0YSwgZGVzaXJlZF9yYXRpbykge1xyXG4gICAgICAgIHZhciBjdXJyX2Jlc3RfZiA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuICAgICAgICB2YXIgY3Vycl9iZXN0ID0gMDtcclxuICAgICAgICBkYXRhLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIGIuaGVpZ2h0IC0gYS5oZWlnaHQ7IH0pO1xyXG4gICAgICAgIG1pbl93aWR0aCA9IGRhdGEucmVkdWNlKGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhLndpZHRoIDwgYi53aWR0aCA/IGEud2lkdGggOiBiLndpZHRoO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZhciBsZWZ0ID0geDEgPSBtaW5fd2lkdGg7XHJcbiAgICAgICAgdmFyIHJpZ2h0ID0geDIgPSBnZXRfZW50aXJlX3dpZHRoKGRhdGEpO1xyXG4gICAgICAgIHZhciBpdGVyYXRpb25Db3VudGVyID0gMDtcclxuICAgICAgICB2YXIgZl94MSA9IE51bWJlci5NQVhfVkFMVUU7XHJcbiAgICAgICAgdmFyIGZfeDIgPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgICAgIHZhciBmbGFnID0gLTE7XHJcbiAgICAgICAgdmFyIGR4ID0gTnVtYmVyLk1BWF9WQUxVRTtcclxuICAgICAgICB2YXIgZGYgPSBOdW1iZXIuTUFYX1ZBTFVFO1xyXG4gICAgICAgIHdoaWxlICgoZHggPiBtaW5fd2lkdGgpIHx8IGRmID4gcGFja2luZ09wdGlvbnMuRkxPQVRfRVBTSUxPTikge1xyXG4gICAgICAgICAgICBpZiAoZmxhZyAhPSAxKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgeDEgPSByaWdodCAtIChyaWdodCAtIGxlZnQpIC8gcGFja2luZ09wdGlvbnMuR09MREVOX1NFQ1RJT047XHJcbiAgICAgICAgICAgICAgICB2YXIgZl94MSA9IHN0ZXAoZGF0YSwgeDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChmbGFnICE9IDApIHtcclxuICAgICAgICAgICAgICAgIHZhciB4MiA9IGxlZnQgKyAocmlnaHQgLSBsZWZ0KSAvIHBhY2tpbmdPcHRpb25zLkdPTERFTl9TRUNUSU9OO1xyXG4gICAgICAgICAgICAgICAgdmFyIGZfeDIgPSBzdGVwKGRhdGEsIHgyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkeCA9IE1hdGguYWJzKHgxIC0geDIpO1xyXG4gICAgICAgICAgICBkZiA9IE1hdGguYWJzKGZfeDEgLSBmX3gyKTtcclxuICAgICAgICAgICAgaWYgKGZfeDEgPCBjdXJyX2Jlc3RfZikge1xyXG4gICAgICAgICAgICAgICAgY3Vycl9iZXN0X2YgPSBmX3gxO1xyXG4gICAgICAgICAgICAgICAgY3Vycl9iZXN0ID0geDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGZfeDIgPCBjdXJyX2Jlc3RfZikge1xyXG4gICAgICAgICAgICAgICAgY3Vycl9iZXN0X2YgPSBmX3gyO1xyXG4gICAgICAgICAgICAgICAgY3Vycl9iZXN0ID0geDI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGZfeDEgPiBmX3gyKSB7XHJcbiAgICAgICAgICAgICAgICBsZWZ0ID0geDE7XHJcbiAgICAgICAgICAgICAgICB4MSA9IHgyO1xyXG4gICAgICAgICAgICAgICAgZl94MSA9IGZfeDI7XHJcbiAgICAgICAgICAgICAgICBmbGFnID0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJpZ2h0ID0geDI7XHJcbiAgICAgICAgICAgICAgICB4MiA9IHgxO1xyXG4gICAgICAgICAgICAgICAgZl94MiA9IGZfeDE7XHJcbiAgICAgICAgICAgICAgICBmbGFnID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaXRlcmF0aW9uQ291bnRlcisrID4gMTAwKSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBzdGVwKGRhdGEsIGN1cnJfYmVzdCk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKGRhdGEsIG1heF93aWR0aCkge1xyXG4gICAgICAgIGxpbmUgPSBbXTtcclxuICAgICAgICByZWFsX3dpZHRoID0gMDtcclxuICAgICAgICByZWFsX2hlaWdodCA9IDA7XHJcbiAgICAgICAgZ2xvYmFsX2JvdHRvbSA9IGluaXRfeTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIG8gPSBkYXRhW2ldO1xyXG4gICAgICAgICAgICBwdXRfcmVjdChvLCBtYXhfd2lkdGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gTWF0aC5hYnMoZ2V0X3JlYWxfcmF0aW8oKSAtIGRlc2lyZWRfcmF0aW8pO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcHV0X3JlY3QocmVjdCwgbWF4X3dpZHRoKSB7XHJcbiAgICAgICAgdmFyIHBhcmVudCA9IHVuZGVmaW5lZDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKChsaW5lW2ldLnNwYWNlX2xlZnQgPj0gcmVjdC5oZWlnaHQpICYmIChsaW5lW2ldLnggKyBsaW5lW2ldLndpZHRoICsgcmVjdC53aWR0aCArIHBhY2tpbmdPcHRpb25zLlBBRERJTkcgLSBtYXhfd2lkdGgpIDw9IHBhY2tpbmdPcHRpb25zLkZMT0FUX0VQU0lMT04pIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudCA9IGxpbmVbaV07XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBsaW5lLnB1c2gocmVjdCk7XHJcbiAgICAgICAgaWYgKHBhcmVudCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHJlY3QueCA9IHBhcmVudC54ICsgcGFyZW50LndpZHRoICsgcGFja2luZ09wdGlvbnMuUEFERElORztcclxuICAgICAgICAgICAgcmVjdC55ID0gcGFyZW50LmJvdHRvbTtcclxuICAgICAgICAgICAgcmVjdC5zcGFjZV9sZWZ0ID0gcmVjdC5oZWlnaHQ7XHJcbiAgICAgICAgICAgIHJlY3QuYm90dG9tID0gcmVjdC55O1xyXG4gICAgICAgICAgICBwYXJlbnQuc3BhY2VfbGVmdCAtPSByZWN0LmhlaWdodCArIHBhY2tpbmdPcHRpb25zLlBBRERJTkc7XHJcbiAgICAgICAgICAgIHBhcmVudC5ib3R0b20gKz0gcmVjdC5oZWlnaHQgKyBwYWNraW5nT3B0aW9ucy5QQURESU5HO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmVjdC55ID0gZ2xvYmFsX2JvdHRvbTtcclxuICAgICAgICAgICAgZ2xvYmFsX2JvdHRvbSArPSByZWN0LmhlaWdodCArIHBhY2tpbmdPcHRpb25zLlBBRERJTkc7XHJcbiAgICAgICAgICAgIHJlY3QueCA9IGluaXRfeDtcclxuICAgICAgICAgICAgcmVjdC5ib3R0b20gPSByZWN0Lnk7XHJcbiAgICAgICAgICAgIHJlY3Quc3BhY2VfbGVmdCA9IHJlY3QuaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVjdC55ICsgcmVjdC5oZWlnaHQgLSByZWFsX2hlaWdodCA+IC1wYWNraW5nT3B0aW9ucy5GTE9BVF9FUFNJTE9OKVxyXG4gICAgICAgICAgICByZWFsX2hlaWdodCA9IHJlY3QueSArIHJlY3QuaGVpZ2h0IC0gaW5pdF95O1xyXG4gICAgICAgIGlmIChyZWN0LnggKyByZWN0LndpZHRoIC0gcmVhbF93aWR0aCA+IC1wYWNraW5nT3B0aW9ucy5GTE9BVF9FUFNJTE9OKVxyXG4gICAgICAgICAgICByZWFsX3dpZHRoID0gcmVjdC54ICsgcmVjdC53aWR0aCAtIGluaXRfeDtcclxuICAgIH1cclxuICAgIDtcclxuICAgIGZ1bmN0aW9uIGdldF9lbnRpcmVfd2lkdGgoZGF0YSkge1xyXG4gICAgICAgIHZhciB3aWR0aCA9IDA7XHJcbiAgICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChkKSB7IHJldHVybiB3aWR0aCArPSBkLndpZHRoICsgcGFja2luZ09wdGlvbnMuUEFERElORzsgfSk7XHJcbiAgICAgICAgcmV0dXJuIHdpZHRoO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gZ2V0X3JlYWxfcmF0aW8oKSB7XHJcbiAgICAgICAgcmV0dXJuIChyZWFsX3dpZHRoIC8gcmVhbF9oZWlnaHQpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuYXBwbHlQYWNraW5nID0gYXBwbHlQYWNraW5nO1xyXG5mdW5jdGlvbiBzZXBhcmF0ZUdyYXBocyhub2RlcywgbGlua3MpIHtcclxuICAgIHZhciBtYXJrcyA9IHt9O1xyXG4gICAgdmFyIHdheXMgPSB7fTtcclxuICAgIHZhciBncmFwaHMgPSBbXTtcclxuICAgIHZhciBjbHVzdGVycyA9IDA7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmtzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGxpbmsgPSBsaW5rc1tpXTtcclxuICAgICAgICB2YXIgbjEgPSBsaW5rLnNvdXJjZTtcclxuICAgICAgICB2YXIgbjIgPSBsaW5rLnRhcmdldDtcclxuICAgICAgICBpZiAod2F5c1tuMS5pbmRleF0pXHJcbiAgICAgICAgICAgIHdheXNbbjEuaW5kZXhdLnB1c2gobjIpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgd2F5c1tuMS5pbmRleF0gPSBbbjJdO1xyXG4gICAgICAgIGlmICh3YXlzW24yLmluZGV4XSlcclxuICAgICAgICAgICAgd2F5c1tuMi5pbmRleF0ucHVzaChuMSk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB3YXlzW24yLmluZGV4XSA9IFtuMV07XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5vZGUgPSBub2Rlc1tpXTtcclxuICAgICAgICBpZiAobWFya3Nbbm9kZS5pbmRleF0pXHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIGV4cGxvcmVfbm9kZShub2RlLCB0cnVlKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGV4cGxvcmVfbm9kZShuLCBpc19uZXcpIHtcclxuICAgICAgICBpZiAobWFya3Nbbi5pbmRleF0gIT09IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGlmIChpc19uZXcpIHtcclxuICAgICAgICAgICAgY2x1c3RlcnMrKztcclxuICAgICAgICAgICAgZ3JhcGhzLnB1c2goeyBhcnJheTogW10gfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1hcmtzW24uaW5kZXhdID0gY2x1c3RlcnM7XHJcbiAgICAgICAgZ3JhcGhzW2NsdXN0ZXJzIC0gMV0uYXJyYXkucHVzaChuKTtcclxuICAgICAgICB2YXIgYWRqYWNlbnQgPSB3YXlzW24uaW5kZXhdO1xyXG4gICAgICAgIGlmICghYWRqYWNlbnQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGFkamFjZW50Lmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGV4cGxvcmVfbm9kZShhZGphY2VudFtqXSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBncmFwaHM7XHJcbn1cclxuZXhwb3J0cy5zZXBhcmF0ZUdyYXBocyA9IHNlcGFyYXRlR3JhcGhzO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1oYW5kbGVkaXNjb25uZWN0ZWQuanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3dlYmNvbGEvZGlzdC9zcmMvaGFuZGxlZGlzY29ubmVjdGVkLmpzXG4vLyBtb2R1bGUgaWQgPSAxMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgUG93ZXJFZGdlID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFBvd2VyRWRnZShzb3VyY2UsIHRhcmdldCwgdHlwZSkge1xyXG4gICAgICAgIHRoaXMuc291cmNlID0gc291cmNlO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xyXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gUG93ZXJFZGdlO1xyXG59KCkpO1xyXG5leHBvcnRzLlBvd2VyRWRnZSA9IFBvd2VyRWRnZTtcclxudmFyIENvbmZpZ3VyYXRpb24gPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gQ29uZmlndXJhdGlvbihuLCBlZGdlcywgbGlua0FjY2Vzc29yLCByb290R3JvdXApIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMubGlua0FjY2Vzc29yID0gbGlua0FjY2Vzc29yO1xyXG4gICAgICAgIHRoaXMubW9kdWxlcyA9IG5ldyBBcnJheShuKTtcclxuICAgICAgICB0aGlzLnJvb3RzID0gW107XHJcbiAgICAgICAgaWYgKHJvb3RHcm91cCkge1xyXG4gICAgICAgICAgICB0aGlzLmluaXRNb2R1bGVzRnJvbUdyb3VwKHJvb3RHcm91cCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnJvb3RzLnB1c2gobmV3IE1vZHVsZVNldCgpKTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyArK2kpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJvb3RzWzBdLmFkZCh0aGlzLm1vZHVsZXNbaV0gPSBuZXcgTW9kdWxlKGkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5SID0gZWRnZXMubGVuZ3RoO1xyXG4gICAgICAgIGVkZ2VzLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgdmFyIHMgPSBfdGhpcy5tb2R1bGVzW2xpbmtBY2Nlc3Nvci5nZXRTb3VyY2VJbmRleChlKV0sIHQgPSBfdGhpcy5tb2R1bGVzW2xpbmtBY2Nlc3Nvci5nZXRUYXJnZXRJbmRleChlKV0sIHR5cGUgPSBsaW5rQWNjZXNzb3IuZ2V0VHlwZShlKTtcclxuICAgICAgICAgICAgcy5vdXRnb2luZy5hZGQodHlwZSwgdCk7XHJcbiAgICAgICAgICAgIHQuaW5jb21pbmcuYWRkKHR5cGUsIHMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgQ29uZmlndXJhdGlvbi5wcm90b3R5cGUuaW5pdE1vZHVsZXNGcm9tR3JvdXAgPSBmdW5jdGlvbiAoZ3JvdXApIHtcclxuICAgICAgICB2YXIgbW9kdWxlU2V0ID0gbmV3IE1vZHVsZVNldCgpO1xyXG4gICAgICAgIHRoaXMucm9vdHMucHVzaChtb2R1bGVTZXQpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ3JvdXAubGVhdmVzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBub2RlID0gZ3JvdXAubGVhdmVzW2ldO1xyXG4gICAgICAgICAgICB2YXIgbW9kdWxlID0gbmV3IE1vZHVsZShub2RlLmlkKTtcclxuICAgICAgICAgICAgdGhpcy5tb2R1bGVzW25vZGUuaWRdID0gbW9kdWxlO1xyXG4gICAgICAgICAgICBtb2R1bGVTZXQuYWRkKG1vZHVsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChncm91cC5ncm91cHMpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBncm91cC5ncm91cHMubGVuZ3RoOyArK2opIHtcclxuICAgICAgICAgICAgICAgIHZhciBjaGlsZCA9IGdyb3VwLmdyb3Vwc1tqXTtcclxuICAgICAgICAgICAgICAgIHZhciBkZWZpbml0aW9uID0ge307XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwcm9wIGluIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wICE9PSBcImxlYXZlc1wiICYmIHByb3AgIT09IFwiZ3JvdXBzXCIgJiYgY2hpbGQuaGFzT3duUHJvcGVydHkocHJvcCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmluaXRpb25bcHJvcF0gPSBjaGlsZFtwcm9wXTtcclxuICAgICAgICAgICAgICAgIG1vZHVsZVNldC5hZGQobmV3IE1vZHVsZSgtMSAtIGosIG5ldyBMaW5rU2V0cygpLCBuZXcgTGlua1NldHMoKSwgdGhpcy5pbml0TW9kdWxlc0Zyb21Hcm91cChjaGlsZCksIGRlZmluaXRpb24pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbW9kdWxlU2V0O1xyXG4gICAgfTtcclxuICAgIENvbmZpZ3VyYXRpb24ucHJvdG90eXBlLm1lcmdlID0gZnVuY3Rpb24gKGEsIGIsIGspIHtcclxuICAgICAgICBpZiAoayA9PT0gdm9pZCAwKSB7IGsgPSAwOyB9XHJcbiAgICAgICAgdmFyIGluSW50ID0gYS5pbmNvbWluZy5pbnRlcnNlY3Rpb24oYi5pbmNvbWluZyksIG91dEludCA9IGEub3V0Z29pbmcuaW50ZXJzZWN0aW9uKGIub3V0Z29pbmcpO1xyXG4gICAgICAgIHZhciBjaGlsZHJlbiA9IG5ldyBNb2R1bGVTZXQoKTtcclxuICAgICAgICBjaGlsZHJlbi5hZGQoYSk7XHJcbiAgICAgICAgY2hpbGRyZW4uYWRkKGIpO1xyXG4gICAgICAgIHZhciBtID0gbmV3IE1vZHVsZSh0aGlzLm1vZHVsZXMubGVuZ3RoLCBvdXRJbnQsIGluSW50LCBjaGlsZHJlbik7XHJcbiAgICAgICAgdGhpcy5tb2R1bGVzLnB1c2gobSk7XHJcbiAgICAgICAgdmFyIHVwZGF0ZSA9IGZ1bmN0aW9uIChzLCBpLCBvKSB7XHJcbiAgICAgICAgICAgIHMuZm9yQWxsKGZ1bmN0aW9uIChtcywgbGlua3R5cGUpIHtcclxuICAgICAgICAgICAgICAgIG1zLmZvckFsbChmdW5jdGlvbiAobikge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBubHMgPSBuW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIG5scy5hZGQobGlua3R5cGUsIG0pO1xyXG4gICAgICAgICAgICAgICAgICAgIG5scy5yZW1vdmUobGlua3R5cGUsIGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5scy5yZW1vdmUobGlua3R5cGUsIGIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFbb10ucmVtb3ZlKGxpbmt0eXBlLCBuKTtcclxuICAgICAgICAgICAgICAgICAgICBiW29dLnJlbW92ZShsaW5rdHlwZSwgbik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB1cGRhdGUob3V0SW50LCBcImluY29taW5nXCIsIFwib3V0Z29pbmdcIik7XHJcbiAgICAgICAgdXBkYXRlKGluSW50LCBcIm91dGdvaW5nXCIsIFwiaW5jb21pbmdcIik7XHJcbiAgICAgICAgdGhpcy5SIC09IGluSW50LmNvdW50KCkgKyBvdXRJbnQuY291bnQoKTtcclxuICAgICAgICB0aGlzLnJvb3RzW2tdLnJlbW92ZShhKTtcclxuICAgICAgICB0aGlzLnJvb3RzW2tdLnJlbW92ZShiKTtcclxuICAgICAgICB0aGlzLnJvb3RzW2tdLmFkZChtKTtcclxuICAgICAgICByZXR1cm4gbTtcclxuICAgIH07XHJcbiAgICBDb25maWd1cmF0aW9uLnByb3RvdHlwZS5yb290TWVyZ2VzID0gZnVuY3Rpb24gKGspIHtcclxuICAgICAgICBpZiAoayA9PT0gdm9pZCAwKSB7IGsgPSAwOyB9XHJcbiAgICAgICAgdmFyIHJzID0gdGhpcy5yb290c1trXS5tb2R1bGVzKCk7XHJcbiAgICAgICAgdmFyIG4gPSBycy5sZW5ndGg7XHJcbiAgICAgICAgdmFyIG1lcmdlcyA9IG5ldyBBcnJheShuICogKG4gLSAxKSk7XHJcbiAgICAgICAgdmFyIGN0ciA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlfID0gbiAtIDE7IGkgPCBpXzsgKytpKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSBpICsgMTsgaiA8IG47ICsraikge1xyXG4gICAgICAgICAgICAgICAgdmFyIGEgPSByc1tpXSwgYiA9IHJzW2pdO1xyXG4gICAgICAgICAgICAgICAgbWVyZ2VzW2N0cl0gPSB7IGlkOiBjdHIsIG5FZGdlczogdGhpcy5uRWRnZXMoYSwgYiksIGE6IGEsIGI6IGIgfTtcclxuICAgICAgICAgICAgICAgIGN0cisrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBtZXJnZXM7XHJcbiAgICB9O1xyXG4gICAgQ29uZmlndXJhdGlvbi5wcm90b3R5cGUuZ3JlZWR5TWVyZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnJvb3RzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJvb3RzW2ldLm1vZHVsZXMoKS5sZW5ndGggPCAyKVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIHZhciBtcyA9IHRoaXMucm9vdE1lcmdlcyhpKS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhLm5FZGdlcyA9PSBiLm5FZGdlcyA/IGEuaWQgLSBiLmlkIDogYS5uRWRnZXMgLSBiLm5FZGdlczsgfSk7XHJcbiAgICAgICAgICAgIHZhciBtID0gbXNbMF07XHJcbiAgICAgICAgICAgIGlmIChtLm5FZGdlcyA+PSB0aGlzLlIpXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgdGhpcy5tZXJnZShtLmEsIG0uYiwgaSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBDb25maWd1cmF0aW9uLnByb3RvdHlwZS5uRWRnZXMgPSBmdW5jdGlvbiAoYSwgYikge1xyXG4gICAgICAgIHZhciBpbkludCA9IGEuaW5jb21pbmcuaW50ZXJzZWN0aW9uKGIuaW5jb21pbmcpLCBvdXRJbnQgPSBhLm91dGdvaW5nLmludGVyc2VjdGlvbihiLm91dGdvaW5nKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5SIC0gaW5JbnQuY291bnQoKSAtIG91dEludC5jb3VudCgpO1xyXG4gICAgfTtcclxuICAgIENvbmZpZ3VyYXRpb24ucHJvdG90eXBlLmdldEdyb3VwSGllcmFyY2h5ID0gZnVuY3Rpb24gKHJldGFyZ2V0ZWRFZGdlcykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGdyb3VwcyA9IFtdO1xyXG4gICAgICAgIHZhciByb290ID0ge307XHJcbiAgICAgICAgdG9Hcm91cHModGhpcy5yb290c1swXSwgcm9vdCwgZ3JvdXBzKTtcclxuICAgICAgICB2YXIgZXMgPSB0aGlzLmFsbEVkZ2VzKCk7XHJcbiAgICAgICAgZXMuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICB2YXIgYSA9IF90aGlzLm1vZHVsZXNbZS5zb3VyY2VdO1xyXG4gICAgICAgICAgICB2YXIgYiA9IF90aGlzLm1vZHVsZXNbZS50YXJnZXRdO1xyXG4gICAgICAgICAgICByZXRhcmdldGVkRWRnZXMucHVzaChuZXcgUG93ZXJFZGdlKHR5cGVvZiBhLmdpZCA9PT0gXCJ1bmRlZmluZWRcIiA/IGUuc291cmNlIDogZ3JvdXBzW2EuZ2lkXSwgdHlwZW9mIGIuZ2lkID09PSBcInVuZGVmaW5lZFwiID8gZS50YXJnZXQgOiBncm91cHNbYi5naWRdLCBlLnR5cGUpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZ3JvdXBzO1xyXG4gICAgfTtcclxuICAgIENvbmZpZ3VyYXRpb24ucHJvdG90eXBlLmFsbEVkZ2VzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBlcyA9IFtdO1xyXG4gICAgICAgIENvbmZpZ3VyYXRpb24uZ2V0RWRnZXModGhpcy5yb290c1swXSwgZXMpO1xyXG4gICAgICAgIHJldHVybiBlcztcclxuICAgIH07XHJcbiAgICBDb25maWd1cmF0aW9uLmdldEVkZ2VzID0gZnVuY3Rpb24gKG1vZHVsZXMsIGVzKSB7XHJcbiAgICAgICAgbW9kdWxlcy5mb3JBbGwoZnVuY3Rpb24gKG0pIHtcclxuICAgICAgICAgICAgbS5nZXRFZGdlcyhlcyk7XHJcbiAgICAgICAgICAgIENvbmZpZ3VyYXRpb24uZ2V0RWRnZXMobS5jaGlsZHJlbiwgZXMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBDb25maWd1cmF0aW9uO1xyXG59KCkpO1xyXG5leHBvcnRzLkNvbmZpZ3VyYXRpb24gPSBDb25maWd1cmF0aW9uO1xyXG5mdW5jdGlvbiB0b0dyb3Vwcyhtb2R1bGVzLCBncm91cCwgZ3JvdXBzKSB7XHJcbiAgICBtb2R1bGVzLmZvckFsbChmdW5jdGlvbiAobSkge1xyXG4gICAgICAgIGlmIChtLmlzTGVhZigpKSB7XHJcbiAgICAgICAgICAgIGlmICghZ3JvdXAubGVhdmVzKVxyXG4gICAgICAgICAgICAgICAgZ3JvdXAubGVhdmVzID0gW107XHJcbiAgICAgICAgICAgIGdyb3VwLmxlYXZlcy5wdXNoKG0uaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIGcgPSBncm91cDtcclxuICAgICAgICAgICAgbS5naWQgPSBncm91cHMubGVuZ3RoO1xyXG4gICAgICAgICAgICBpZiAoIW0uaXNJc2xhbmQoKSB8fCBtLmlzUHJlZGVmaW5lZCgpKSB7XHJcbiAgICAgICAgICAgICAgICBnID0geyBpZDogbS5naWQgfTtcclxuICAgICAgICAgICAgICAgIGlmIChtLmlzUHJlZGVmaW5lZCgpKVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gbS5kZWZpbml0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnW3Byb3BdID0gbS5kZWZpbml0aW9uW3Byb3BdO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFncm91cC5ncm91cHMpXHJcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXAuZ3JvdXBzID0gW107XHJcbiAgICAgICAgICAgICAgICBncm91cC5ncm91cHMucHVzaChtLmdpZCk7XHJcbiAgICAgICAgICAgICAgICBncm91cHMucHVzaChnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0b0dyb3VwcyhtLmNoaWxkcmVuLCBnLCBncm91cHMpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcbnZhciBNb2R1bGUgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTW9kdWxlKGlkLCBvdXRnb2luZywgaW5jb21pbmcsIGNoaWxkcmVuLCBkZWZpbml0aW9uKSB7XHJcbiAgICAgICAgaWYgKG91dGdvaW5nID09PSB2b2lkIDApIHsgb3V0Z29pbmcgPSBuZXcgTGlua1NldHMoKTsgfVxyXG4gICAgICAgIGlmIChpbmNvbWluZyA9PT0gdm9pZCAwKSB7IGluY29taW5nID0gbmV3IExpbmtTZXRzKCk7IH1cclxuICAgICAgICBpZiAoY2hpbGRyZW4gPT09IHZvaWQgMCkgeyBjaGlsZHJlbiA9IG5ldyBNb2R1bGVTZXQoKTsgfVxyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgICAgICB0aGlzLm91dGdvaW5nID0gb3V0Z29pbmc7XHJcbiAgICAgICAgdGhpcy5pbmNvbWluZyA9IGluY29taW5nO1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcclxuICAgICAgICB0aGlzLmRlZmluaXRpb24gPSBkZWZpbml0aW9uO1xyXG4gICAgfVxyXG4gICAgTW9kdWxlLnByb3RvdHlwZS5nZXRFZGdlcyA9IGZ1bmN0aW9uIChlcykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5vdXRnb2luZy5mb3JBbGwoZnVuY3Rpb24gKG1zLCBlZGdldHlwZSkge1xyXG4gICAgICAgICAgICBtcy5mb3JBbGwoZnVuY3Rpb24gKHRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgZXMucHVzaChuZXcgUG93ZXJFZGdlKF90aGlzLmlkLCB0YXJnZXQuaWQsIGVkZ2V0eXBlKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIE1vZHVsZS5wcm90b3R5cGUuaXNMZWFmID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNoaWxkcmVuLmNvdW50KCkgPT09IDA7XHJcbiAgICB9O1xyXG4gICAgTW9kdWxlLnByb3RvdHlwZS5pc0lzbGFuZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vdXRnb2luZy5jb3VudCgpID09PSAwICYmIHRoaXMuaW5jb21pbmcuY291bnQoKSA9PT0gMDtcclxuICAgIH07XHJcbiAgICBNb2R1bGUucHJvdG90eXBlLmlzUHJlZGVmaW5lZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdHlwZW9mIHRoaXMuZGVmaW5pdGlvbiAhPT0gXCJ1bmRlZmluZWRcIjtcclxuICAgIH07XHJcbiAgICByZXR1cm4gTW9kdWxlO1xyXG59KCkpO1xyXG5leHBvcnRzLk1vZHVsZSA9IE1vZHVsZTtcclxuZnVuY3Rpb24gaW50ZXJzZWN0aW9uKG0sIG4pIHtcclxuICAgIHZhciBpID0ge307XHJcbiAgICBmb3IgKHZhciB2IGluIG0pXHJcbiAgICAgICAgaWYgKHYgaW4gbilcclxuICAgICAgICAgICAgaVt2XSA9IG1bdl07XHJcbiAgICByZXR1cm4gaTtcclxufVxyXG52YXIgTW9kdWxlU2V0ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIE1vZHVsZVNldCgpIHtcclxuICAgICAgICB0aGlzLnRhYmxlID0ge307XHJcbiAgICB9XHJcbiAgICBNb2R1bGVTZXQucHJvdG90eXBlLmNvdW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLnRhYmxlKS5sZW5ndGg7XHJcbiAgICB9O1xyXG4gICAgTW9kdWxlU2V0LnByb3RvdHlwZS5pbnRlcnNlY3Rpb24gPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gbmV3IE1vZHVsZVNldCgpO1xyXG4gICAgICAgIHJlc3VsdC50YWJsZSA9IGludGVyc2VjdGlvbih0aGlzLnRhYmxlLCBvdGhlci50YWJsZSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICBNb2R1bGVTZXQucHJvdG90eXBlLmludGVyc2VjdGlvbkNvdW50ID0gZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJzZWN0aW9uKG90aGVyKS5jb3VudCgpO1xyXG4gICAgfTtcclxuICAgIE1vZHVsZVNldC5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICByZXR1cm4gaWQgaW4gdGhpcy50YWJsZTtcclxuICAgIH07XHJcbiAgICBNb2R1bGVTZXQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChtKSB7XHJcbiAgICAgICAgdGhpcy50YWJsZVttLmlkXSA9IG07XHJcbiAgICB9O1xyXG4gICAgTW9kdWxlU2V0LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAobSkge1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnRhYmxlW20uaWRdO1xyXG4gICAgfTtcclxuICAgIE1vZHVsZVNldC5wcm90b3R5cGUuZm9yQWxsID0gZnVuY3Rpb24gKGYpIHtcclxuICAgICAgICBmb3IgKHZhciBtaWQgaW4gdGhpcy50YWJsZSkge1xyXG4gICAgICAgICAgICBmKHRoaXMudGFibGVbbWlkXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIE1vZHVsZVNldC5wcm90b3R5cGUubW9kdWxlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgdnMgPSBbXTtcclxuICAgICAgICB0aGlzLmZvckFsbChmdW5jdGlvbiAobSkge1xyXG4gICAgICAgICAgICBpZiAoIW0uaXNQcmVkZWZpbmVkKCkpXHJcbiAgICAgICAgICAgICAgICB2cy5wdXNoKG0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB2cztcclxuICAgIH07XHJcbiAgICByZXR1cm4gTW9kdWxlU2V0O1xyXG59KCkpO1xyXG5leHBvcnRzLk1vZHVsZVNldCA9IE1vZHVsZVNldDtcclxudmFyIExpbmtTZXRzID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIExpbmtTZXRzKCkge1xyXG4gICAgICAgIHRoaXMuc2V0cyA9IHt9O1xyXG4gICAgICAgIHRoaXMubiA9IDA7XHJcbiAgICB9XHJcbiAgICBMaW5rU2V0cy5wcm90b3R5cGUuY291bnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubjtcclxuICAgIH07XHJcbiAgICBMaW5rU2V0cy5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5mb3JBbGxNb2R1bGVzKGZ1bmN0aW9uIChtKSB7XHJcbiAgICAgICAgICAgIGlmICghcmVzdWx0ICYmIG0uaWQgPT0gaWQpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfTtcclxuICAgIExpbmtTZXRzLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAobGlua3R5cGUsIG0pIHtcclxuICAgICAgICB2YXIgcyA9IGxpbmt0eXBlIGluIHRoaXMuc2V0cyA/IHRoaXMuc2V0c1tsaW5rdHlwZV0gOiB0aGlzLnNldHNbbGlua3R5cGVdID0gbmV3IE1vZHVsZVNldCgpO1xyXG4gICAgICAgIHMuYWRkKG0pO1xyXG4gICAgICAgICsrdGhpcy5uO1xyXG4gICAgfTtcclxuICAgIExpbmtTZXRzLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAobGlua3R5cGUsIG0pIHtcclxuICAgICAgICB2YXIgbXMgPSB0aGlzLnNldHNbbGlua3R5cGVdO1xyXG4gICAgICAgIG1zLnJlbW92ZShtKTtcclxuICAgICAgICBpZiAobXMuY291bnQoKSA9PT0gMCkge1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5zZXRzW2xpbmt0eXBlXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLS10aGlzLm47XHJcbiAgICB9O1xyXG4gICAgTGlua1NldHMucHJvdG90eXBlLmZvckFsbCA9IGZ1bmN0aW9uIChmKSB7XHJcbiAgICAgICAgZm9yICh2YXIgbGlua3R5cGUgaW4gdGhpcy5zZXRzKSB7XHJcbiAgICAgICAgICAgIGYodGhpcy5zZXRzW2xpbmt0eXBlXSwgTnVtYmVyKGxpbmt0eXBlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIExpbmtTZXRzLnByb3RvdHlwZS5mb3JBbGxNb2R1bGVzID0gZnVuY3Rpb24gKGYpIHtcclxuICAgICAgICB0aGlzLmZvckFsbChmdW5jdGlvbiAobXMsIGx0KSB7IHJldHVybiBtcy5mb3JBbGwoZik7IH0pO1xyXG4gICAgfTtcclxuICAgIExpbmtTZXRzLnByb3RvdHlwZS5pbnRlcnNlY3Rpb24gPSBmdW5jdGlvbiAob3RoZXIpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gbmV3IExpbmtTZXRzKCk7XHJcbiAgICAgICAgdGhpcy5mb3JBbGwoZnVuY3Rpb24gKG1zLCBsdCkge1xyXG4gICAgICAgICAgICBpZiAobHQgaW4gb3RoZXIuc2V0cykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGkgPSBtcy5pbnRlcnNlY3Rpb24ob3RoZXIuc2V0c1tsdF0pLCBuID0gaS5jb3VudCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG4gPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnNldHNbbHRdID0gaTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQubiArPSBuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH07XHJcbiAgICByZXR1cm4gTGlua1NldHM7XHJcbn0oKSk7XHJcbmV4cG9ydHMuTGlua1NldHMgPSBMaW5rU2V0cztcclxuZnVuY3Rpb24gaW50ZXJzZWN0aW9uQ291bnQobSwgbikge1xyXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGludGVyc2VjdGlvbihtLCBuKSkubGVuZ3RoO1xyXG59XHJcbmZ1bmN0aW9uIGdldEdyb3Vwcyhub2RlcywgbGlua3MsIGxhLCByb290R3JvdXApIHtcclxuICAgIHZhciBuID0gbm9kZXMubGVuZ3RoLCBjID0gbmV3IENvbmZpZ3VyYXRpb24obiwgbGlua3MsIGxhLCByb290R3JvdXApO1xyXG4gICAgd2hpbGUgKGMuZ3JlZWR5TWVyZ2UoKSlcclxuICAgICAgICA7XHJcbiAgICB2YXIgcG93ZXJFZGdlcyA9IFtdO1xyXG4gICAgdmFyIGcgPSBjLmdldEdyb3VwSGllcmFyY2h5KHBvd2VyRWRnZXMpO1xyXG4gICAgcG93ZXJFZGdlcy5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgdmFyIGYgPSBmdW5jdGlvbiAoZW5kKSB7XHJcbiAgICAgICAgICAgIHZhciBnID0gZVtlbmRdO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGcgPT0gXCJudW1iZXJcIilcclxuICAgICAgICAgICAgICAgIGVbZW5kXSA9IG5vZGVzW2ddO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgZihcInNvdXJjZVwiKTtcclxuICAgICAgICBmKFwidGFyZ2V0XCIpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4geyBncm91cHM6IGcsIHBvd2VyRWRnZXM6IHBvd2VyRWRnZXMgfTtcclxufVxyXG5leHBvcnRzLmdldEdyb3VwcyA9IGdldEdyb3VwcztcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cG93ZXJncmFwaC5qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vd2ViY29sYS9kaXN0L3NyYy9wb3dlcmdyYXBoLmpzXG4vLyBtb2R1bGUgaWQgPSAxMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgUGFpcmluZ0hlYXAgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gUGFpcmluZ0hlYXAoZWxlbSkge1xyXG4gICAgICAgIHRoaXMuZWxlbSA9IGVsZW07XHJcbiAgICAgICAgdGhpcy5zdWJoZWFwcyA9IFtdO1xyXG4gICAgfVxyXG4gICAgUGFpcmluZ0hlYXAucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XHJcbiAgICAgICAgdmFyIHN0ciA9IFwiXCIsIG5lZWRDb21tYSA9IGZhbHNlO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdWJoZWFwcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgc3ViaGVhcCA9IHRoaXMuc3ViaGVhcHNbaV07XHJcbiAgICAgICAgICAgIGlmICghc3ViaGVhcC5lbGVtKSB7XHJcbiAgICAgICAgICAgICAgICBuZWVkQ29tbWEgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChuZWVkQ29tbWEpIHtcclxuICAgICAgICAgICAgICAgIHN0ciA9IHN0ciArIFwiLFwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN0ciA9IHN0ciArIHN1YmhlYXAudG9TdHJpbmcoc2VsZWN0b3IpO1xyXG4gICAgICAgICAgICBuZWVkQ29tbWEgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc3RyICE9PSBcIlwiKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IFwiKFwiICsgc3RyICsgXCIpXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAodGhpcy5lbGVtID8gc2VsZWN0b3IodGhpcy5lbGVtKSA6IFwiXCIpICsgc3RyO1xyXG4gICAgfTtcclxuICAgIFBhaXJpbmdIZWFwLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKGYpIHtcclxuICAgICAgICBpZiAoIXRoaXMuZW1wdHkoKSkge1xyXG4gICAgICAgICAgICBmKHRoaXMuZWxlbSwgdGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMuc3ViaGVhcHMuZm9yRWFjaChmdW5jdGlvbiAocykgeyByZXR1cm4gcy5mb3JFYWNoKGYpOyB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgUGFpcmluZ0hlYXAucHJvdG90eXBlLmNvdW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVtcHR5KCkgPyAwIDogMSArIHRoaXMuc3ViaGVhcHMucmVkdWNlKGZ1bmN0aW9uIChuLCBoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuICsgaC5jb3VudCgpO1xyXG4gICAgICAgIH0sIDApO1xyXG4gICAgfTtcclxuICAgIFBhaXJpbmdIZWFwLnByb3RvdHlwZS5taW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbTtcclxuICAgIH07XHJcbiAgICBQYWlyaW5nSGVhcC5wcm90b3R5cGUuZW1wdHkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbSA9PSBudWxsO1xyXG4gICAgfTtcclxuICAgIFBhaXJpbmdIZWFwLnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uIChoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMgPT09IGgpXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zdWJoZWFwcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zdWJoZWFwc1tpXS5jb250YWlucyhoKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9O1xyXG4gICAgUGFpcmluZ0hlYXAucHJvdG90eXBlLmlzSGVhcCA9IGZ1bmN0aW9uIChsZXNzVGhhbikge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3ViaGVhcHMuZXZlcnkoZnVuY3Rpb24gKGgpIHsgcmV0dXJuIGxlc3NUaGFuKF90aGlzLmVsZW0sIGguZWxlbSkgJiYgaC5pc0hlYXAobGVzc1RoYW4pOyB9KTtcclxuICAgIH07XHJcbiAgICBQYWlyaW5nSGVhcC5wcm90b3R5cGUuaW5zZXJ0ID0gZnVuY3Rpb24gKG9iaiwgbGVzc1RoYW4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tZXJnZShuZXcgUGFpcmluZ0hlYXAob2JqKSwgbGVzc1RoYW4pO1xyXG4gICAgfTtcclxuICAgIFBhaXJpbmdIZWFwLnByb3RvdHlwZS5tZXJnZSA9IGZ1bmN0aW9uIChoZWFwMiwgbGVzc1RoYW4pIHtcclxuICAgICAgICBpZiAodGhpcy5lbXB0eSgpKVxyXG4gICAgICAgICAgICByZXR1cm4gaGVhcDI7XHJcbiAgICAgICAgZWxzZSBpZiAoaGVhcDIuZW1wdHkoKSlcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgZWxzZSBpZiAobGVzc1RoYW4odGhpcy5lbGVtLCBoZWFwMi5lbGVtKSkge1xyXG4gICAgICAgICAgICB0aGlzLnN1YmhlYXBzLnB1c2goaGVhcDIpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGhlYXAyLnN1YmhlYXBzLnB1c2godGhpcyk7XHJcbiAgICAgICAgICAgIHJldHVybiBoZWFwMjtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgUGFpcmluZ0hlYXAucHJvdG90eXBlLnJlbW92ZU1pbiA9IGZ1bmN0aW9uIChsZXNzVGhhbikge1xyXG4gICAgICAgIGlmICh0aGlzLmVtcHR5KCkpXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWVyZ2VQYWlycyhsZXNzVGhhbik7XHJcbiAgICB9O1xyXG4gICAgUGFpcmluZ0hlYXAucHJvdG90eXBlLm1lcmdlUGFpcnMgPSBmdW5jdGlvbiAobGVzc1RoYW4pIHtcclxuICAgICAgICBpZiAodGhpcy5zdWJoZWFwcy5sZW5ndGggPT0gMClcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQYWlyaW5nSGVhcChudWxsKTtcclxuICAgICAgICBlbHNlIGlmICh0aGlzLnN1YmhlYXBzLmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN1YmhlYXBzWzBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIGZpcnN0UGFpciA9IHRoaXMuc3ViaGVhcHMucG9wKCkubWVyZ2UodGhpcy5zdWJoZWFwcy5wb3AoKSwgbGVzc1RoYW4pO1xyXG4gICAgICAgICAgICB2YXIgcmVtYWluaW5nID0gdGhpcy5tZXJnZVBhaXJzKGxlc3NUaGFuKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZpcnN0UGFpci5tZXJnZShyZW1haW5pbmcsIGxlc3NUaGFuKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgUGFpcmluZ0hlYXAucHJvdG90eXBlLmRlY3JlYXNlS2V5ID0gZnVuY3Rpb24gKHN1YmhlYXAsIG5ld1ZhbHVlLCBzZXRIZWFwTm9kZSwgbGVzc1RoYW4pIHtcclxuICAgICAgICB2YXIgbmV3SGVhcCA9IHN1YmhlYXAucmVtb3ZlTWluKGxlc3NUaGFuKTtcclxuICAgICAgICBzdWJoZWFwLmVsZW0gPSBuZXdIZWFwLmVsZW07XHJcbiAgICAgICAgc3ViaGVhcC5zdWJoZWFwcyA9IG5ld0hlYXAuc3ViaGVhcHM7XHJcbiAgICAgICAgaWYgKHNldEhlYXBOb2RlICE9PSBudWxsICYmIG5ld0hlYXAuZWxlbSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBzZXRIZWFwTm9kZShzdWJoZWFwLmVsZW0sIHN1YmhlYXApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcGFpcmluZ05vZGUgPSBuZXcgUGFpcmluZ0hlYXAobmV3VmFsdWUpO1xyXG4gICAgICAgIGlmIChzZXRIZWFwTm9kZSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBzZXRIZWFwTm9kZShuZXdWYWx1ZSwgcGFpcmluZ05vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5tZXJnZShwYWlyaW5nTm9kZSwgbGVzc1RoYW4pO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBQYWlyaW5nSGVhcDtcclxufSgpKTtcclxuZXhwb3J0cy5QYWlyaW5nSGVhcCA9IFBhaXJpbmdIZWFwO1xyXG52YXIgUHJpb3JpdHlRdWV1ZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBQcmlvcml0eVF1ZXVlKGxlc3NUaGFuKSB7XHJcbiAgICAgICAgdGhpcy5sZXNzVGhhbiA9IGxlc3NUaGFuO1xyXG4gICAgfVxyXG4gICAgUHJpb3JpdHlRdWV1ZS5wcm90b3R5cGUudG9wID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmVtcHR5KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLnJvb3QuZWxlbTtcclxuICAgIH07XHJcbiAgICBQcmlvcml0eVF1ZXVlLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBhcmdzID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgYXJnc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcGFpcmluZ05vZGU7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGFyZzsgYXJnID0gYXJnc1tpXTsgKytpKSB7XHJcbiAgICAgICAgICAgIHBhaXJpbmdOb2RlID0gbmV3IFBhaXJpbmdIZWFwKGFyZyk7XHJcbiAgICAgICAgICAgIHRoaXMucm9vdCA9IHRoaXMuZW1wdHkoKSA/XHJcbiAgICAgICAgICAgICAgICBwYWlyaW5nTm9kZSA6IHRoaXMucm9vdC5tZXJnZShwYWlyaW5nTm9kZSwgdGhpcy5sZXNzVGhhbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwYWlyaW5nTm9kZTtcclxuICAgIH07XHJcbiAgICBQcmlvcml0eVF1ZXVlLnByb3RvdHlwZS5lbXB0eSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gIXRoaXMucm9vdCB8fCAhdGhpcy5yb290LmVsZW07XHJcbiAgICB9O1xyXG4gICAgUHJpb3JpdHlRdWV1ZS5wcm90b3R5cGUuaXNIZWFwID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJvb3QuaXNIZWFwKHRoaXMubGVzc1RoYW4pO1xyXG4gICAgfTtcclxuICAgIFByaW9yaXR5UXVldWUucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiAoZikge1xyXG4gICAgICAgIHRoaXMucm9vdC5mb3JFYWNoKGYpO1xyXG4gICAgfTtcclxuICAgIFByaW9yaXR5UXVldWUucHJvdG90eXBlLnBvcCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5lbXB0eSgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgb2JqID0gdGhpcy5yb290Lm1pbigpO1xyXG4gICAgICAgIHRoaXMucm9vdCA9IHRoaXMucm9vdC5yZW1vdmVNaW4odGhpcy5sZXNzVGhhbik7XHJcbiAgICAgICAgcmV0dXJuIG9iajtcclxuICAgIH07XHJcbiAgICBQcmlvcml0eVF1ZXVlLnByb3RvdHlwZS5yZWR1Y2VLZXkgPSBmdW5jdGlvbiAoaGVhcE5vZGUsIG5ld0tleSwgc2V0SGVhcE5vZGUpIHtcclxuICAgICAgICBpZiAoc2V0SGVhcE5vZGUgPT09IHZvaWQgMCkgeyBzZXRIZWFwTm9kZSA9IG51bGw7IH1cclxuICAgICAgICB0aGlzLnJvb3QgPSB0aGlzLnJvb3QuZGVjcmVhc2VLZXkoaGVhcE5vZGUsIG5ld0tleSwgc2V0SGVhcE5vZGUsIHRoaXMubGVzc1RoYW4pO1xyXG4gICAgfTtcclxuICAgIFByaW9yaXR5UXVldWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm9vdC50b1N0cmluZyhzZWxlY3Rvcik7XHJcbiAgICB9O1xyXG4gICAgUHJpb3JpdHlRdWV1ZS5wcm90b3R5cGUuY291bnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucm9vdC5jb3VudCgpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBQcmlvcml0eVF1ZXVlO1xyXG59KCkpO1xyXG5leHBvcnRzLlByaW9yaXR5UXVldWUgPSBQcmlvcml0eVF1ZXVlO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcXVldWUuanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3dlYmNvbGEvZGlzdC9zcmMvcHF1ZXVlLmpzXG4vLyBtb2R1bGUgaWQgPSAxMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcclxuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxuICAgIH07XHJcbn0pKCk7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIFRyZWVCYXNlID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFRyZWVCYXNlKCkge1xyXG4gICAgICAgIHRoaXMuZmluZEl0ZXIgPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgcmVzID0gdGhpcy5fcm9vdDtcclxuICAgICAgICAgICAgdmFyIGl0ZXIgPSB0aGlzLml0ZXJhdG9yKCk7XHJcbiAgICAgICAgICAgIHdoaWxlIChyZXMgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHZhciBjID0gdGhpcy5fY29tcGFyYXRvcihkYXRhLCByZXMuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoYyA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZXIuX2N1cnNvciA9IHJlcztcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZXIuX2FuY2VzdG9ycy5wdXNoKHJlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzID0gcmVzLmdldF9jaGlsZChjID4gMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIFRyZWVCYXNlLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLl9yb290ID0gbnVsbDtcclxuICAgICAgICB0aGlzLnNpemUgPSAwO1xyXG4gICAgfTtcclxuICAgIDtcclxuICAgIFRyZWVCYXNlLnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIgcmVzID0gdGhpcy5fcm9vdDtcclxuICAgICAgICB3aGlsZSAocmVzICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHZhciBjID0gdGhpcy5fY29tcGFyYXRvcihkYXRhLCByZXMuZGF0YSk7XHJcbiAgICAgICAgICAgIGlmIChjID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXMgPSByZXMuZ2V0X2NoaWxkKGMgPiAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH07XHJcbiAgICA7XHJcbiAgICBUcmVlQmFzZS5wcm90b3R5cGUubG93ZXJCb3VuZCA9IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2JvdW5kKGRhdGEsIHRoaXMuX2NvbXBhcmF0b3IpO1xyXG4gICAgfTtcclxuICAgIDtcclxuICAgIFRyZWVCYXNlLnByb3RvdHlwZS51cHBlckJvdW5kID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIgY21wID0gdGhpcy5fY29tcGFyYXRvcjtcclxuICAgICAgICBmdW5jdGlvbiByZXZlcnNlX2NtcChhLCBiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjbXAoYiwgYSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9ib3VuZChkYXRhLCByZXZlcnNlX2NtcCk7XHJcbiAgICB9O1xyXG4gICAgO1xyXG4gICAgVHJlZUJhc2UucHJvdG90eXBlLm1pbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcmVzID0gdGhpcy5fcm9vdDtcclxuICAgICAgICBpZiAocmVzID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICB3aGlsZSAocmVzLmxlZnQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmVzID0gcmVzLmxlZnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXMuZGF0YTtcclxuICAgIH07XHJcbiAgICA7XHJcbiAgICBUcmVlQmFzZS5wcm90b3R5cGUubWF4ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciByZXMgPSB0aGlzLl9yb290O1xyXG4gICAgICAgIGlmIChyZXMgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdoaWxlIChyZXMucmlnaHQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmVzID0gcmVzLnJpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzLmRhdGE7XHJcbiAgICB9O1xyXG4gICAgO1xyXG4gICAgVHJlZUJhc2UucHJvdG90eXBlLml0ZXJhdG9yID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgSXRlcmF0b3IodGhpcyk7XHJcbiAgICB9O1xyXG4gICAgO1xyXG4gICAgVHJlZUJhc2UucHJvdG90eXBlLmVhY2ggPSBmdW5jdGlvbiAoY2IpIHtcclxuICAgICAgICB2YXIgaXQgPSB0aGlzLml0ZXJhdG9yKCksIGRhdGE7XHJcbiAgICAgICAgd2hpbGUgKChkYXRhID0gaXQubmV4dCgpKSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjYihkYXRhKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgO1xyXG4gICAgVHJlZUJhc2UucHJvdG90eXBlLnJlYWNoID0gZnVuY3Rpb24gKGNiKSB7XHJcbiAgICAgICAgdmFyIGl0ID0gdGhpcy5pdGVyYXRvcigpLCBkYXRhO1xyXG4gICAgICAgIHdoaWxlICgoZGF0YSA9IGl0LnByZXYoKSkgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgY2IoZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIDtcclxuICAgIFRyZWVCYXNlLnByb3RvdHlwZS5fYm91bmQgPSBmdW5jdGlvbiAoZGF0YSwgY21wKSB7XHJcbiAgICAgICAgdmFyIGN1ciA9IHRoaXMuX3Jvb3Q7XHJcbiAgICAgICAgdmFyIGl0ZXIgPSB0aGlzLml0ZXJhdG9yKCk7XHJcbiAgICAgICAgd2hpbGUgKGN1ciAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB2YXIgYyA9IHRoaXMuX2NvbXBhcmF0b3IoZGF0YSwgY3VyLmRhdGEpO1xyXG4gICAgICAgICAgICBpZiAoYyA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaXRlci5fY3Vyc29yID0gY3VyO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaXRlci5fYW5jZXN0b3JzLnB1c2goY3VyKTtcclxuICAgICAgICAgICAgY3VyID0gY3VyLmdldF9jaGlsZChjID4gMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAodmFyIGkgPSBpdGVyLl9hbmNlc3RvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcclxuICAgICAgICAgICAgY3VyID0gaXRlci5fYW5jZXN0b3JzW2ldO1xyXG4gICAgICAgICAgICBpZiAoY21wKGRhdGEsIGN1ci5kYXRhKSA+IDApIHtcclxuICAgICAgICAgICAgICAgIGl0ZXIuX2N1cnNvciA9IGN1cjtcclxuICAgICAgICAgICAgICAgIGl0ZXIuX2FuY2VzdG9ycy5sZW5ndGggPSBpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaXRlci5fYW5jZXN0b3JzLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgcmV0dXJuIGl0ZXI7XHJcbiAgICB9O1xyXG4gICAgO1xyXG4gICAgcmV0dXJuIFRyZWVCYXNlO1xyXG59KCkpO1xyXG5leHBvcnRzLlRyZWVCYXNlID0gVHJlZUJhc2U7XHJcbnZhciBJdGVyYXRvciA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBJdGVyYXRvcih0cmVlKSB7XHJcbiAgICAgICAgdGhpcy5fdHJlZSA9IHRyZWU7XHJcbiAgICAgICAgdGhpcy5fYW5jZXN0b3JzID0gW107XHJcbiAgICAgICAgdGhpcy5fY3Vyc29yID0gbnVsbDtcclxuICAgIH1cclxuICAgIEl0ZXJhdG9yLnByb3RvdHlwZS5kYXRhID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jdXJzb3IgIT09IG51bGwgPyB0aGlzLl9jdXJzb3IuZGF0YSA6IG51bGw7XHJcbiAgICB9O1xyXG4gICAgO1xyXG4gICAgSXRlcmF0b3IucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2N1cnNvciA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB2YXIgcm9vdCA9IHRoaXMuX3RyZWUuX3Jvb3Q7XHJcbiAgICAgICAgICAgIGlmIChyb290ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9taW5Ob2RlKHJvb3QpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fY3Vyc29yLnJpZ2h0ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2F2ZTtcclxuICAgICAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgICAgICBzYXZlID0gdGhpcy5fY3Vyc29yO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9hbmNlc3RvcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1cnNvciA9IHRoaXMuX2FuY2VzdG9ycy5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1cnNvciA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gd2hpbGUgKHRoaXMuX2N1cnNvci5yaWdodCA9PT0gc2F2ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hbmNlc3RvcnMucHVzaCh0aGlzLl9jdXJzb3IpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWluTm9kZSh0aGlzLl9jdXJzb3IucmlnaHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9jdXJzb3IgIT09IG51bGwgPyB0aGlzLl9jdXJzb3IuZGF0YSA6IG51bGw7XHJcbiAgICB9O1xyXG4gICAgO1xyXG4gICAgSXRlcmF0b3IucHJvdG90eXBlLnByZXYgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2N1cnNvciA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB2YXIgcm9vdCA9IHRoaXMuX3RyZWUuX3Jvb3Q7XHJcbiAgICAgICAgICAgIGlmIChyb290ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tYXhOb2RlKHJvb3QpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fY3Vyc29yLmxlZnQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzYXZlO1xyXG4gICAgICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmUgPSB0aGlzLl9jdXJzb3I7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2FuY2VzdG9ycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3Vyc29yID0gdGhpcy5fYW5jZXN0b3JzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3Vyc29yID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSB3aGlsZSAodGhpcy5fY3Vyc29yLmxlZnQgPT09IHNhdmUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYW5jZXN0b3JzLnB1c2godGhpcy5fY3Vyc29yKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21heE5vZGUodGhpcy5fY3Vyc29yLmxlZnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9jdXJzb3IgIT09IG51bGwgPyB0aGlzLl9jdXJzb3IuZGF0YSA6IG51bGw7XHJcbiAgICB9O1xyXG4gICAgO1xyXG4gICAgSXRlcmF0b3IucHJvdG90eXBlLl9taW5Ob2RlID0gZnVuY3Rpb24gKHN0YXJ0KSB7XHJcbiAgICAgICAgd2hpbGUgKHN0YXJ0LmxlZnQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5fYW5jZXN0b3JzLnB1c2goc3RhcnQpO1xyXG4gICAgICAgICAgICBzdGFydCA9IHN0YXJ0LmxlZnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2N1cnNvciA9IHN0YXJ0O1xyXG4gICAgfTtcclxuICAgIDtcclxuICAgIEl0ZXJhdG9yLnByb3RvdHlwZS5fbWF4Tm9kZSA9IGZ1bmN0aW9uIChzdGFydCkge1xyXG4gICAgICAgIHdoaWxlIChzdGFydC5yaWdodCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLl9hbmNlc3RvcnMucHVzaChzdGFydCk7XHJcbiAgICAgICAgICAgIHN0YXJ0ID0gc3RhcnQucmlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2N1cnNvciA9IHN0YXJ0O1xyXG4gICAgfTtcclxuICAgIDtcclxuICAgIHJldHVybiBJdGVyYXRvcjtcclxufSgpKTtcclxuZXhwb3J0cy5JdGVyYXRvciA9IEl0ZXJhdG9yO1xyXG52YXIgTm9kZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBOb2RlKGRhdGEpIHtcclxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gICAgICAgIHRoaXMubGVmdCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5yaWdodCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5yZWQgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgTm9kZS5wcm90b3R5cGUuZ2V0X2NoaWxkID0gZnVuY3Rpb24gKGRpcikge1xyXG4gICAgICAgIHJldHVybiBkaXIgPyB0aGlzLnJpZ2h0IDogdGhpcy5sZWZ0O1xyXG4gICAgfTtcclxuICAgIDtcclxuICAgIE5vZGUucHJvdG90eXBlLnNldF9jaGlsZCA9IGZ1bmN0aW9uIChkaXIsIHZhbCkge1xyXG4gICAgICAgIGlmIChkaXIpIHtcclxuICAgICAgICAgICAgdGhpcy5yaWdodCA9IHZhbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubGVmdCA9IHZhbDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgO1xyXG4gICAgcmV0dXJuIE5vZGU7XHJcbn0oKSk7XHJcbnZhciBSQlRyZWUgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xyXG4gICAgX19leHRlbmRzKFJCVHJlZSwgX3N1cGVyKTtcclxuICAgIGZ1bmN0aW9uIFJCVHJlZShjb21wYXJhdG9yKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcykgfHwgdGhpcztcclxuICAgICAgICBfdGhpcy5fcm9vdCA9IG51bGw7XHJcbiAgICAgICAgX3RoaXMuX2NvbXBhcmF0b3IgPSBjb21wYXJhdG9yO1xyXG4gICAgICAgIF90aGlzLnNpemUgPSAwO1xyXG4gICAgICAgIHJldHVybiBfdGhpcztcclxuICAgIH1cclxuICAgIFJCVHJlZS5wcm90b3R5cGUuaW5zZXJ0ID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIgcmV0ID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHRoaXMuX3Jvb3QgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5fcm9vdCA9IG5ldyBOb2RlKGRhdGEpO1xyXG4gICAgICAgICAgICByZXQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLnNpemUrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBoZWFkID0gbmV3IE5vZGUodW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgdmFyIGRpciA9IGZhbHNlO1xyXG4gICAgICAgICAgICB2YXIgbGFzdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB2YXIgZ3AgPSBudWxsO1xyXG4gICAgICAgICAgICB2YXIgZ2dwID0gaGVhZDtcclxuICAgICAgICAgICAgdmFyIHAgPSBudWxsO1xyXG4gICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMuX3Jvb3Q7XHJcbiAgICAgICAgICAgIGdncC5yaWdodCA9IHRoaXMuX3Jvb3Q7XHJcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSBuZXcgTm9kZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICBwLnNldF9jaGlsZChkaXIsIG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaXplKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChSQlRyZWUuaXNfcmVkKG5vZGUubGVmdCkgJiYgUkJUcmVlLmlzX3JlZChub2RlLnJpZ2h0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUucmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBub2RlLmxlZnQucmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5yaWdodC5yZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChSQlRyZWUuaXNfcmVkKG5vZGUpICYmIFJCVHJlZS5pc19yZWQocCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGlyMiA9IGdncC5yaWdodCA9PT0gZ3A7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUgPT09IHAuZ2V0X2NoaWxkKGxhc3QpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdncC5zZXRfY2hpbGQoZGlyMiwgUkJUcmVlLnNpbmdsZV9yb3RhdGUoZ3AsICFsYXN0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBnZ3Auc2V0X2NoaWxkKGRpcjIsIFJCVHJlZS5kb3VibGVfcm90YXRlKGdwLCAhbGFzdCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciBjbXAgPSB0aGlzLl9jb21wYXJhdG9yKG5vZGUuZGF0YSwgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY21wID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsYXN0ID0gZGlyO1xyXG4gICAgICAgICAgICAgICAgZGlyID0gY21wIDwgMDtcclxuICAgICAgICAgICAgICAgIGlmIChncCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdncCA9IGdwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZ3AgPSBwO1xyXG4gICAgICAgICAgICAgICAgcCA9IG5vZGU7XHJcbiAgICAgICAgICAgICAgICBub2RlID0gbm9kZS5nZXRfY2hpbGQoZGlyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9yb290ID0gaGVhZC5yaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcm9vdC5yZWQgPSBmYWxzZTtcclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfTtcclxuICAgIDtcclxuICAgIFJCVHJlZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICBpZiAodGhpcy5fcm9vdCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBoZWFkID0gbmV3IE5vZGUodW5kZWZpbmVkKTtcclxuICAgICAgICB2YXIgbm9kZSA9IGhlYWQ7XHJcbiAgICAgICAgbm9kZS5yaWdodCA9IHRoaXMuX3Jvb3Q7XHJcbiAgICAgICAgdmFyIHAgPSBudWxsO1xyXG4gICAgICAgIHZhciBncCA9IG51bGw7XHJcbiAgICAgICAgdmFyIGZvdW5kID0gbnVsbDtcclxuICAgICAgICB2YXIgZGlyID0gdHJ1ZTtcclxuICAgICAgICB3aGlsZSAobm9kZS5nZXRfY2hpbGQoZGlyKSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB2YXIgbGFzdCA9IGRpcjtcclxuICAgICAgICAgICAgZ3AgPSBwO1xyXG4gICAgICAgICAgICBwID0gbm9kZTtcclxuICAgICAgICAgICAgbm9kZSA9IG5vZGUuZ2V0X2NoaWxkKGRpcik7XHJcbiAgICAgICAgICAgIHZhciBjbXAgPSB0aGlzLl9jb21wYXJhdG9yKGRhdGEsIG5vZGUuZGF0YSk7XHJcbiAgICAgICAgICAgIGRpciA9IGNtcCA+IDA7XHJcbiAgICAgICAgICAgIGlmIChjbXAgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGZvdW5kID0gbm9kZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIVJCVHJlZS5pc19yZWQobm9kZSkgJiYgIVJCVHJlZS5pc19yZWQobm9kZS5nZXRfY2hpbGQoZGlyKSkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChSQlRyZWUuaXNfcmVkKG5vZGUuZ2V0X2NoaWxkKCFkaXIpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzciA9IFJCVHJlZS5zaW5nbGVfcm90YXRlKG5vZGUsIGRpcik7XHJcbiAgICAgICAgICAgICAgICAgICAgcC5zZXRfY2hpbGQobGFzdCwgc3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIHAgPSBzcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCFSQlRyZWUuaXNfcmVkKG5vZGUuZ2V0X2NoaWxkKCFkaXIpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzaWJsaW5nID0gcC5nZXRfY2hpbGQoIWxhc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzaWJsaW5nICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghUkJUcmVlLmlzX3JlZChzaWJsaW5nLmdldF9jaGlsZCghbGFzdCkpICYmICFSQlRyZWUuaXNfcmVkKHNpYmxpbmcuZ2V0X2NoaWxkKGxhc3QpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcC5yZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpYmxpbmcucmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUucmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkaXIyID0gZ3AucmlnaHQgPT09IHA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoUkJUcmVlLmlzX3JlZChzaWJsaW5nLmdldF9jaGlsZChsYXN0KSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncC5zZXRfY2hpbGQoZGlyMiwgUkJUcmVlLmRvdWJsZV9yb3RhdGUocCwgbGFzdCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoUkJUcmVlLmlzX3JlZChzaWJsaW5nLmdldF9jaGlsZCghbGFzdCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3Auc2V0X2NoaWxkKGRpcjIsIFJCVHJlZS5zaW5nbGVfcm90YXRlKHAsIGxhc3QpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBncGMgPSBncC5nZXRfY2hpbGQoZGlyMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBncGMucmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUucmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdwYy5sZWZ0LnJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3BjLnJpZ2h0LnJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmb3VuZCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBmb3VuZC5kYXRhID0gbm9kZS5kYXRhO1xyXG4gICAgICAgICAgICBwLnNldF9jaGlsZChwLnJpZ2h0ID09PSBub2RlLCBub2RlLmdldF9jaGlsZChub2RlLmxlZnQgPT09IG51bGwpKTtcclxuICAgICAgICAgICAgdGhpcy5zaXplLS07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3Jvb3QgPSBoZWFkLnJpZ2h0O1xyXG4gICAgICAgIGlmICh0aGlzLl9yb290ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Jvb3QucmVkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmb3VuZCAhPT0gbnVsbDtcclxuICAgIH07XHJcbiAgICA7XHJcbiAgICBSQlRyZWUuaXNfcmVkID0gZnVuY3Rpb24gKG5vZGUpIHtcclxuICAgICAgICByZXR1cm4gbm9kZSAhPT0gbnVsbCAmJiBub2RlLnJlZDtcclxuICAgIH07XHJcbiAgICBSQlRyZWUuc2luZ2xlX3JvdGF0ZSA9IGZ1bmN0aW9uIChyb290LCBkaXIpIHtcclxuICAgICAgICB2YXIgc2F2ZSA9IHJvb3QuZ2V0X2NoaWxkKCFkaXIpO1xyXG4gICAgICAgIHJvb3Quc2V0X2NoaWxkKCFkaXIsIHNhdmUuZ2V0X2NoaWxkKGRpcikpO1xyXG4gICAgICAgIHNhdmUuc2V0X2NoaWxkKGRpciwgcm9vdCk7XHJcbiAgICAgICAgcm9vdC5yZWQgPSB0cnVlO1xyXG4gICAgICAgIHNhdmUucmVkID0gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIHNhdmU7XHJcbiAgICB9O1xyXG4gICAgUkJUcmVlLmRvdWJsZV9yb3RhdGUgPSBmdW5jdGlvbiAocm9vdCwgZGlyKSB7XHJcbiAgICAgICAgcm9vdC5zZXRfY2hpbGQoIWRpciwgUkJUcmVlLnNpbmdsZV9yb3RhdGUocm9vdC5nZXRfY2hpbGQoIWRpciksICFkaXIpKTtcclxuICAgICAgICByZXR1cm4gUkJUcmVlLnNpbmdsZV9yb3RhdGUocm9vdCwgZGlyKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gUkJUcmVlO1xyXG59KFRyZWVCYXNlKSk7XHJcbmV4cG9ydHMuUkJUcmVlID0gUkJUcmVlO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1yYnRyZWUuanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3dlYmNvbGEvZGlzdC9zcmMvcmJ0cmVlLmpzXG4vLyBtb2R1bGUgaWQgPSAxM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBTaW1wbGUsIGludGVybmFsIE9iamVjdC5hc3NpZ24oKSBwb2x5ZmlsbCBmb3Igb3B0aW9ucyBvYmplY3RzIGV0Yy5cblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduICE9IG51bGwgPyBPYmplY3QuYXNzaWduLmJpbmQoIE9iamVjdCApIDogZnVuY3Rpb24oIHRndCwgLi4uc3JjcyApe1xuICBzcmNzLmZvckVhY2goIHNyYyA9PiB7XG4gICAgT2JqZWN0LmtleXMoIHNyYyApLmZvckVhY2goIGsgPT4gdGd0W2tdID0gc3JjW2tdICk7XG4gIH0gKTtcblxuICByZXR1cm4gdGd0O1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9hc3NpZ24uanMiLCIvLyBkZWZhdWx0IGxheW91dCBvcHRpb25zXG5sZXQgZGVmYXVsdHMgPSB7XG4gIGFuaW1hdGU6IHRydWUsIC8vIHdoZXRoZXIgdG8gc2hvdyB0aGUgbGF5b3V0IGFzIGl0J3MgcnVubmluZ1xuICByZWZyZXNoOiAxLCAvLyBudW1iZXIgb2YgdGlja3MgcGVyIGZyYW1lOyBoaWdoZXIgaXMgZmFzdGVyIGJ1dCBtb3JlIGplcmt5XG4gIG1heFNpbXVsYXRpb25UaW1lOiA0MDAwLCAvLyBtYXggbGVuZ3RoIGluIG1zIHRvIHJ1biB0aGUgbGF5b3V0XG4gIHVuZ3JhYmlmeVdoaWxlU2ltdWxhdGluZzogZmFsc2UsIC8vIHNvIHlvdSBjYW4ndCBkcmFnIG5vZGVzIGR1cmluZyBsYXlvdXRcbiAgZml0OiB0cnVlLCAvLyBvbiBldmVyeSBsYXlvdXQgcmVwb3NpdGlvbiBvZiBub2RlcywgZml0IHRoZSB2aWV3cG9ydFxuICBwYWRkaW5nOiAzMCwgLy8gcGFkZGluZyBhcm91bmQgdGhlIHNpbXVsYXRpb25cbiAgYm91bmRpbmdCb3g6IHVuZGVmaW5lZCwgLy8gY29uc3RyYWluIGxheW91dCBib3VuZHM7IHsgeDEsIHkxLCB4MiwgeTIgfSBvciB7IHgxLCB5MSwgdywgaCB9XG4gIG5vZGVEaW1lbnNpb25zSW5jbHVkZUxhYmVsczogdW5kZWZpbmVkLCAvLyB3aGV0aGVyIGxhYmVscyBzaG91bGQgYmUgaW5jbHVkZWQgaW4gZGV0ZXJtaW5pbmcgdGhlIHNwYWNlIHVzZWQgYnkgYSBub2RlIChkZWZhdWx0IHRydWUpXG5cbiAgLy8gbGF5b3V0IGV2ZW50IGNhbGxiYWNrc1xuICByZWFkeTogZnVuY3Rpb24oKXt9LCAvLyBvbiBsYXlvdXRyZWFkeVxuICBzdG9wOiBmdW5jdGlvbigpe30sIC8vIG9uIGxheW91dHN0b3BcblxuICAvLyBwb3NpdGlvbmluZyBvcHRpb25zXG4gIHJhbmRvbWl6ZTogZmFsc2UsIC8vIHVzZSByYW5kb20gbm9kZSBwb3NpdGlvbnMgYXQgYmVnaW5uaW5nIG9mIGxheW91dFxuICBhdm9pZE92ZXJsYXA6IHRydWUsIC8vIGlmIHRydWUsIHByZXZlbnRzIG92ZXJsYXAgb2Ygbm9kZSBib3VuZGluZyBib3hlc1xuICBoYW5kbGVEaXNjb25uZWN0ZWQ6IHRydWUsIC8vIGlmIHRydWUsIGF2b2lkcyBkaXNjb25uZWN0ZWQgY29tcG9uZW50cyBmcm9tIG92ZXJsYXBwaW5nXG4gIG5vZGVTcGFjaW5nOiBmdW5jdGlvbiggbm9kZSApeyByZXR1cm4gMTA7IH0sIC8vIGV4dHJhIHNwYWNpbmcgYXJvdW5kIG5vZGVzXG4gIGZsb3c6IHVuZGVmaW5lZCwgLy8gdXNlIERBRy90cmVlIGZsb3cgbGF5b3V0IGlmIHNwZWNpZmllZCwgZS5nLiB7IGF4aXM6ICd5JywgbWluU2VwYXJhdGlvbjogMzAgfVxuICBhbGlnbm1lbnQ6IHVuZGVmaW5lZCwgLy8gcmVsYXRpdmUgYWxpZ25tZW50IGNvbnN0cmFpbnRzIG9uIG5vZGVzLCBlLmcuIGZ1bmN0aW9uKCBub2RlICl7IHJldHVybiB7IHg6IDAsIHk6IDEgfSB9XG4gIGdhcEluZXF1YWxpdGllczogdW5kZWZpbmVkLCAvLyBsaXN0IG9mIGluZXF1YWxpdHkgY29uc3RyYWludHMgZm9yIHRoZSBnYXAgYmV0d2VlbiB0aGUgbm9kZXMsIGUuZy4gW3tcImF4aXNcIjpcInlcIiwgXCJsZWZ0XCI6bm9kZTEsIFwicmlnaHRcIjpub2RlMiwgXCJnYXBcIjoyNX1dXG5cbiAgLy8gZGlmZmVyZW50IG1ldGhvZHMgb2Ygc3BlY2lmeWluZyBlZGdlIGxlbmd0aFxuICAvLyBlYWNoIGNhbiBiZSBhIGNvbnN0YW50IG51bWVyaWNhbCB2YWx1ZSBvciBhIGZ1bmN0aW9uIGxpa2UgYGZ1bmN0aW9uKCBlZGdlICl7IHJldHVybiAyOyB9YFxuICBlZGdlTGVuZ3RoOiB1bmRlZmluZWQsIC8vIHNldHMgZWRnZSBsZW5ndGggZGlyZWN0bHkgaW4gc2ltdWxhdGlvblxuICBlZGdlU3ltRGlmZkxlbmd0aDogdW5kZWZpbmVkLCAvLyBzeW1tZXRyaWMgZGlmZiBlZGdlIGxlbmd0aCBpbiBzaW11bGF0aW9uXG4gIGVkZ2VKYWNjYXJkTGVuZ3RoOiB1bmRlZmluZWQsIC8vIGphY2NhcmQgZWRnZSBsZW5ndGggaW4gc2ltdWxhdGlvblxuXG4gIC8vIGl0ZXJhdGlvbnMgb2YgY29sYSBhbGdvcml0aG07IHVzZXMgZGVmYXVsdCB2YWx1ZXMgb24gdW5kZWZpbmVkXG4gIHVuY29uc3RySXRlcjogdW5kZWZpbmVkLCAvLyB1bmNvbnN0cmFpbmVkIGluaXRpYWwgbGF5b3V0IGl0ZXJhdGlvbnNcbiAgdXNlckNvbnN0SXRlcjogdW5kZWZpbmVkLCAvLyBpbml0aWFsIGxheW91dCBpdGVyYXRpb25zIHdpdGggdXNlci1zcGVjaWZpZWQgY29uc3RyYWludHNcbiAgYWxsQ29uc3RJdGVyOiB1bmRlZmluZWQsIC8vIGluaXRpYWwgbGF5b3V0IGl0ZXJhdGlvbnMgd2l0aCBhbGwgY29uc3RyYWludHMgaW5jbHVkaW5nIG5vbi1vdmVybGFwXG5cbiAgLy8gaW5maW5pdGUgbGF5b3V0IG9wdGlvbnNcbiAgaW5maW5pdGU6IGZhbHNlIC8vIG92ZXJyaWRlcyBhbGwgb3RoZXIgb3B0aW9ucyBmb3IgYSBmb3JjZXMtYWxsLXRoZS10aW1lIG1vZGVcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdHM7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvZGVmYXVsdHMuanMiLCJcInVzZSBzdHJpY3RcIjtcclxuZnVuY3Rpb24gX19leHBvcnQobSkge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAoIWV4cG9ydHMuaGFzT3duUHJvcGVydHkocCkpIGV4cG9ydHNbcF0gPSBtW3BdO1xyXG59XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vc3JjL2FkYXB0b3JcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9zcmMvZDNhZGFwdG9yXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vc3JjL2Rlc2NlbnRcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9zcmMvZ2VvbVwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3NyYy9ncmlkcm91dGVyXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vc3JjL2hhbmRsZWRpc2Nvbm5lY3RlZFwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3NyYy9sYXlvdXRcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9zcmMvbGF5b3V0M2RcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9zcmMvbGlua2xlbmd0aHNcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9zcmMvcG93ZXJncmFwaFwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3NyYy9wcXVldWVcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9zcmMvcmJ0cmVlXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vc3JjL3JlY3RhbmdsZVwiKSk7XHJcbl9fZXhwb3J0KHJlcXVpcmUoXCIuL3NyYy9zaG9ydGVzdHBhdGhzXCIpKTtcclxuX19leHBvcnQocmVxdWlyZShcIi4vc3JjL3Zwc2NcIikpO1xyXG5fX2V4cG9ydChyZXF1aXJlKFwiLi9zcmMvYmF0Y2hcIikpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vd2ViY29sYS9kaXN0L2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAxNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcclxuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxuICAgIH07XHJcbn0pKCk7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIGxheW91dF8xID0gcmVxdWlyZShcIi4vbGF5b3V0XCIpO1xyXG52YXIgTGF5b3V0QWRhcHRvciA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XHJcbiAgICBfX2V4dGVuZHMoTGF5b3V0QWRhcHRvciwgX3N1cGVyKTtcclxuICAgIGZ1bmN0aW9uIExheW91dEFkYXB0b3Iob3B0aW9ucykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XHJcbiAgICAgICAgdmFyIHNlbGYgPSBfdGhpcztcclxuICAgICAgICB2YXIgbyA9IG9wdGlvbnM7XHJcbiAgICAgICAgaWYgKG8udHJpZ2dlcikge1xyXG4gICAgICAgICAgICBfdGhpcy50cmlnZ2VyID0gby50cmlnZ2VyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoby5raWNrKSB7XHJcbiAgICAgICAgICAgIF90aGlzLmtpY2sgPSBvLmtpY2s7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvLmRyYWcpIHtcclxuICAgICAgICAgICAgX3RoaXMuZHJhZyA9IG8uZHJhZztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG8ub24pIHtcclxuICAgICAgICAgICAgX3RoaXMub24gPSBvLm9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICBfdGhpcy5kcmFnc3RhcnQgPSBfdGhpcy5kcmFnU3RhcnQgPSBsYXlvdXRfMS5MYXlvdXQuZHJhZ1N0YXJ0O1xyXG4gICAgICAgIF90aGlzLmRyYWdlbmQgPSBfdGhpcy5kcmFnRW5kID0gbGF5b3V0XzEuTGF5b3V0LmRyYWdFbmQ7XHJcbiAgICAgICAgcmV0dXJuIF90aGlzO1xyXG4gICAgfVxyXG4gICAgTGF5b3V0QWRhcHRvci5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uIChlKSB7IH07XHJcbiAgICA7XHJcbiAgICBMYXlvdXRBZGFwdG9yLnByb3RvdHlwZS5raWNrID0gZnVuY3Rpb24gKCkgeyB9O1xyXG4gICAgO1xyXG4gICAgTGF5b3V0QWRhcHRvci5wcm90b3R5cGUuZHJhZyA9IGZ1bmN0aW9uICgpIHsgfTtcclxuICAgIDtcclxuICAgIExheW91dEFkYXB0b3IucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50VHlwZSwgbGlzdGVuZXIpIHsgcmV0dXJuIHRoaXM7IH07XHJcbiAgICA7XHJcbiAgICByZXR1cm4gTGF5b3V0QWRhcHRvcjtcclxufShsYXlvdXRfMS5MYXlvdXQpKTtcclxuZXhwb3J0cy5MYXlvdXRBZGFwdG9yID0gTGF5b3V0QWRhcHRvcjtcclxuZnVuY3Rpb24gYWRhcHRvcihvcHRpb25zKSB7XHJcbiAgICByZXR1cm4gbmV3IExheW91dEFkYXB0b3Iob3B0aW9ucyk7XHJcbn1cclxuZXhwb3J0cy5hZGFwdG9yID0gYWRhcHRvcjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YWRhcHRvci5qcy5tYXBcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vd2ViY29sYS9kaXN0L3NyYy9hZGFwdG9yLmpzXG4vLyBtb2R1bGUgaWQgPSAxN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgbGF5b3V0XzEgPSByZXF1aXJlKFwiLi9sYXlvdXRcIik7XHJcbnZhciBncmlkcm91dGVyXzEgPSByZXF1aXJlKFwiLi9ncmlkcm91dGVyXCIpO1xyXG5mdW5jdGlvbiBncmlkaWZ5KHBnTGF5b3V0LCBudWRnZUdhcCwgbWFyZ2luLCBncm91cE1hcmdpbikge1xyXG4gICAgcGdMYXlvdXQuY29sYS5zdGFydCgwLCAwLCAwLCAxMCwgZmFsc2UpO1xyXG4gICAgdmFyIGdyaWRyb3V0ZXIgPSByb3V0ZShwZ0xheW91dC5jb2xhLm5vZGVzKCksIHBnTGF5b3V0LmNvbGEuZ3JvdXBzKCksIG1hcmdpbiwgZ3JvdXBNYXJnaW4pO1xyXG4gICAgcmV0dXJuIGdyaWRyb3V0ZXIucm91dGVFZGdlcyhwZ0xheW91dC5wb3dlckdyYXBoLnBvd2VyRWRnZXMsIG51ZGdlR2FwLCBmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS5zb3VyY2Uucm91dGVyTm9kZS5pZDsgfSwgZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUudGFyZ2V0LnJvdXRlck5vZGUuaWQ7IH0pO1xyXG59XHJcbmV4cG9ydHMuZ3JpZGlmeSA9IGdyaWRpZnk7XHJcbmZ1bmN0aW9uIHJvdXRlKG5vZGVzLCBncm91cHMsIG1hcmdpbiwgZ3JvdXBNYXJnaW4pIHtcclxuICAgIG5vZGVzLmZvckVhY2goZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICBkLnJvdXRlck5vZGUgPSB7XHJcbiAgICAgICAgICAgIG5hbWU6IGQubmFtZSxcclxuICAgICAgICAgICAgYm91bmRzOiBkLmJvdW5kcy5pbmZsYXRlKC1tYXJnaW4pXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4gICAgZ3JvdXBzLmZvckVhY2goZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICBkLnJvdXRlck5vZGUgPSB7XHJcbiAgICAgICAgICAgIGJvdW5kczogZC5ib3VuZHMuaW5mbGF0ZSgtZ3JvdXBNYXJnaW4pLFxyXG4gICAgICAgICAgICBjaGlsZHJlbjogKHR5cGVvZiBkLmdyb3VwcyAhPT0gJ3VuZGVmaW5lZCcgPyBkLmdyb3Vwcy5tYXAoZnVuY3Rpb24gKGMpIHsgcmV0dXJuIG5vZGVzLmxlbmd0aCArIGMuaWQ7IH0pIDogW10pXHJcbiAgICAgICAgICAgICAgICAuY29uY2F0KHR5cGVvZiBkLmxlYXZlcyAhPT0gJ3VuZGVmaW5lZCcgPyBkLmxlYXZlcy5tYXAoZnVuY3Rpb24gKGMpIHsgcmV0dXJuIGMuaW5kZXg7IH0pIDogW10pXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG4gICAgdmFyIGdyaWRSb3V0ZXJOb2RlcyA9IG5vZGVzLmNvbmNhdChncm91cHMpLm1hcChmdW5jdGlvbiAoZCwgaSkge1xyXG4gICAgICAgIGQucm91dGVyTm9kZS5pZCA9IGk7XHJcbiAgICAgICAgcmV0dXJuIGQucm91dGVyTm9kZTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5ldyBncmlkcm91dGVyXzEuR3JpZFJvdXRlcihncmlkUm91dGVyTm9kZXMsIHtcclxuICAgICAgICBnZXRDaGlsZHJlbjogZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHYuY2hpbGRyZW47IH0sXHJcbiAgICAgICAgZ2V0Qm91bmRzOiBmdW5jdGlvbiAodikgeyByZXR1cm4gdi5ib3VuZHM7IH1cclxuICAgIH0sIG1hcmdpbiAtIGdyb3VwTWFyZ2luKTtcclxufVxyXG5mdW5jdGlvbiBwb3dlckdyYXBoR3JpZExheW91dChncmFwaCwgc2l6ZSwgZ3JvdXBwYWRkaW5nKSB7XHJcbiAgICB2YXIgcG93ZXJHcmFwaDtcclxuICAgIGdyYXBoLm5vZGVzLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHsgcmV0dXJuIHYuaW5kZXggPSBpOyB9KTtcclxuICAgIG5ldyBsYXlvdXRfMS5MYXlvdXQoKVxyXG4gICAgICAgIC5hdm9pZE92ZXJsYXBzKGZhbHNlKVxyXG4gICAgICAgIC5ub2RlcyhncmFwaC5ub2RlcylcclxuICAgICAgICAubGlua3MoZ3JhcGgubGlua3MpXHJcbiAgICAgICAgLnBvd2VyR3JhcGhHcm91cHMoZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICBwb3dlckdyYXBoID0gZDtcclxuICAgICAgICBwb3dlckdyYXBoLmdyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7IHJldHVybiB2LnBhZGRpbmcgPSBncm91cHBhZGRpbmc7IH0pO1xyXG4gICAgfSk7XHJcbiAgICB2YXIgbiA9IGdyYXBoLm5vZGVzLmxlbmd0aDtcclxuICAgIHZhciBlZGdlcyA9IFtdO1xyXG4gICAgdmFyIHZzID0gZ3JhcGgubm9kZXMuc2xpY2UoMCk7XHJcbiAgICB2cy5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7IHJldHVybiB2LmluZGV4ID0gaTsgfSk7XHJcbiAgICBwb3dlckdyYXBoLmdyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uIChnKSB7XHJcbiAgICAgICAgdmFyIHNvdXJjZUluZCA9IGcuaW5kZXggPSBnLmlkICsgbjtcclxuICAgICAgICB2cy5wdXNoKGcpO1xyXG4gICAgICAgIGlmICh0eXBlb2YgZy5sZWF2ZXMgIT09ICd1bmRlZmluZWQnKVxyXG4gICAgICAgICAgICBnLmxlYXZlcy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7IHJldHVybiBlZGdlcy5wdXNoKHsgc291cmNlOiBzb3VyY2VJbmQsIHRhcmdldDogdi5pbmRleCB9KTsgfSk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBnLmdyb3VwcyAhPT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgICAgICAgIGcuZ3JvdXBzLmZvckVhY2goZnVuY3Rpb24gKGdnKSB7IHJldHVybiBlZGdlcy5wdXNoKHsgc291cmNlOiBzb3VyY2VJbmQsIHRhcmdldDogZ2cuaWQgKyBuIH0pOyB9KTtcclxuICAgIH0pO1xyXG4gICAgcG93ZXJHcmFwaC5wb3dlckVkZ2VzLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBlZGdlcy5wdXNoKHsgc291cmNlOiBlLnNvdXJjZS5pbmRleCwgdGFyZ2V0OiBlLnRhcmdldC5pbmRleCB9KTtcclxuICAgIH0pO1xyXG4gICAgbmV3IGxheW91dF8xLkxheW91dCgpXHJcbiAgICAgICAgLnNpemUoc2l6ZSlcclxuICAgICAgICAubm9kZXModnMpXHJcbiAgICAgICAgLmxpbmtzKGVkZ2VzKVxyXG4gICAgICAgIC5hdm9pZE92ZXJsYXBzKGZhbHNlKVxyXG4gICAgICAgIC5saW5rRGlzdGFuY2UoMzApXHJcbiAgICAgICAgLnN5bW1ldHJpY0RpZmZMaW5rTGVuZ3Rocyg1KVxyXG4gICAgICAgIC5jb252ZXJnZW5jZVRocmVzaG9sZCgxZS00KVxyXG4gICAgICAgIC5zdGFydCgxMDAsIDAsIDAsIDAsIGZhbHNlKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgY29sYTogbmV3IGxheW91dF8xLkxheW91dCgpXHJcbiAgICAgICAgICAgIC5jb252ZXJnZW5jZVRocmVzaG9sZCgxZS0zKVxyXG4gICAgICAgICAgICAuc2l6ZShzaXplKVxyXG4gICAgICAgICAgICAuYXZvaWRPdmVybGFwcyh0cnVlKVxyXG4gICAgICAgICAgICAubm9kZXMoZ3JhcGgubm9kZXMpXHJcbiAgICAgICAgICAgIC5saW5rcyhncmFwaC5saW5rcylcclxuICAgICAgICAgICAgLmdyb3VwQ29tcGFjdG5lc3MoMWUtNClcclxuICAgICAgICAgICAgLmxpbmtEaXN0YW5jZSgzMClcclxuICAgICAgICAgICAgLnN5bW1ldHJpY0RpZmZMaW5rTGVuZ3Rocyg1KVxyXG4gICAgICAgICAgICAucG93ZXJHcmFwaEdyb3VwcyhmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICBwb3dlckdyYXBoID0gZDtcclxuICAgICAgICAgICAgcG93ZXJHcmFwaC5ncm91cHMuZm9yRWFjaChmdW5jdGlvbiAodikge1xyXG4gICAgICAgICAgICAgICAgdi5wYWRkaW5nID0gZ3JvdXBwYWRkaW5nO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KS5zdGFydCg1MCwgMCwgMTAwLCAwLCBmYWxzZSksXHJcbiAgICAgICAgcG93ZXJHcmFwaDogcG93ZXJHcmFwaFxyXG4gICAgfTtcclxufVxyXG5leHBvcnRzLnBvd2VyR3JhcGhHcmlkTGF5b3V0ID0gcG93ZXJHcmFwaEdyaWRMYXlvdXQ7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWJhdGNoLmpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi93ZWJjb2xhL2Rpc3Qvc3JjL2JhdGNoLmpzXG4vLyBtb2R1bGUgaWQgPSAxOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgZDN2MyA9IHJlcXVpcmUoXCIuL2QzdjNhZGFwdG9yXCIpO1xyXG52YXIgZDN2NCA9IHJlcXVpcmUoXCIuL2QzdjRhZGFwdG9yXCIpO1xyXG47XHJcbmZ1bmN0aW9uIGQzYWRhcHRvcihkM0NvbnRleHQpIHtcclxuICAgIGlmICghZDNDb250ZXh0IHx8IGlzRDNWMyhkM0NvbnRleHQpKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBkM3YzLkQzU3R5bGVMYXlvdXRBZGFwdG9yKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IGQzdjQuRDNTdHlsZUxheW91dEFkYXB0b3IoZDNDb250ZXh0KTtcclxufVxyXG5leHBvcnRzLmQzYWRhcHRvciA9IGQzYWRhcHRvcjtcclxuZnVuY3Rpb24gaXNEM1YzKGQzQ29udGV4dCkge1xyXG4gICAgdmFyIHYzZXhwID0gL14zXFwuLztcclxuICAgIHJldHVybiBkM0NvbnRleHQudmVyc2lvbiAmJiBkM0NvbnRleHQudmVyc2lvbi5tYXRjaCh2M2V4cCkgIT09IG51bGw7XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZDNhZGFwdG9yLmpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi93ZWJjb2xhL2Rpc3Qvc3JjL2QzYWRhcHRvci5qc1xuLy8gbW9kdWxlIGlkID0gMTlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XHJcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbiAgICB9O1xyXG59KSgpO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBsYXlvdXRfMSA9IHJlcXVpcmUoXCIuL2xheW91dFwiKTtcclxudmFyIEQzU3R5bGVMYXlvdXRBZGFwdG9yID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgIF9fZXh0ZW5kcyhEM1N0eWxlTGF5b3V0QWRhcHRvciwgX3N1cGVyKTtcclxuICAgIGZ1bmN0aW9uIEQzU3R5bGVMYXlvdXRBZGFwdG9yKCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XHJcbiAgICAgICAgX3RoaXMuZXZlbnQgPSBkMy5kaXNwYXRjaChsYXlvdXRfMS5FdmVudFR5cGVbbGF5b3V0XzEuRXZlbnRUeXBlLnN0YXJ0XSwgbGF5b3V0XzEuRXZlbnRUeXBlW2xheW91dF8xLkV2ZW50VHlwZS50aWNrXSwgbGF5b3V0XzEuRXZlbnRUeXBlW2xheW91dF8xLkV2ZW50VHlwZS5lbmRdKTtcclxuICAgICAgICB2YXIgZDNsYXlvdXQgPSBfdGhpcztcclxuICAgICAgICB2YXIgZHJhZztcclxuICAgICAgICBfdGhpcy5kcmFnID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoIWRyYWcpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkcmFnID0gZDMuYmVoYXZpb3IuZHJhZygpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9yaWdpbihsYXlvdXRfMS5MYXlvdXQuZHJhZ09yaWdpbilcclxuICAgICAgICAgICAgICAgICAgICAub24oXCJkcmFnc3RhcnQuZDNhZGFwdG9yXCIsIGxheW91dF8xLkxheW91dC5kcmFnU3RhcnQpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKFwiZHJhZy5kM2FkYXB0b3JcIiwgZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICBsYXlvdXRfMS5MYXlvdXQuZHJhZyhkLCBkMy5ldmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZDNsYXlvdXQucmVzdW1lKCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbihcImRyYWdlbmQuZDNhZGFwdG9yXCIsIGxheW91dF8xLkxheW91dC5kcmFnRW5kKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZHJhZztcclxuICAgICAgICAgICAgdGhpc1xyXG4gICAgICAgICAgICAgICAgLmNhbGwoZHJhZyk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gX3RoaXM7XHJcbiAgICB9XHJcbiAgICBEM1N0eWxlTGF5b3V0QWRhcHRvci5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgdmFyIGQzZXZlbnQgPSB7IHR5cGU6IGxheW91dF8xLkV2ZW50VHlwZVtlLnR5cGVdLCBhbHBoYTogZS5hbHBoYSwgc3RyZXNzOiBlLnN0cmVzcyB9O1xyXG4gICAgICAgIHRoaXMuZXZlbnRbZDNldmVudC50eXBlXShkM2V2ZW50KTtcclxuICAgIH07XHJcbiAgICBEM1N0eWxlTGF5b3V0QWRhcHRvci5wcm90b3R5cGUua2ljayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIGQzLnRpbWVyKGZ1bmN0aW9uICgpIHsgcmV0dXJuIF9zdXBlci5wcm90b3R5cGUudGljay5jYWxsKF90aGlzKTsgfSk7XHJcbiAgICB9O1xyXG4gICAgRDNTdHlsZUxheW91dEFkYXB0b3IucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50VHlwZSwgbGlzdGVuZXIpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGV2ZW50VHlwZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudC5vbihldmVudFR5cGUsIGxpc3RlbmVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnQub24obGF5b3V0XzEuRXZlbnRUeXBlW2V2ZW50VHlwZV0sIGxpc3RlbmVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIEQzU3R5bGVMYXlvdXRBZGFwdG9yO1xyXG59KGxheW91dF8xLkxheW91dCkpO1xyXG5leHBvcnRzLkQzU3R5bGVMYXlvdXRBZGFwdG9yID0gRDNTdHlsZUxheW91dEFkYXB0b3I7XHJcbmZ1bmN0aW9uIGQzYWRhcHRvcigpIHtcclxuICAgIHJldHVybiBuZXcgRDNTdHlsZUxheW91dEFkYXB0b3IoKTtcclxufVxyXG5leHBvcnRzLmQzYWRhcHRvciA9IGQzYWRhcHRvcjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZDN2M2FkYXB0b3IuanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3dlYmNvbGEvZGlzdC9zcmMvZDN2M2FkYXB0b3IuanNcbi8vIG1vZHVsZSBpZCA9IDIwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xyXG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG4gICAgfTtcclxufSkoKTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgbGF5b3V0XzEgPSByZXF1aXJlKFwiLi9sYXlvdXRcIik7XHJcbnZhciBEM1N0eWxlTGF5b3V0QWRhcHRvciA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XHJcbiAgICBfX2V4dGVuZHMoRDNTdHlsZUxheW91dEFkYXB0b3IsIF9zdXBlcik7XHJcbiAgICBmdW5jdGlvbiBEM1N0eWxlTGF5b3V0QWRhcHRvcihkM0NvbnRleHQpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzKSB8fCB0aGlzO1xyXG4gICAgICAgIF90aGlzLmQzQ29udGV4dCA9IGQzQ29udGV4dDtcclxuICAgICAgICBfdGhpcy5ldmVudCA9IGQzQ29udGV4dC5kaXNwYXRjaChsYXlvdXRfMS5FdmVudFR5cGVbbGF5b3V0XzEuRXZlbnRUeXBlLnN0YXJ0XSwgbGF5b3V0XzEuRXZlbnRUeXBlW2xheW91dF8xLkV2ZW50VHlwZS50aWNrXSwgbGF5b3V0XzEuRXZlbnRUeXBlW2xheW91dF8xLkV2ZW50VHlwZS5lbmRdKTtcclxuICAgICAgICB2YXIgZDNsYXlvdXQgPSBfdGhpcztcclxuICAgICAgICB2YXIgZHJhZztcclxuICAgICAgICBfdGhpcy5kcmFnID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoIWRyYWcpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkcmFnID0gZDNDb250ZXh0LmRyYWcoKVxyXG4gICAgICAgICAgICAgICAgICAgIC5zdWJqZWN0KGxheW91dF8xLkxheW91dC5kcmFnT3JpZ2luKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbihcInN0YXJ0LmQzYWRhcHRvclwiLCBsYXlvdXRfMS5MYXlvdXQuZHJhZ1N0YXJ0KVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbihcImRyYWcuZDNhZGFwdG9yXCIsIGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGF5b3V0XzEuTGF5b3V0LmRyYWcoZCwgZDNDb250ZXh0LmV2ZW50KTtcclxuICAgICAgICAgICAgICAgICAgICBkM2xheW91dC5yZXN1bWUoKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKFwiZW5kLmQzYWRhcHRvclwiLCBsYXlvdXRfMS5MYXlvdXQuZHJhZ0VuZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRyYWc7XHJcbiAgICAgICAgICAgIGFyZ3VtZW50c1swXS5jYWxsKGRyYWcpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIF90aGlzO1xyXG4gICAgfVxyXG4gICAgRDNTdHlsZUxheW91dEFkYXB0b3IucHJvdG90eXBlLnRyaWdnZXIgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIHZhciBkM2V2ZW50ID0geyB0eXBlOiBsYXlvdXRfMS5FdmVudFR5cGVbZS50eXBlXSwgYWxwaGE6IGUuYWxwaGEsIHN0cmVzczogZS5zdHJlc3MgfTtcclxuICAgICAgICB0aGlzLmV2ZW50LmNhbGwoZDNldmVudC50eXBlLCBkM2V2ZW50KTtcclxuICAgIH07XHJcbiAgICBEM1N0eWxlTGF5b3V0QWRhcHRvci5wcm90b3R5cGUua2ljayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xyXG4gICAgICAgIHZhciB0ID0gdGhpcy5kM0NvbnRleHQudGltZXIoZnVuY3Rpb24gKCkgeyByZXR1cm4gX3N1cGVyLnByb3RvdHlwZS50aWNrLmNhbGwoX3RoaXMpICYmIHQuc3RvcCgpOyB9KTtcclxuICAgIH07XHJcbiAgICBEM1N0eWxlTGF5b3V0QWRhcHRvci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXZlbnRUeXBlLCBsaXN0ZW5lcikge1xyXG4gICAgICAgIGlmICh0eXBlb2YgZXZlbnRUeXBlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50Lm9uKGV2ZW50VHlwZSwgbGlzdGVuZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudC5vbihsYXlvdXRfMS5FdmVudFR5cGVbZXZlbnRUeXBlXSwgbGlzdGVuZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH07XHJcbiAgICByZXR1cm4gRDNTdHlsZUxheW91dEFkYXB0b3I7XHJcbn0obGF5b3V0XzEuTGF5b3V0KSk7XHJcbmV4cG9ydHMuRDNTdHlsZUxheW91dEFkYXB0b3IgPSBEM1N0eWxlTGF5b3V0QWRhcHRvcjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZDN2NGFkYXB0b3IuanMubWFwXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3dlYmNvbGEvZGlzdC9zcmMvZDN2NGFkYXB0b3IuanNcbi8vIG1vZHVsZSBpZCA9IDIxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBzaG9ydGVzdHBhdGhzXzEgPSByZXF1aXJlKFwiLi9zaG9ydGVzdHBhdGhzXCIpO1xyXG52YXIgZGVzY2VudF8xID0gcmVxdWlyZShcIi4vZGVzY2VudFwiKTtcclxudmFyIHJlY3RhbmdsZV8xID0gcmVxdWlyZShcIi4vcmVjdGFuZ2xlXCIpO1xyXG52YXIgbGlua2xlbmd0aHNfMSA9IHJlcXVpcmUoXCIuL2xpbmtsZW5ndGhzXCIpO1xyXG52YXIgTGluazNEID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIExpbmszRChzb3VyY2UsIHRhcmdldCkge1xyXG4gICAgICAgIHRoaXMuc291cmNlID0gc291cmNlO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xyXG4gICAgfVxyXG4gICAgTGluazNELnByb3RvdHlwZS5hY3R1YWxMZW5ndGggPSBmdW5jdGlvbiAoeCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCh4LnJlZHVjZShmdW5jdGlvbiAoYywgdikge1xyXG4gICAgICAgICAgICB2YXIgZHggPSB2W190aGlzLnRhcmdldF0gLSB2W190aGlzLnNvdXJjZV07XHJcbiAgICAgICAgICAgIHJldHVybiBjICsgZHggKiBkeDtcclxuICAgICAgICB9LCAwKSk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIExpbmszRDtcclxufSgpKTtcclxuZXhwb3J0cy5MaW5rM0QgPSBMaW5rM0Q7XHJcbnZhciBOb2RlM0QgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTm9kZTNEKHgsIHksIHopIHtcclxuICAgICAgICBpZiAoeCA9PT0gdm9pZCAwKSB7IHggPSAwOyB9XHJcbiAgICAgICAgaWYgKHkgPT09IHZvaWQgMCkgeyB5ID0gMDsgfVxyXG4gICAgICAgIGlmICh6ID09PSB2b2lkIDApIHsgeiA9IDA7IH1cclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy56ID0gejtcclxuICAgIH1cclxuICAgIHJldHVybiBOb2RlM0Q7XHJcbn0oKSk7XHJcbmV4cG9ydHMuTm9kZTNEID0gTm9kZTNEO1xyXG52YXIgTGF5b3V0M0QgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gTGF5b3V0M0Qobm9kZXMsIGxpbmtzLCBpZGVhbExpbmtMZW5ndGgpIHtcclxuICAgICAgICBpZiAoaWRlYWxMaW5rTGVuZ3RoID09PSB2b2lkIDApIHsgaWRlYWxMaW5rTGVuZ3RoID0gMTsgfVxyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5ub2RlcyA9IG5vZGVzO1xyXG4gICAgICAgIHRoaXMubGlua3MgPSBsaW5rcztcclxuICAgICAgICB0aGlzLmlkZWFsTGlua0xlbmd0aCA9IGlkZWFsTGlua0xlbmd0aDtcclxuICAgICAgICB0aGlzLmNvbnN0cmFpbnRzID0gbnVsbDtcclxuICAgICAgICB0aGlzLnVzZUphY2NhcmRMaW5rTGVuZ3RocyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5yZXN1bHQgPSBuZXcgQXJyYXkoTGF5b3V0M0Quayk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBMYXlvdXQzRC5rOyArK2kpIHtcclxuICAgICAgICAgICAgdGhpcy5yZXN1bHRbaV0gPSBuZXcgQXJyYXkobm9kZXMubGVuZ3RoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAodiwgaSkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gTGF5b3V0M0QuZGltczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciBkaW0gPSBfYVtfaV07XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZbZGltXSA9PSAndW5kZWZpbmVkJylcclxuICAgICAgICAgICAgICAgICAgICB2W2RpbV0gPSBNYXRoLnJhbmRvbSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF90aGlzLnJlc3VsdFswXVtpXSA9IHYueDtcclxuICAgICAgICAgICAgX3RoaXMucmVzdWx0WzFdW2ldID0gdi55O1xyXG4gICAgICAgICAgICBfdGhpcy5yZXN1bHRbMl1baV0gPSB2Lno7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICA7XHJcbiAgICBMYXlvdXQzRC5wcm90b3R5cGUubGlua0xlbmd0aCA9IGZ1bmN0aW9uIChsKSB7XHJcbiAgICAgICAgcmV0dXJuIGwuYWN0dWFsTGVuZ3RoKHRoaXMucmVzdWx0KTtcclxuICAgIH07XHJcbiAgICBMYXlvdXQzRC5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoaXRlcmF0aW9ucykge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XHJcbiAgICAgICAgaWYgKGl0ZXJhdGlvbnMgPT09IHZvaWQgMCkgeyBpdGVyYXRpb25zID0gMTAwOyB9XHJcbiAgICAgICAgdmFyIG4gPSB0aGlzLm5vZGVzLmxlbmd0aDtcclxuICAgICAgICB2YXIgbGlua0FjY2Vzc29yID0gbmV3IExpbmtBY2Nlc3NvcigpO1xyXG4gICAgICAgIGlmICh0aGlzLnVzZUphY2NhcmRMaW5rTGVuZ3RocylcclxuICAgICAgICAgICAgbGlua2xlbmd0aHNfMS5qYWNjYXJkTGlua0xlbmd0aHModGhpcy5saW5rcywgbGlua0FjY2Vzc29yLCAxLjUpO1xyXG4gICAgICAgIHRoaXMubGlua3MuZm9yRWFjaChmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS5sZW5ndGggKj0gX3RoaXMuaWRlYWxMaW5rTGVuZ3RoOyB9KTtcclxuICAgICAgICB2YXIgZGlzdGFuY2VNYXRyaXggPSAobmV3IHNob3J0ZXN0cGF0aHNfMS5DYWxjdWxhdG9yKG4sIHRoaXMubGlua3MsIGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnNvdXJjZTsgfSwgZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUudGFyZ2V0OyB9LCBmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS5sZW5ndGg7IH0pKS5EaXN0YW5jZU1hdHJpeCgpO1xyXG4gICAgICAgIHZhciBEID0gZGVzY2VudF8xLkRlc2NlbnQuY3JlYXRlU3F1YXJlTWF0cml4KG4sIGZ1bmN0aW9uIChpLCBqKSB7IHJldHVybiBkaXN0YW5jZU1hdHJpeFtpXVtqXTsgfSk7XHJcbiAgICAgICAgdmFyIEcgPSBkZXNjZW50XzEuRGVzY2VudC5jcmVhdGVTcXVhcmVNYXRyaXgobiwgZnVuY3Rpb24gKCkgeyByZXR1cm4gMjsgfSk7XHJcbiAgICAgICAgdGhpcy5saW5rcy5mb3JFYWNoKGZ1bmN0aW9uIChfYSkge1xyXG4gICAgICAgICAgICB2YXIgc291cmNlID0gX2Euc291cmNlLCB0YXJnZXQgPSBfYS50YXJnZXQ7XHJcbiAgICAgICAgICAgIHJldHVybiBHW3NvdXJjZV1bdGFyZ2V0XSA9IEdbdGFyZ2V0XVtzb3VyY2VdID0gMTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmRlc2NlbnQgPSBuZXcgZGVzY2VudF8xLkRlc2NlbnQodGhpcy5yZXN1bHQsIEQpO1xyXG4gICAgICAgIHRoaXMuZGVzY2VudC50aHJlc2hvbGQgPSAxZS0zO1xyXG4gICAgICAgIHRoaXMuZGVzY2VudC5HID0gRztcclxuICAgICAgICBpZiAodGhpcy5jb25zdHJhaW50cylcclxuICAgICAgICAgICAgdGhpcy5kZXNjZW50LnByb2plY3QgPSBuZXcgcmVjdGFuZ2xlXzEuUHJvamVjdGlvbih0aGlzLm5vZGVzLCBudWxsLCBudWxsLCB0aGlzLmNvbnN0cmFpbnRzKS5wcm9qZWN0RnVuY3Rpb25zKCk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciB2ID0gdGhpcy5ub2Rlc1tpXTtcclxuICAgICAgICAgICAgaWYgKHYuZml4ZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVzY2VudC5sb2Nrcy5hZGQoaSwgW3YueCwgdi55LCB2LnpdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRlc2NlbnQucnVuKGl0ZXJhdGlvbnMpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfTtcclxuICAgIExheW91dDNELnByb3RvdHlwZS50aWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZGVzY2VudC5sb2Nrcy5jbGVhcigpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5ub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgdiA9IHRoaXMubm9kZXNbaV07XHJcbiAgICAgICAgICAgIGlmICh2LmZpeGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlc2NlbnQubG9ja3MuYWRkKGksIFt2LngsIHYueSwgdi56XSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVzY2VudC5ydW5nZUt1dHRhKCk7XHJcbiAgICB9O1xyXG4gICAgTGF5b3V0M0QuZGltcyA9IFsneCcsICd5JywgJ3onXTtcclxuICAgIExheW91dDNELmsgPSBMYXlvdXQzRC5kaW1zLmxlbmd0aDtcclxuICAgIHJldHVybiBMYXlvdXQzRDtcclxufSgpKTtcclxuZXhwb3J0cy5MYXlvdXQzRCA9IExheW91dDNEO1xyXG52YXIgTGlua0FjY2Vzc29yID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIExpbmtBY2Nlc3NvcigpIHtcclxuICAgIH1cclxuICAgIExpbmtBY2Nlc3Nvci5wcm90b3R5cGUuZ2V0U291cmNlSW5kZXggPSBmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS5zb3VyY2U7IH07XHJcbiAgICBMaW5rQWNjZXNzb3IucHJvdG90eXBlLmdldFRhcmdldEluZGV4ID0gZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUudGFyZ2V0OyB9O1xyXG4gICAgTGlua0FjY2Vzc29yLnByb3RvdHlwZS5nZXRMZW5ndGggPSBmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS5sZW5ndGg7IH07XHJcbiAgICBMaW5rQWNjZXNzb3IucHJvdG90eXBlLnNldExlbmd0aCA9IGZ1bmN0aW9uIChlLCBsKSB7IGUubGVuZ3RoID0gbDsgfTtcclxuICAgIHJldHVybiBMaW5rQWNjZXNzb3I7XHJcbn0oKSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxheW91dDNkLmpzLm1hcFxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi93ZWJjb2xhL2Rpc3Qvc3JjL2xheW91dDNkLmpzXG4vLyBtb2R1bGUgaWQgPSAyMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9