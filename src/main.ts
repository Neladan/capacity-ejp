import { createApp } from 'vue'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import '@fontsource/lora/400-italic.css'
import './styles/tokens.css'
import './styles/base.css'
import App from './App.vue'
import { router } from './router'

createApp(App).use(router).mount('#app')
