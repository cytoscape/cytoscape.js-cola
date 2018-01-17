var test = require('tape')

var events = require('./index.js')
  , remove
  , add

add = events.addEventListener
remove = events.removeEventListener

test(function(assert) {
  var el = document.createElement('div')
    , triggered = 0

  document.body.appendChild(el)

  add(el, 'click', onclick)
  trigger()

  function onclick(ev) {
    ++triggered
    assert.equal(triggered, 1)

    if(triggered !== 1) {
      return
    }

    add(document.body, 'click', afterclick)
    remove(el, 'click', onclick)

    trigger()
  }

  function afterclick() {
    assert.end()
  }

  function trigger() {
    document.createEvent ? createEvent() : createEventObject()
  }

  function createEvent() {
    var ev = document.createEvent('MouseEvents')

    ev.initMouseEvent(
        'click'
      , true
      , true
      , window
      , 1
      , 100
      , 100
      , 100
      , 100
      , false
      , false
      , false
      , 1
      , null
    )

    el.dispatchEvent(ev)
  }

  function createEventObject() {
    var ev = document.createEventObject()

    el.fireEvent('onclick', ov)
  }
})
