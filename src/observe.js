import React from 'react'

// The idea is that we want to keep the usual React flow and allow some components
// to listen to observables. The way it's done here, there is nothing "magic" about the obervable
// components. They are just decorated with an observable map function and the decorated component
// is automatically refreshed when the observable emits. That means that the decorated component
// is a normal component that may (or may not) have his lifecycle methods for example.
// It does not need to be aware of the observable.
//
// The management of the observables are out of the scope of this library and it is up to the
// user how to handle that. You could have a single observable emitting a full app state (ala redux)
// and then filter on what you want to retain.
// You could have separate observables for specific topics and have few components subscribing to
// each of them. That's really up to you.
//
// A note about component updates: there are two ways to avoid wasteful updates:
// * you could implement `shouldComponentUpdate` in your components
// * you could make sure the observable you subscribe to emits distinct values (see rx operators for that)
// I feel like the second option is cleaner, since we rely on observable anyway, but maybe in practice
// the best approach is a mixture of both. As usual, test different approches and see what works best for
// the usecase.

/**
 * Subscribes a component state to an observable. There is a check to fail early.
 * Errors are put in the state as well so that the component gets the option to handle them.
 *
 * @return the observable subscription
 */
export const subscribe = (component, obs) => {
  if (!obs.subscribe) console.error(`obs needs to be an observable, got '${obs}' instead`)
  return obs.subscribe(
    emitProps => component.setState({ emitProps }),
    err => component.setState({ err }),
  )
}

/**
 * Decorator enabling a component to subscribe to an observer. This allows decoupling
 * the details of the subscription from the component that actually passes down the observable.
 * It expects a mapping function that's litteraly mapped onto the observable and
 * a component that will receive the emitted (and mapped) values of the observable.
 *
 * @return a Component factory producing components subscribed to an observable.
 */
const observe = (mapEmitToProps) => (Component) =>
  class LiftedComponent extends React.Component {
    constructor (props) {
      super(props)
      // We'll be keeping the observable values in the state to re-render on each emission
      this.state = { emitProps: {} }
      // We'll need to reuse this, so let's bind it
      this.subscribe = subscribe.bind(null, this)
    }
    render () {
      const { err, emitProps } = this.state
      if (err) {
        // Naive error handling
        return (
          <b>{err}</b>
        )
      }
      return (
        <Component {...emitProps}/>
      )
    }
    componentWillMount () {
      const { observable } = this.props
      // This will be needed for a clean unsubscribe
      this.subscription = this.subscribe(observable.map(mapEmitToProps))
    }
    // Clean up the subscription when the component unmounts
    componentWillUnmount () {
      this.subscription.unsubscribe()
      this.subscription = null
    }
    // When receiving the props, if the observable is different, re-setup the subscription.
    componentWillReceiveProps (nextProps) {
      if (nextProps.observable !== this.props.observable) {
        this.subscription.unsubscribe()
        this.subscription = this.subscribe(nextProps.observable)
      }
    }
  }

export default observe
