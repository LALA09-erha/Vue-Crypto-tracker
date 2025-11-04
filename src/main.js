import { createApp } from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.css'

// Hide loading screen when app is mounted
const hideLoadingScreen = () => {
    const loadingElement = document.getElementById('app-loading')
    if (loadingElement) {
        loadingElement.style.opacity = '0'
        setTimeout(() => {
            loadingElement.style.display = 'none'
        }, 500)
    }
}

const app = createApp(App)
app.mount('#app')

// Hide loading screen after mount
app.config.globalProperties.$nextTick(() => {
    hideLoadingScreen()
})

// Fallback: hide loading screen after 3 seconds
setTimeout(hideLoadingScreen, 3000)