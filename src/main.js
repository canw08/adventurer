// import { createApp } from 'vue'
// import './style.css'
import App from './App.vue'
import router from './router'
import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice'
import Toast from 'primevue/toast'
import Aura from '@primeuix/themes/aura';

import ConfirmationService from 'primevue/confirmationservice'

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

app.mount('#app')