
<template>

<div class="chart-box" v-show="chartsAvailable">
	<div class="row">
		<div class="col-sm">
			<TSChart height="120px" name="Traffic Rate" :series="chart1Series" unit="bps"></TSChart>
		</div>
		<div class="col-sm">
			<TSChart height="120px" name="Flow Export Rate" :series="chart2Series" unit="fps"></TSChart>
		</div>
	</div>
</div>

<div class="configuration">
<div class="card w-100">
	<div class="card-header">
		<div class="card-title">
			<h3>{{ label }} Instance</h3>
		</div>
		<div class="service-switch">
			<Toggle v-model="centoSwitch" onLabel="On" offLabel="Off" @change="onServiceSwitchChange()" :class="{ 'toggle-red': centoEnabled && !centoActive }" />
		</div>
	</div>

	<div class="card-body">
		<div class="form-group">
			<a class="btn" data-bs-toggle="collapse" href="#collapseAdvancedSettings" role="button" aria-expanded="false" aria-controls="collapseAdvancedSettings"><h5>Advanced Settings <font-awesome-icon icon="fa-solid fa-angle-down" /></h5></a>
			<div class="form-floating" id="collapseAdvancedSettings">
				<textarea class="form-control input-textarea big-input-textarea" placeholder="Advanced settings" id="advancedSettingsTextareaId"  ref="advancedSettingsTextarea" @change="onConfigChange()"></textarea>
				<label for="advancedSettingsTextareaId">key = value</label>
			</div>
		</div>

	</div>

	<div class="card-footer">
		<div class="d-grid gap-2 d-md-flex justify-content-md-end">
			<button class="btn btn-danger" @click="onDeleteModal.show();">Delete Instance</button>
			<button class="btn btn-primary" @click="saveConfiguration()" :disabled="!configChanged || !validationOk">Save Configuration</button>
		</div>
	</div>
</div>

<Modal ref="onDeleteModal">
	<template v-slot:title>
		Delete {{ name }} Instance
	</template>
	<template v-slot:body>
		Are you sure you want to delete this {{ serviceName }} instance and its configuration?
	</template>
	<template v-slot:footer>
		<button class="btn btn-primary" @click="deleteConfiguration(); onDeleteModal.close()">Confirm</button>
		<button class="btn btn-secondary" @click="onDeleteModal.close()">Close</button>
	</template>
</Modal>

<Modal ref="onApplyModal">
	<template v-slot:title>
		{{ serviceName }} is running
	</template>
	<template v-slot:body>
		The configuration has been modified while {{ serviceName }} was running, please restart the service to apply the changes.
	</template>
	<template v-slot:footer>
		<button class="btn btn-primary" @click="restartService(serviceName, name); onApplyModal.close()">Restart</button>
		<button class="btn btn-secondary" @click="onApplyModal.close()">Close</button>
	</template>
</Modal>

</div>

</template>

<script setup>
import { ref, onMounted, onBeforeMount } from "vue";
import { useToast } from "vue-toastification";
import { stubMode, isEndpoint, isIPPort, getNetworkInterfaces, isServiceActive, isServiceEnabled, toggleService, deleteService, restartService, readConfigurationFile, parseConfiguration, writeConfigurationFile, readMetadata, writeMetadata, deleteMetadata, deleteConfigurationFile, getRRDData, isValidInterfaceName } from "../functions";
import Toggle from '@vueform/toggle'
import Modal from './Modal.vue'
import TagInput from "./TagInput.vue";
import TSChart from './TSChart.vue'

const toast = useToast();

/* 
 * Component parameters
 * Types: String, Object, Number, Boolean, Array
 * Print with console.logs(props.name);
 */
const props = defineProps({
	name: {
		type: String,
		required: true
	},
	label: {
		type: String,
		required: true
	}
})

const serviceName = "cento";

const customInterfaceLabel = "Add Custom Interface..";

/* Service status */
const centoActive = ref(false);
const centoEnabled = ref(false);
const centoSwitch = ref(false)

/* Empty configuration */
const advancedSettingsTextarea = ref(null);

/* Modal changes */
const configChanged = ref(false)
const onApplyModal = ref(null)
const onDeleteModal = ref(null)

const validationOk = ref(true);

const interfaceModalValidationOk = ref(true)
const interfaceModalInvalidInterfaceName = ref(false)

