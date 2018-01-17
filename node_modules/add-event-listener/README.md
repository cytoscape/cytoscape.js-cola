# add-event-listener

Add or remove event listeners in IE8+ / modern browsers.

```javascript
var events = require('add-event-listener')

var el = document.getElementById('#anything')

events.addEventListener(el, 'click', function(ev) {
  events.removeEventListener(el, 'click', arguments.callee)
})

// OR:
var add = require('add-event-listener')

add(el, 'click', function(ev) {

})

```

## API

### require('add-event-listener') -> `{addEventListener, removeEventListener}`
### require('add-event-listener') -> `Function addEventListener`

This package exports `addEventListener` (with a polyfill for `attachEvent`).

`addEventListener` and `removeEventListener` are available as properties on the export.

### addEventListener(element, eventName, listener, useCapture=false) -> undefined

Adds an event listener to an element. On IE&lt;9, uses `attachEvent`. **WARNING**: If `useCapture` is
true and this function is run on IE8, an exception will be thrown (since event capturing
cannot be emulated.)

### removeEventListener(element, eventName, listener, useCapture=false) -> undefined

Remove an event listener from an element.

## Meta

[MIT Licensed](LICENSE.mit)
