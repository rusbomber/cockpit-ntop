import { createApp } from 'vue'
import App from './App.vue'

import VueApexCharts from "vue3-apexcharts";

import Toast, { POSITION } from "vue-toastification";

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* FontAwesome icons */
import { faAngleDown, faDownload, faDesktop, faEthernet, faBezierCurve, faFileLines, faPlus, faCircleCheck, faUserCheck, faSpinner, faTrash, faHourglassStart, faMagnifyingGlass, faFilter, faFolderOpen, faScroll, faFileCirclePlus, faFileWaveform, faIdCard, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
library.add(faAngleDown, faDownload, faDesktop, faEthernet, faBezierCurve, faFileLines, faPlus, faCircleCheck, faUserCheck, faSpinner, faTrash, faHourglassStart, faMagnifyingGlass, faFilter, faFolderOpen, faScroll, faFileCirclePlus, faFileWaveform, faIdCard, faTriangleExclamation)

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

import "vue-toastification/dist/index.css";

import './assets/main.css'

const toastOptions = { 
	position: POSITION.TOP_RIGHT,
	timeout: 2000
}

createApp(App)
	.use(VueApexCharts)
	.use(Toast, toastOptions)
	.component('font-awesome-icon', FontAwesomeIcon)
	.mount('#app')
