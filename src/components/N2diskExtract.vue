
<template>

<div class="configuration">

<!-- Scheduled Jobs Table -->
<div class="card w-100">
	<div class="card-header">
		<div class="card-title">
			<h3>Extractions</h3>
		</div>
		<div class="service-switch">
			<a class="nav-link" href="#" @click="createJobModal.show()"><h3><font-awesome-icon icon="fa-solid fa-plus" class="" title="Add Job" /></h3></a>
		</div>
	</div>

	<div class="card-body">
		<DataTable :data="jobsTableData" :columns="jobsTableColumns" :options="jobsTableOptions" class="table table-hover table-striped" width="100%">
			<thead>
				<tr>
					<th>ID</th>
					<th>Status</th>
					<th>Priority</th>
					<th>Creation Date</th>
					<th>Info</th>
					<th>Actions</th>
				</tr>
			</thead>
		</DataTable>
	</div>
</div>

<!-- Datatable icons -->
<div class="d-none" id="icon-processing"><font-awesome-icon icon="fa-solid fa-spinner"      class="rotate" /></div>
<div class="d-none" id="icon-done"      ><font-awesome-icon icon="fa-solid fa-circle-check" /></div>
<div class="d-none" id="icon-processed" ><font-awesome-icon icon="fa-solid fa-user-check"   /></div>
<div class="d-none" id="icon-delete"    ><font-awesome-icon icon="fa-solid fa-trash"        /></div>

<!--  New Job Modal -->
<Modal ref="createJobModal">
	<template v-slot:title>
		Schedule Extraction
	</template>
	<template v-slot:body>

		<div class="form-group">
			<h5>Source Storage</h5>
			<Multiselect v-model="selectedTimelines" :options="timelinesList" mode="tags" :preselect-first="false" placeholder="Select the source timeline folders" :close-on-select="false" ref="timelineMultiselect" :class="{ 'border border-danger': invalidTimelines }" @change="onConfigChange()" />
			<small class="form-text text-muted">Source timeline folders from which packets are extracted.</small>
		</div>

		<div class="form-group">
			<h5>Time Interval</h5>
			<Datepicker v-model="timeInterval" model-type="timestamp" range enable-seconds format="dd/MM/yyyy HH:mm:ss" :clearable="false" required :class="{ 'border border-danger': invalidTimeInterval }" @change="onConfigChange()" @update:modelValue="onConfigChange" />
			<small class="form-text text-muted">Time interval for traffic extraction from the dump set.</small>
		</div>

		<div class="form-group">
			<h5>Filter</h5>
			<input type="text" class="form-control" :class="{ 'border border-danger': invalidFilter }" ref="bpfFilter" placeholder="e.g. host 192.168.1.1" @change="onConfigChange()" />
			<small class="form-text text-muted"><a href="https://www.ntop.org/guides/n2disk/filters.html" class="description-link" target="_blank">BPF-like filter</a> for selecting packets to be extracted.</small>
		</div>

		<div class="form-group">
			<h5>Output Folder</h5>
			<input type="text" class="form-control" :class="{ 'border border-danger': invalidStoragePath }" ref="storagePath" placeholder="e.g. /storage" @change="onConfigChange()" />
			<small class="form-text text-muted">Folder where extracted PCAP files are stored.</small>
		</div>

		<div class="form-group">
			<h5>Max File Size</h5>
			<Slider v-model="fileSize" :format="formatSize" :min="minFileSize" :max="maxFileSize" :step="stepFileSize" ref="fileSizeSlider" @change="onConfigChange()" />
			<small class="form-text text-muted">Maximum size for produced PCAP files.</small>
		</div>

	</template>
	<template v-slot:footer>
		<button class="btn btn-primary" @click="addJob(); createJobModal.close()" :disabled="!validationOk">Create</button>
		<button class="btn btn-secondary" @click="createJobModal.close()">Close</button>
	</template>
</Modal>

<Modal ref="onDeleteModal">
	<template v-slot:title>
		Delete Extraction
	</template>
	<template v-slot:body>
		Are you sure you want to delete this extraction?
	</template>
	<template v-slot:footer>
		<button class="btn btn-primary" @click="deleteJob(); onDeleteModal.close()">Confirm</button>
		<button class="btn btn-secondary" @click="onDeleteModal.close()">Close</button>
	</template>
</Modal>

</div><!-- configuration -->

</template>

<script setup>
import { ref, onMounted, onBeforeMount, computed, watch } from "vue";
import { stubMode, isEndpoint, isIPPort, getLSBRelease, getNetworkInterfaces, isServiceActive, isServiceEnabled, toggleService, deleteService, restartService, readConfigurationFile, parseConfiguration, writeConfigurationFile, readMetadata, writeMetadata, deleteMetadata, deleteConfigurationFile, getRRDData, isValidPath, isValidFilter, createPath } from "../functions";
import Multiselect from '@vueform/multiselect'
import Slider from '@vueform/slider'
import Toggle from '@vueform/toggle'
import Modal from './Modal.vue'
import TagInput from "./TagInput.vue";
import Datepicker from '@vuepic/vue-datepicker';
import DataTable from 'datatables.net-vue3'
import DataTablesLib from 'datatables.net';
import moment from "moment";

