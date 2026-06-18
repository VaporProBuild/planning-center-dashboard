// Polyfill for oidc-client-ts metrics reporting
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof window !== 'undefined' && !(window as any).__chromium_devtools_metrics_reporter) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).__chromium_devtools_metrics_reporter = () => {
    // No-op polyfill
  }
}

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
