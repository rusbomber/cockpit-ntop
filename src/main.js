import { createApp } from 'vue'
import App from './App.vue'

import VueApexCharts from "vue3-apexcharts";

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* FontAwesome icons */
import { faAngleDown, faDownload, faDesktop, faEthernet, faBezierCurve, faFileLines, faPlus, faCircleCheck, faUserCheck, faSpinner, faTrash, faHourglassStart, faMagnifyingGlass, faFilter, faFolderOpen, faScroll, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
library.add(faAngleDown, faDownload, faDesktop, faEthernet, faBezierCurve, faFileLines, faPlus, faCircleCheck, faUserCheck, faSpinner, faTrash, faHourglassStart, faMagnifyingGlass, faFilter, faFolderOpen, faScroll, faTriangleExclamation)

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

import './assets/main.css'

createApp(App)
	.use(VueApexCharts)
	.component('font-awesome-icon', FontAwesomeIcon)
	.mount('#app')
