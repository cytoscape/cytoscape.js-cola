# fullscreen

polyfill for requestFullscreen

```javascript

var fullscreen = require('fullscreen')
  , el = document.getElementById('element')
  , fs

fs = fullscreen(el)

el.addEventListener('click', function() {
  fs.request()
})

document.body.onkeydown = function() {
  fs.release()
}

fs.on('attain', function() {
  // attained fullscreen
})

fs.on('release', function() {
  // released fullscreen
})

fs.on('error', function() {
  // fullscreen request failed, or
  // fullscreen isn't supported
})

```

# API

## require('fullscreen').available() -> bool

return a boolean yes/no for whether fullscreen api is supported.

## require('fullscreen').enabled() -> bool

return a boolean yes/no for whether fullscreen is enabled for the document.

## fullscreen(element) -> fs event emitter

return a fullscreen event emitter object. if fullscreen is not
available, on the next turn of the event loop it'll emit `'error'`.

## fs.request() -> undefined

issue a request for fullscreen. if it's accepted, it emits `'attain'`, otherwise `'error'` for denial.

## fs.release() -> undefined

release the current fullscreen element. if the fullscreen is released, it emits `'release'`.

## fs.dispose() -> undefined

removes any event listeners created by the `fs` instance once you're done with it.

## fs.target() -> HTMLElement?

returns the current fullscreen target, if any.

# License

MIT
