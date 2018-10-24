let raf;

if( typeof window !== typeof undefined ){
  raf = ( window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    (fn => setTimeout(fn, 16))
  );
} else { // if not available, all you get is immediate calls
  raf = function( cb ){
    cb();
  };
}

module.exports = raf;
