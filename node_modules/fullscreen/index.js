module.exports = fullscreen
fullscreen.available = available
fullscreen.enabled = enabled

var EE = require('events').EventEmitter
var ael = require('add-event-listener')
var rel = ael.removeEventListener

function available() {
  return !!shim(document.body)
}

function enabled() {
  return !!(document.fullscreenEnabled ||
    document.webkitFullscreenEnabled ||
    document.mozFullScreenEnabled ||
    document.msFullscreenEnabled);
}

function fullscreen(el) {
  var doc = el.ownerDocument
    , body = doc.body
    , rfs = shim(el)
    , ee = new EE

  var vendors = ['', 'webkit', 'moz']

  for(var i = 0, len = vendors.length; i < len; ++i) {
    ael(doc, vendors[i] + 'fullscreenchange', onfullscreenchange)
    ael(doc, vendors[i] + 'fullscreenerror', onfullscreenerror)
  }
  // MS uses different casing:
  ael(doc, 'MSFullscreenChange', onfullscreenchange)
  ael(doc, 'MSFullscreenError', onfullscreenerror)

  ee.release = release
  ee.request = request
  ee.dispose = dispose
  ee.target = fullscreenelement

  if(!shim) {
    setTimeout(function() {
      ee.emit('error', new Error('fullscreen is not supported'))
    }, 0)
  }
  return ee

  function onfullscreenchange() {
    if(!fullscreenelement()) {
      return ee.emit('release')
    }
    ee.emit('attain')
  }

  function onfullscreenerror() {
    ee.emit('error')
  }

  function request() {
    return rfs.apply(el, arguments)
  }

  function release() {

    var element_exit = (el.exitFullscreen ||
      el.webkitExitFullscreen ||
      el.mozCancelFullScreen ||
      el.mozExitFullScreen ||
      el.msExitFullscreen);

    if (element_exit) {
      element_exit.apply(el, arguments);
      return;
    }

    var document_exit = (doc.exitFullscreen ||
      doc.webkitExitFullscreen ||
      doc.mozCancelFullScreen ||
      doc.mozExitFullScreen ||
      doc.msExitFullscreen);

    document_exit.apply(doc, arguments);
  } 

  function fullscreenelement() {
    return (0 ||
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement ||
      null);
  }

  function dispose() {
    for(var i = 0, len = vendors.length; i < len; ++i) {
      rel(doc, vendors[i] + 'fullscreenchange', onfullscreenchange)
      rel(doc, vendors[i] + 'fullscreenerror', onfullscreenerror)
    }
    // MS uses different casing:
    rel(doc, 'MSFullscreenChange', onfullscreenchange)
    rel(doc, 'MSFullscreenError', onfullscreenerror)
  }
}

function shim(el) {
  return (el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen);
}
