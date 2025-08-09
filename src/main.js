// import { createApp } from 'vue'
// import './style.css'
import App from './App.vue'
import router from './router'
import 'primeicons/primeicons.css'
import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice'
import Toast from 'primevue/toast'
import Aura from '@primeuix/themes/aura';
import Ripple from 'primevue/ripple'
import { createPinia } from 'pinia';
import { i18n } from './i18n'
import ConfirmationService from 'primevue/confirmationservice'


const pinia = createPinia();
const app = createApp(App);

app.use(ToastService)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.use(ConfirmationService)
app.use(router)

app.component('Toast', Toast)
app.directive('ripple', Ripple) 

app.use(pinia);
app.use(i18n)

app.mount('#app')