import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import { Provider } from 'mobx-react'
import { injectGlobal } from 'styled-components'

import colors from 'constants/colors'

injectGlobal`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Ubuntu Mono', monospace;
    color: ${colors[0]}
  }
`

ReactDOM.render(
  <Provider>
    <App />
  </Provider>,
  document.getElementById('root'),
)
