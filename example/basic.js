const Component = require('../')
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
