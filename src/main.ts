import { createApp } from 'vue'
import '@/assets/styles/index.scss'
import App from './App.vue'
import { setupRouter } from '@/router/index'

declare global {
    interface Window {
        mapboxgl?: any
    }
}

const demo = createApp(App)
setupRouter(demo)
demo.mount('#app')

