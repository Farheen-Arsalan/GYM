import { Component } from 'react'
import { RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('PulseFit crashed:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="grid min-h-[60vh] place-items-center p-6">
        <div className="glass max-w-md p-8 text-center">
          <p className="text-4xl">😵‍💫</p>
          <h2 className="mt-4 text-2xl font-bold">Whoa, we pulled a muscle.</h2>
          <p className="mt-2 text-muted">
            Something went wrong loading this screen. Your progress is safe — give it another rep.
          </p>
          <button className="btn-primary mt-6" onClick={() => this.setState({ error: null })}>
            <RefreshCw size={16} /> Try again
          </button>
        </div>
      </div>
    )
  }
}
