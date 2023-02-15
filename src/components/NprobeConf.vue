
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
			<Toggle v-model="nprobeSwitch" onLabel="On" offLabel="Off" @change="onServiceSwitchChange()" :class="{ 'toggle-red': nprobeEnabled && !nprobeActive }" />
		</div>
	</div>

	<div class="card-body">

		<!-- <p class="card-text">Sample text.</p>-->

		<div class="form-group" v-show="mode == 'probe'">
			<h5>Interface</h5>
			<Multiselect v-model="selectedInterfaces" :options="interfacesList" mode="single" :preselect-first="true" placeholder="Select the interfaces" :close-on-select="true" ref="interfaceMultiselect" @change="onConfigChange()" @select="onInterfaceSelect()" />
			<small class="form-text text-muted">Network interface used for packet capture.</small>
		</div>

		<div class="form-group" v-show="mode == 'collector'">
			<h5>Collection Port</h5>
			<input type="text" class="form-control" :class="{ 'border border-danger': invalidCollectionPort }" ref="flowCollectionPort" @change="onConfigChange()" />
			<small class="form-text text-muted">Netflow/sFlow collection port.</small>
		</div>

		<div class="form-group" v-show="mode != 'custom'">
			<h5>Flow Export to ntopng</h5>
			<Toggle v-model="flowExportSwitch" @change="onConfigChange()" />
		</div>

		<div class="form-floating collapse" :class="{ 'show': flowExportSwitch }">
			<div class="form-group" v-show="mode != 'custom'">
				<h5>Export Endpoint</h5>
				<input type="text" class="form-control" :class="{ 'border border-danger': invalidFlowExportEndpoint }" ref="flowExportEndpoint" @change="onConfigChange()" />
				<small class="form-text text-muted">Flow export endpoint (e.g. zmq://*:5556) to deliver flows to ntopng.</small>
			</div>
		</div>

		<div class="form-group" v-show="mode != 'custom'">
			<h5>NetFlow Export</h5>
			<Toggle v-model="collectorSwitch" @change="onConfigChange()" />
		</div>

		<div class="form-floating collapse" :class="{ 'show': collectorSwitch }">
			<div class="form-group" v-show="mode != 'custom'">
				<h5>NetFlow Collector</h5>
				<input type="text" class="form-control" :class="{ 'border border-danger': invalidCollector }" ref="collector" @change="onConfigChange()" />
				<small class="form-text text-muted">Collector address (e.g. 192.168.1.1:2055) to deliver NetFlow.</small>
			</div>

			<div class="form-group" v-show="mode != 'custom'">
				<h5>NetFlow Version</h5>
				<Multiselect v-model="selectedNetFlowVersion" :options="NetFlowVersions" mode="single" placeholder="Select the version" :close-on-select="true" ref="NetFlowVersionMultiselect" @change="onConfigChange()" />
				<small class="form-text text-muted"></small>
			</div>
		</div>


		<div class="form-group">
			<a class="btn" data-bs-toggle="collapse" href="#collapseAdvancedSettings" role="button" aria-expanded="false" aria-controls="collapseAdvancedSettings"><h5>Advanced Settings <font-awesome-icon icon="fa-solid fa-angle-down" /></h5></a>
			<div class="form-floating" :class="{ 'collapse': mode != 'custom' }" id="collapseAdvancedSettings">
				<textarea class="form-control input-textarea" placeholder="Advanced settings" id="advancedSettingsTextareaId" :class="{ 'big-input-textarea': mode == 'custom' }"  ref="advancedSettingsTextarea" @change="onConfigChange()"></textarea>
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

<Modal ref="createInterfaceModal">
	<template v-slot:title>
		Add Custom Interface
	</template>
	<template v-slot:body>
		<div class="form-group">
			<h5>Interface Name</h5>
			<input type="text" class="form-control" :class="{ 'border border-danger': interfaceModalInvalidInterfaceName }" ref="interfaceModalInterfaceName" @change="onInterfaceModalChange()" />
			<small class="form-text text-muted">Specify the name of the custom interface to be created.</small>
		</div>
	</template>
	<template v-slot:footer>
		<button class="btn btn-primary" @click="createInterface(); createInterfaceModal.close()" :disabled="!interfaceModalValidationOk">Create</button>
		<button class="btn btn-secondary" @click="createInterfaceModal.close()">Close</button>
	</template>
</Modal>

</div>

</template>

<script setup>
import { ref, onMounted, onBeforeMount, computed, watch } from "vue";
import { useToast } from "vue-toastification";
import { stubMode, isEndpoint, isIPPort, getLSBRelease, getNetworkInterfaces, isServiceActive, isServiceEnabled, toggleService, deleteService, restartService, readConfigurationFile, parseConfiguration, writeConfigurationFile, readMetadata, writeMetadata, deleteMetadata, deleteConfigurationFile, getRRDData, isValidInterfaceName } from "../functions";
import Multiselect from '@vueform/multiselect'
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
	},
	mode: {
		type: String,
		required: true
	}
})