import '@vuepic/vue-datepicker/dist/main.css';
 
DataTable.use(DataTablesLib);

/* 
 * Component parameters
 * Types: String, Object, Number, Boolean, Array
 * Print with console.logs(props.name);
 */
const props = defineProps({
})

/* Scheduled Jobs Table */
const jobsTableData = ref([]);

const jobsTableOptions = ref({
	searching: false,
	paging: false,
	autoWidth: false,
});

function getIcon(name) {
	return document.getElementById("icon-" + name).innerHTML;
}

const jobsTableColumns = ref([
	{
		data: 'id',
	},
	{
		data: 'status',
	},
	{
		data: 'priority',
	},
	{
		data: 'creation',
		render: function (data, type) {
			if (type === 'display') {
				return moment.unix(data).format('DD/MM/YYYY HH:mm:ss');
			}
			return data;
		},
	},
	{
		data: 'info',
	},
	{
		data: 'actions',
		render: function (data, type) {
			if (type === 'display') {
				return getIcon("delete");
			}
			return data;
		},
	}
]);

/* New Job Modal */

const createJobModal = ref(null)

const initialTimeInterval = [
	Date.now() - (5*60*1000),
	Date.now()
];

/* Empty configuration */
const fileSize = ref(64);
const minFileSize = ref(64);
const maxFileSize = ref(4096);
const stepFileSize = ref(64);
const selectedTimelines = ref([]);

/* Form data */
const timeInterval = ref(initialTimeInterval);
const timelineMultiselect = ref(null);
const fileSizeSlider = ref(null);
const storagePath = ref(null)
const bpfFilter = ref(null)
const configChanged = ref(false)
const onApplyModal = ref(null)
const onDeleteModal = ref(null)

const validationOk = ref(true);
const invalidTimelines = ref(false)
const invalidStoragePath = ref(false)
const invalidFilter = ref(false)
const invalidTimeInterval = ref(false);

/* Data */
const timelinesList = ref([]);

function formatSize(value) {
	if (value >= 1024)
		return (Math.round((value/1024)*100)/100) + " GB";
	else
		return Math.round(value) + " MB";
}

async function addJob() {
	//TODO
}

async function deleteJob() {
	//TODO
}

async function updateJobs() {
	//TODO
}

/* Before mount: initialize configuration */
onBeforeMount(async () => {
	let timeline_paths = []

	/* Read timelines */
	if (stubMode()) {
		timeline_paths = ['/storage/n2disk/eno1', '/storage/n2disk/eno2'];
	} else {
		let timelines = [] //TODO await getTimelines();
		timeline_paths = timelines.map(info => info.name);
	}
	timelinesList.value = timeline_paths
});

function onConfigChange(e, checkEmpty) {
	/* Reset */
	invalidTimelines.value = false;
	invalidStoragePath.value = false;
	invalidFilter.value = false;
	invalidTimeInterval.value = false;

	/* Validate */
	const interval = timeInterval.value;
	if (interval.length != 2 ||
		!interval[0] ||
		!interval[1]) {
		invalidTimeInterval.value = true;
	}

	const timelinePaths = selectedTimelines.value;
	if (checkEmpty && timelinePaths.length < 1) {
		invalidTimelines.value = true;
	}

	if (timelinePaths.length >= 1 && !storagePath.value.value) {
		storagePath.value.value = timelinePaths[0];
	}

	const path = storagePath.value.value;
	if ((checkEmpty && !path) || (path && !isValidPath(path))) {
		invalidStoragePath.value = true;
	}

	const filter = bpfFilter.value.value;
	if (filter && !isValidFilter) {
		invalidFilter.value = true;
	}

	/* Update global validation flag */
	validationOk.value =
		!invalidStoragePath.value &&
		!invalidFilter.value &&
		!invalidTimeInterval.value &&
		!invalidTimelines.value;

	/* Set config changed */
	configChanged.value = true;
}

/* On mount: load configuration from file */
onMounted(async () => {
	if (stubMode()) {
		jobsTableData.value = [
			{
				id: "1",
				status: "Done",
				priority: "Normal",
				creation: 1634914146,
				info: "BPF = \"ip host 192.168.1.195 and ip host 192.168.1.97 and port 443\"",
				actions: ""
			},
			{
				id: "2",
				status: "Done",
				priority: "Normal",
				creation: 1634914147,
				info: "BPF = \"ip host 192.168.1.195\"",
				actions: ""
			},
		];
	} else {
		updateJobs();
		setInterval(() => {
			updateJobs();
		}, 5000)
	}
});

</script>

<style src="@vueform/multiselect/themes/default.css"></style>
<style src="@vueform/toggle/themes/default.css"></style>
<style src="@vueform/slider/themes/default.css"></style>
<style>
@import 'datatables.net-bs5';
</style>
