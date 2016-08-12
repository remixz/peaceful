/**
 * Peaceful - A React-like stateful component class built around morphdom.
 * @author Zach Bruggeman <mail@bruggie.com>
 */

var update = require('morphdom')
var deepEqual = require('deep-equal')
var onload = require('on-load')
var defaultEvents = require('./update-events.js')

// event copying code from https://github.com/maxogden/yo-yo/blob/72e1162dc1657cbd85c3712b0eb496234206b671/index.js#L18-L33
function onBeforeElUpdated (f, t) {
  if (f.__PEACEFUL_INSTANCE__ && t.__PEACEFUL_INSTANCE__) {
    var fromInstance = f.__PEACEFUL_INSTANCE__
    var toInstance = t.__PEACEFUL_INSTANCE__

    if (!deepEqual(fromInstance.props, toInstance.props)) {
      fromInstance._componentWillReceiveProps(toInstance.props)
    }
  }

  // copy events
  defaultEvents.forEach(function (ev) {
    if (t[ev]) { // if new element has a whitelisted attribute
      f[ev] = t[ev] // update existing element
    } else if (f[ev]) { // if existing element has it and new one doesnt
      f[ev] = undefined // remove it from existing element
    }
  })
  // copy onload attributes
  // without this, when an element changes it'll call the unmount function
  var onloadAttrs = Array.from(f.attributes).filter(function (attr) { return attr.name.indexOf('data-onload') > -1 })
  onloadAttrs.forEach(function (attr) { return t.setAttribute(attr.name, attr.value) })
  // copy values for form elements
  if ((f.nodeName === 'INPUT' && f.type !== 'file') || f.nodeName === 'TEXTAREA' || f.nodeName === 'SELECT') {
    if (t.getAttribute('value') === null) t.value = f.value
  }
}

// taken from https://github.com/patrick-steele-idem/morphdom/blob/dd1d8c1261086ca36d9fbf6948d713662d1963b4/src/index.js#L32-L46
var range
function toElement (str) {
  if (!range && document.createRange) {
    range = document.createRange()
    range.selectNode(document.body)
  }

  var fragment
  if (range && range.createContextualFragment) {
    fragment = range.createContextualFragment(str)
  } else {
    fragment = document.createElement('body')
    fragment.innerHTML = str
  }
  return fragment.childNodes[0]
}

var PeacefulComponent = function PeacefulComponent (props) {
  this.props = props
  this.state = {}
  this.element = null
}

PeacefulComponent.prototype.render = function render () {
  throw new Error('A render() function was not defined on the instance. You must define a render() function that returns an Element, or a string of HTML that can be parsed into an Element.')
}

PeacefulComponent.prototype.mount = function mount (toString) {
  if (!this.element) {
    this.componentWillMount()
    this.element = this._render(toString)
    if (!toString) {
      onload(this.element, this.componentDidMount.bind(this), this.componentWillUnmount.bind(this))
    }
  }

  return this.element
}

PeacefulComponent.prototype.setState = function setState (nextState) {
  if (this._noState) throw new Error('setState cannot be used inside of componentWillUpdate.')
  this._shouldUpdate = this.shouldComponentUpdate(this.props, nextState)
  this._update(this.props, nextState)
}

PeacefulComponent.prototype.componentWillMount = function componentWillMount () {}
PeacefulComponent.prototype.componentDidMount = function componentDidMount () {}
PeacefulComponent.prototype.componentWillReceiveProps = function componentWillReceiveProps () {}
PeacefulComponent.prototype.shouldComponentUpdate = function shouldComponentUpdate () { return true }
PeacefulComponent.prototype.componentWillUpdate = function componentWillUpdate () {}
PeacefulComponent.prototype.componentDidUpdate = function componentDidUpdate () {}
PeacefulComponent.prototype.componentWillUnmount = function componentWillUnmount () {}

PeacefulComponent.prototype._render = function _render (toString) {
  var element = this.render()

  if (toString) {
    return element.toString()
  }

  if (typeof element === 'string') {
    element = toElement(element)
  }

  if (!(element instanceof window.Element)) {
    throw new Error('render() must return an Element, or a string of HTML that parses into an Element.')
  }

  element.__PEACEFUL_INSTANCE__ = this

  return element
}

PeacefulComponent.prototype._componentWillReceiveProps = function _componentWillReceiveProps (nextProps) {
  this._shouldUpdate = false
  this.componentWillReceiveProps(nextProps)
  this._shouldUpdate = this.shouldComponentUpdate(nextProps, this.state)
  this._update(nextProps, this.state)
}

PeacefulComponent.prototype._update = function _update (nextProps, nextState) {
  var prevProps = this.props
  this.props = Object.assign(this.props, nextProps)
  var prevState = this.state
  this.state = Object.assign(this.state, nextState)

  if (!this._shouldUpdate || !this.element) return

  this._noState = true
  this.componentWillUpdate(this.props, this.state)
  this._noState = false
  var newElement = this._render()
  update(this.element, newElement, {
    onBeforeElUpdated: onBeforeElUpdated
  })
  this.componentDidUpdate(prevProps, prevState)
}

module.exports = PeacefulComponent