const serviceName = "nprobe";

const customInterfaceLabel = "Add Custom Interface..";

/* Service status */
const nprobeActive = ref(false);
const nprobeEnabled = ref(false);
const nprobeSwitch = ref(false)

/* Empty configuration */
const selectedInterfaces = ref([]);
const localNetworks = ref([])
const selectedNetFlowVersion = ref([]);

/* Form data */
const interfaceMultiselect = ref(null);
const flowCollectionPort = ref(null)
const flowExportSwitch = ref(false)
const flowExportEndpoint = ref(null)
const collectorSwitch = ref(false)
const collector = ref(null)
const NetFlowVersionMultiselect = ref(null);
const advancedSettingsTextarea = ref(null);
const configChanged = ref(false)
const onApplyModal = ref(null)
const onDeleteModal = ref(null)

const validationOk = ref(true);
const invalidFlowExportEndpoint = ref(false)
const invalidCollectionPort = ref(false)
const invalidCollector = ref(false)

/* Custom Interface Modal Form */
const createInterfaceModal = ref(null)
const interfaceModalInterfaceName = ref(null)

const interfaceModalValidationOk = ref(true)
const interfaceModalInvalidInterfaceName = ref(false)

/* Data */
const interfacesList = ref([]);
const NetFlowVersions = ref(['5', '9', '10'])

/* Charts */
const chartsAvailable = ref(false);
const chart1Series = ref([{ name: 'Bytes', data: [] }])
const chart2Series = ref([{ name: 'Flows', data: [] }])

/* Update service switch state */
async function updateServiceSwitch() {
	/* Service status */
	if (stubMode()) {
		nprobeActive.value = true;
		nprobeEnabled.value = true;
	} else {
		nprobeActive.value = await isServiceActive(serviceName, props.name);
		nprobeEnabled.value = await isServiceEnabled(serviceName, props.name);
	}

	if (nprobeEnabled.value) {
		nprobeSwitch.value = true;
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
		if (props.mode == 'custom') {
			appendAdvancedSettings(option.name, option.value);
		} else {
			switch (option.name) {
				case '-i':
				case '--interface':
					if (option.value && option.value != 'none') {
						const found = interfacesList.value.find(ifname => ifname == option.value);
						if (!found) {
							/* Custom interface? Adding to the list.. */
							interfacesList.value.unshift(option.value);
						}
						selectedInterfaces.value.push(option.value);
					}
					break;
				case '-3':
				case '--collector-port':
					if (option.value && option.value != 'none') {
						flowCollectionPort.value.value = option.value;
					}
					break;
				case '-n':
				case '--collector':
					if (option.value && option.value != 'none') { 
						collectorSwitch.value = true;
						collector.value.value = option.value;
					}
					break;
				case '-V':
				case '--flow-version':
					if (option.value) { 
						selectedNetFlowVersion.value.push(option.value);
					}
					break;
				case '--zmq':
				case '--ntopng':
					if (option.value) {
						if (option.value.startsWith("tcp://") ||
						    option.value.startsWith("zmq://") ||
						    option.value.startsWith("kafka://")) {
							if (flowExportEndpoint.value.value) {
								appendAdvancedSettings(option.name, option.value);
							} else {
								flowExportSwitch.value = true;
								flowExportEndpoint.value.value = option.value;
							}
						}
					}
					break;
				default:
					appendAdvancedSettings(option.name, option.value);
					break;
			}
		}
	});

	/* Update configChanged with timeout to handle async updates triggering change event */
	setTimeout(() => (configChanged.value = false), 100);
}

