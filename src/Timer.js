import React from 'react'
import observe from './observe'

const Timer = ({ value }) => <p>Timer: {value}</p>

// This is used to build props coming from the observable. In this case, just
// retain the `value`.
const mapEmitToProps = ({ value }) => ({ value })

export default observe(mapEmitToProps)(Timer)
