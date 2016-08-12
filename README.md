# Peaceful

[![npm version](https://img.shields.io/npm/v/peaceful.svg?maxAge=2592000)](https://www.npmjs.com/package/peaceful)
[![Code Style: Standard](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
![Stability: Experimental](https://img.shields.io/badge/stability-experimental-orange.svg)

A React-like stateful component class, with DOM updating powered by [morphdom](https://github.com/patrick-steele-idem/morphdom). Small, fast, flexible. *Namaste.*

Best paired with [bel](https://github.com/shama/bel) for creating elements.

## Example

Run `npm run example:basic` to see this in action:
```js
const Component = require('peaceful')
const bel = require('bel')

class Hello extends Component {
  constructor (props = { thing: 'world' }) {
    super(props)
    this.state = {
      thing: this.props.thing.charAt(0).toUpperCase() + this.props.thing.slice(1)
    }
  }

  componentDidMount () {
    this.timer = setInterval(() => {
      this.setState({
        thing: this.state.thing + '!'
      })
    }, 1000)
  }

  componentWillUnmount () {
    clearInterval(this.timer)
  }

  render () {
    return bel`
      <h1> Hello, ${this.state.thing}!</h1>
    `
  }
}

const helloInternet = new Hello({ thing: 'internet' })
document.body.appendChild(helloInternet.mount())
```

## Installation & Compatibility

```
npm install peaceful --save
```

In the browser, this module should be compatible with all of the evergreen browsers. The module itself, although designed to be consumed with ES2015 features like classes and template strings, is written with ES5 to avoid a compilation step. For Internet Explorer or other older browsers, you'll need to include a shim for some ES2015 additions, such as `Object.assign` and `Array.from`. You can use a module like [core-js](https://github.com/zloirock/core-js) to do this. If you use babel in your project, you could also just include the babel-polyfill module.

On the server, Node.js 4.0+ is supported.

## Usage

Until there's better usage docs, [the example](#example) will have to do. Mostly, this module follows React's ES2015 component structure, so take a look at [the React docs for classes](https://facebook.github.io/react/docs/reusable-components.html#es6-classes) to start with. Instead of `defaultProps`, just use the ES2015 default params, as shown in the example above. `propTypes` aren't a thing with this module. `setState` is also synchronous instead of asynchronous as it is in React, but you likely used `setState` like it was synchronous anyway. Don't worry, I did too. :wink:

As well, Peaceful components implement all of [React's lifecycle events](https://facebook.github.io/react/docs/component-specs.html#lifecycle-methods), so you can use those in the same way as you would with React. Some notes:

* If you have a Peaceful component as a child of another component, the child component will run `componentWillMount` every time the parent component updates. There's unfortunately no way around this, since `morphdom` has to create the component once to figure out what's changed. If you're using ES2015 classes though, you should probably just move anything in a `componentWillMount` to the `constructor`, since it's essentially the same thing. It'll be run every time the parent component updates as well, due to the aforementioned `morphdom` mechanic.
* Child components will only run the `componentWillReceiveProps` if the props have changed.

## Inspiration

I'd recently been using [yo-yo](https://github.com/maxogden/yo-yo) for some prototyping, and it just felt so nice to use. I really liked not having to set up a whole compilation environment to get things working, especially since Chrome supports pretty much all the ES2015 features now. I could just run my code without any struggle! I think with all of the complication we have now around web development, we kind of forget how things used to be.

In any case, I wanted to start using it a bit more seriously, and for that, I needed some state management. I looked into using [choo](https://github.com/yoshuawuyts/choo), which I thought was really well made, and overall was a great inspiration. However, I didn't really need any sort of routing, and all the subscriptions and reducers and effects stuff isn't how I generally think while doing web development. It's not that they're hard or bad, I'm just stubborn... Took me a while before I really "got" React too and started following its conventions without despising it. At this point, I really do like the React API, especially with the ES2015 classes (that definitely helped me embrace it).

So, I wrote a small wrapper for my project around `yo-yo` to create components that stored state, and implement a `setState` similar to React. It worked really well! Not only did it feel comfortable to me, it was also much simpler than React, but still did everything I needed it to do. Soon, I needed some lifecycle events, and now... here we are. :smile:

## Tutorial

**WIP**

### Introduction

Peaceful implements an API similar to React's ES2015 component classes. Peaceful doesn't intend to implement every feature from React exactly, but the code should be very familiar if you've ever created a React component using classes.

Start by extending the export from Peaceful, like so:

```js
const Component = require('peaceful')

class Example extends Component {
  // ...
}
```

Like a React component, every Peaceful component must define a `render()` function. This function must return an element, or a HTML string. (Note: It must return only one root element, similar to React.) The recommended and supported way to do this is to use [bel](https://github.com/shama/bel):

```js
const Component = require('peaceful')
const bel = require('bel')

class Example extends Component {
  render () {
    return bel`<h1> Hello! </h1>`
  }
}
```

`bel` uses tagged template strings to construct elements. This lets you create HTML in a way similar to JSX, but without having to use a compiler to make it work in the browser. You'll need to install this module separately from Peaceful, by doing `npm install bel --save`.

However, if `bel` isn't quite your style, you can use any module or library that returns elements or HTML strings. This means you could use a library like jQuery (`return $('.selector')[0]`), or even templating libraries like Handlebars or underscore/lodash templates. It's up to you!

Let's say we're finished with our component for now. Now we just need to create an instance of it, and attach it to the DOM.

```js
// ...

const exampleElement = new Example()
document.body.appendChild(exampleElement.mount())
```

Instead of doing something like `React.createElement(Example, // ...)`, or using JSX to create the element, we just do the plain-old JS way and create a new instance of our class. From there, to get an actual element, instead of doing something like `ReactDOM.render(<Example />, document.body)`, we use the vanilla JS method of `appendChild`, and call `mount()` on the `exampleElement` we created. `mount()` is unique to Peaceful, and creates the element we append to our body, along with starting the component lifecycle events, which we'll get to soon. If we wanted to add it to a container element like `<div id="root"></div>`, we could do something like:

```js
// ...

const exampleElement = new Example()
const container = document.querySelector('#root')
container.appendChild(exampleElement.mount())
```

Great job! You've created a very simple component using Peaceful. However, if your element is just static content, this is probably a bit overkill. You could just use `bel` directly, and append it to the DOM! Let's make something with some state.

#### Final Code

```js
const Component = require('peaceful')
const bel = require('bel')

class Example extends Component {
  render () {
    return bel`<h1> Hello! </h1>`
  }
}

const exampleElement = new Example()
document.body.appendChild(exampleElement.mount())
```

### Props and State

*TODO: Finish this tutorial...*