/* Read configuration from the form */
function computeConfiguration() {
	let form_configuration = []

	const advanced_configuration = parseConfiguration(advancedSettingsTextarea.value.value);

	if (props.mode == 'probe') {
		if (selectedInterfaces.value) {
			form_configuration.push({ name: '-i', value: selectedInterfaces.value });
		}
	}

	if (props.mode == 'collector') {
		if (flowCollectionPort.value && flowCollectionPort.value.value) {
			form_configuration.push({ name: '-3', value: flowCollectionPort.value.value });
		}
	}

	if (props.mode != 'custom') {
		if (flowExportSwitch.value && flowExportEndpoint.value.value) {
			form_configuration.push({ name: '--ntopng', value: flowExportEndpoint.value.value });
			const templateDefined = advanced_configuration.find(element => element.name == '-T');
			if (!templateDefined) {
				form_configuration.push({ name: '-T', value: '@NTOPNG@' });
			}
		}

		if (collectorSwitch.value && collector.value.value) {
			form_configuration.push({ name: '--collector', value: collector.value.value });

			if (selectedNetFlowVersion.value && selectedNetFlowVersion.value != '') {
				form_configuration.push({ name: '-V', value: selectedNetFlowVersion.value });
			}
		}
	}

	const configuration = form_configuration.concat(advanced_configuration);

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

	let success = false;
	let message = "";

	if (stubMode()) {
		console.log(configuration);
	} else {
		try {
			await writeMetadata(serviceName, metadata, props.name);
			success = await writeConfigurationFile(serviceName, configuration, props.name);
		} catch (err) {
			if (err.message) {
				message = err.message;
			}
		}
	}

	if (success) {
		toast.success("Configuration saved!");

		/* Update configChanged with timeout to handle async updates triggering change event */
		setTimeout(() => (configChanged.value = false), 100);

		if (nprobeEnabled.value) {
			onApplyModal.value.show();
		}
	} else {
		toast.warning("Unable to write the configuration. " + message);
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
	let interface_names = []

	updateServiceSwitch();

	/* Read interfaces */
	if (stubMode()) {
		interface_names = ['eno1', 'eno2'];
	} else {
		let interfaces = await getNetworkInterfaces();
		interface_names = interfaces.map(info => info.name);
	}

	interface_names.push(customInterfaceLabel);

	interfacesList.value = interface_names
});

/* On service switch event: toggle service status */
function onServiceSwitchChange() {
	if (stubMode()) {
		console.log("Switching " + serviceName + " " + nprobeSwitch.value);
	} else {
		toggleService(serviceName, nprobeSwitch.value, props.name);
	}

	/* This is not required as there is a setInterval
	setTimeout(() => {
		updateServiceSwitch();
	}, 2000)
	*/
}

/* Called on form changes to validate the input */
function onConfigChange(e) {
	/* Use @change="event => onConfigChange(event)" to pass the event */
	/* if (e) { 
	 * 	console.log(e);
	 * 	console.log(e.target.value);
	 * } */

	/* Reset */
	invalidFlowExportEndpoint.value = false;
	invalidCollectionPort.value = false;
	invalidCollector.value = false;

	/* Validate */
	if (flowCollectionPort.value.value) {
		const port = flowCollectionPort.value.value;
		if (isNaN(port)) {
			invalidCollectionPort.value = true;
		}
	}

	if (flowExportSwitch.value) {
		const endpoint = flowExportEndpoint.value.value;
		if (endpoint && !isEndpoint(endpoint)) {
			invalidFlowExportEndpoint.value = true;
		}
	}

	if (collectorSwitch.value) {
		const address = collector.value.value;
		if (address && !isIPPort(address)) {
			invalidCollector.value = true;
		}
	}

	
	/* Update global validation flag */
	validationOk.value =
		!invalidFlowExportEndpoint.value &&
		!invalidCollectionPort.value &&
		!invalidCollector.value;

	/* Set config changed */
	configChanged.value = true;
}

/* Called on modal form change to validate the custom interface name */
function onInterfaceModalChange(e) {
	/* Reset */
	interfaceModalInvalidInterfaceName.value = false;

	/* Validate */
	const name = interfaceModalInterfaceName.value.value;
	if (name && !isValidInterfaceName(name)) {
		interfaceModalInvalidInterfaceName.value = true;
	}
	
	/* Update global validation flag */
	interfaceModalValidationOk.value = name && !interfaceModalInvalidInterfaceName.value;
}

/* Create a custom interface - called by the modal */
function createInterface() {
	const name = interfaceModalInterfaceName.value.value;
	const found = interfacesList.value.find(ifname => ifname == name);
	if (found) {
		toast.warning(name + " already present");
		return;
	}

	interfacesList.value.unshift(name);
	selectedInterfaces.value = name;

	/* Reset modal */
	interfaceModalInterfaceName.value.value = '';
}

/* Called on interface selected */
async function onInterfaceSelect(e) {
	if (selectedInterfaces.value == customInterfaceLabel) {
		selectedInterfaces.value = '';
		createInterfaceModal.value.show();
		return;
	}

	onConfigChange(e);
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
