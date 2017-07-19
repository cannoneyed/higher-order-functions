import createRouter from 'router5'
import loggerPlugin from 'router5/plugins/logger'
import listenersPlugin from 'router5/plugins/listeners'
import browserPlugin from 'router5/plugins/browser'
import { getPixelFromHash } from 'utils/hash'

const routes = [
  { name: 'default', path: '/' },
  { name: 'hash', path: '/:hash' },
]

export default function configureRouter(useListenersPlugin = false) {
  const router = createRouter(routes, {
    defaultRoute: 'inbox',
  })
    // Plugins
    .usePlugin(loggerPlugin)
    .usePlugin(browserPlugin())

  if (useListenersPlugin) {
    router.usePlugin(listenersPlugin())
  }

  router.canActivate('hash', _router => (toState, fromState) => {
    const hashPixel = getPixelFromHash(toState.params.hash)
    if (!hashPixel) {
      return Promise.reject({ redirect: { name: 'default' } })
    }
    return true
  })

  router.canActivate('default', _router => (toState, fromState) => {
    return true
  })

  return router
}