/* Charts */
const chartsAvailable = ref(false);
const chart1Series = ref([{ name: 'Bytes', data: [] }])
const chart2Series = ref([{ name: 'Flows', data: [] }])

/* Update service switch state */
async function updateServiceSwitch() {
	/* Service status */
	if (stubMode()) {
		centoActive.value = true;
		centoEnabled.value = true;
	} else {
		centoActive.value = await isServiceActive(serviceName, props.name);
		centoEnabled.value = await isServiceEnabled(serviceName, props.name);
	}

	if (centoEnabled.value) {
		centoSwitch.value = true;
	}

}

/* Add setting to the advanced text area */
function appendAdvancedSettings(name, value) {
	advancedSettingsTextarea.value.value += name;
	if (value)
		advancedSettingsTextarea.value.value += '=' + value;
	advancedSettingsTextarea.value.value += '\n';
}

/* Load configuration from file */
async function loadConfiguration() {
	let configuration = [];
	let metadata = {};

	/* Read configuration file, if any */
	if (stubMode()) {
		configuration = [ 
			{ name: '-i', value: 'eno1' }, 
			{ name: '--ntopng', value: 'zmq://*:5556' } 
		];
	} else { 
		metadata = await readMetadata(serviceName, props.name);
		configuration = await readConfigurationFile(serviceName, props.name);

		if (metadata.mode) {
			props.mode = metadata.mode;
		}
	}

	if (!props.mode) {
		props.mode = 'custom';
	}

	configuration.forEach(function (option) {
		appendAdvancedSettings(option.name, option.value);
	});

	/* Update configChanged with timeout to handle async updates triggering change event */
	setTimeout(() => (configChanged.value = false), 100);
}

/* Read configuration from the form */
function computeConfiguration() {
	const configuration = parseConfiguration(advancedSettingsTextarea.value.value);

	return configuration;
}

/* Compute configuration metadata */
function computeMetadata() {
	let metadata = {};
	metadata.mode = props.mode;
	return metadata;
}

/* Save configuration to file */
async function saveConfiguration() {
	const configuration = computeConfiguration();
	const metadata = computeMetadata();

	if (stubMode()) {
		console.log(configuration);
	} else {
		await writeConfigurationFile(serviceName, configuration, props.name);
		await writeMetadata(serviceName, metadata, props.name);
	}

	/* Update configChanged with timeout to handle async updates triggering change event */
	setTimeout(() => (configChanged.value = false), 100);

	toast.success("Configuration saved!");

	if (centoEnabled.value) {
		onApplyModal.value.show();
	}
}

/* Delete instance configuration */
async function deleteConfiguration() {
	deleteService(serviceName, props.name);
	deleteMetadata(serviceName, props.name);
	deleteConfigurationFile(serviceName, props.name);
	location.reload();
}

/* Before mount: initialize configuration */
onBeforeMount(async () => {
	updateServiceSwitch();
});

/* On service switch event: toggle service status */
function onServiceSwitchChange() {
	if (stubMode()) {
		console.log("Switching " + serviceName + " " + centoSwitch.value);
	} else {
    if(props.name == '')
      props.name = null

		toggleService(serviceName, centoSwitch.value, props.name);
	}
}

/* Called on form changes to validate the input */
function onConfigChange(e) {
	/* Set config changed */
	configChanged.value = true;
}

/* Update timeseries charts */
async function updateCharts() {
	let data = await getRRDData(serviceName, props.name, 10 /* last 10 minutes */);

	if (data && 
	    data['receivedBytes'] &&
	    data['receivedBytes'].length > 1 &&
	    data['receivedPkts'] &&
	    data['receivedPkts'].length > 1) {
		/*
		 * Available RRDs:
		 * receivedPkts
		 * filteredPkts
		 * receivedBytes
		 * droppedPkts
		 * exportedFlows
		 */

		chart1Series.value[0].data = data['receivedBytes'];
		chart2Series.value[0].data = data['exportedFlows'];

		chartsAvailable.value = true;
	}
}

/* On mount: load configuration from file */
onMounted(async () => {
	await loadConfiguration();

	setInterval(() => {
		updateServiceSwitch();
	}, 2000)

	updateCharts();
	setInterval(() => {
		updateCharts();
	}, 5000)
});

</script>

<style src="@vueform/multiselect/themes/default.css"></style>
<style src="@vueform/toggle/themes/default.css"></style>
