import { createApp } from 'vue'
import App from './App.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* FontAwesome icons */
import { faAngleDown, faDownload } from '@fortawesome/free-solid-svg-icons'
library.add(faAngleDown, faDownload)

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

import './assets/main.css'

createApp(App)
	.component('font-awesome-icon', FontAwesomeIcon)
	.mount('#app')

