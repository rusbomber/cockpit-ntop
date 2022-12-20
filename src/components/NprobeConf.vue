
<template>

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

		<div class="form-group">
			<h5>Interface</h5>
			<Multiselect v-model="selectedInterfaces" :options="interfacesList" mode="single" placeholder="Select the interfaces" :close-on-select="false" ref="interfaceMultiselect" @change="onConfigChange()" />
			<small class="form-text text-muted">Network interface used for packet capture.</small>
		</div>

		<div class="form-group">
			<a class="btn" data-bs-toggle="collapse" href="#collapseAdvancedSettings" role="button" aria-expanded="false" aria-controls="collapseAdvancedSettings"><h5>Advanced Settings <font-awesome-icon icon="fa-solid fa-angle-down" /></h5></a>
			<div class="form-floating collapse" id="collapseAdvancedSettings">
				<textarea class="form-control" placeholder="Advanced settings" id="advancedSettingsTextareaId" style="height: 100px" ref="advancedSettingsTextarea" @change="onConfigChange()"></textarea>
				<label for="advancedSettingsTextareaId">key = value</label>
			</div>
		</div>

	</div>

	<div class="card-footer">
		<div class="d-grid gap-2 d-md-flex justify-content-md-end">
			<button class="btn btn-primary" @click="saveConfiguration()" :disabled="!configChanged || !validationOk">Save Configuration</button>
		</div>
	</div>
</div>

<Modal ref="onApplyModal">
	<template v-slot:title>
		{{ serviceName }} is running
	</template>
	<template v-slot:body>
		The configuration has been modified while {{ serviceName }} was running, please restart the service to apply the changes.
	</template>
	<template v-slot:footer>
		<button class="btn btn-primary" @click="restartService(serviceName); onApplyModal.close()">Restart</button>
		<button class="btn btn-secondary" @click="onApplyModal.close()">Close</button>
	</template>
</Modal>
</div>

</template>

<script setup>
import { ref, onMounted, onBeforeMount, computed, watch } from "vue";
import Multiselect from '@vueform/multiselect'
import Toggle from '@vueform/toggle'
import Modal from './Modal.vue'
import TagInput from "./TagInput.vue";
import { stubMode, getLSBRelease, getNetworkInterfaces, isServiceActive, isServiceEnabled, toggleService, restartService, readConfigurationFile, parseConfiguration, writeConfigurationFile } from "../functions";

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

const serviceName = "nprobe";

/* Service status */
const nprobeActive = ref(false);
const nprobeEnabled = ref(false);
const nprobeSwitch = ref(false)

/* Empty configuration */
const selectedInterfaces = ref([]);
const localNetworks = ref([])
const dnsMode = ref("0");

/* Form data */
const interfaceMultiselect = ref(null);
const dnsModeMultiselect = ref(null);
const localNetworksInput = ref(null)
const advancedSettingsTextarea = ref(null);
const configChanged = ref(false)
const onApplyModal = ref(null)
const collapseEndpoint = ref(null)

const validationOk = ref(true);

/* Data */
const interfacesList = ref([]);

/* Update service switch state */
async function updateServiceSwitch() {
	/* Service status */
	if (stubMode()) {
		nprobeActive.value = true;
		nprobeEnabled.value = true;
	} else {
		nprobeActive.value = await isServiceActive(serviceName);
		nprobeEnabled.value = await isServiceEnabled(serviceName);
	}

	if (nprobeEnabled.value) {
		nprobeSwitch.value = true;
	}

}

function appendAdvancedSettings(name, value) {
	advancedSettingsTextarea.value.value += name;
	if (value)
		advancedSettingsTextarea.value.value += '=' + value;
	advancedSettingsTextarea.value.value += '\n';
}

async function loadConfiguration() {
	let configuration = []

	/* Read configuration file, if any */
	if (stubMode()) {
		configuration = [ 
			{ name: '-i', value: 'eno1' } 
		]
	} else { 
		configuration = await readConfigurationFile(serviceName, props.name);
		console.log(configuration);
	}

	configuration.forEach(function (option) {
		switch (option.name) {
			case '-i':
			case '--interface':
				if (option.value) {
					selectedInterfaces.value.push(option.value);
				}
				break;
			default:
				appendAdvancedSettings(option.name, option.value);
				break;
		}
	});

	/* Update configChanged with timeout to handle async updates triggering change event */
	setTimeout(() => (configChanged.value = false), 100);
}

function computeConfiguration() {
	let form_configuration = []

	selectedInterfaces.value.forEach(function (if_name) {
		form_configuration.push({ name: '-i', value: if_name });
	});

	const advanced_configuration = parseConfiguration(advancedSettingsTextarea.value.value);

	const configuration = form_configuration.concat(advanced_configuration);

	return configuration
}

async function saveConfiguration() {
	const configuration = computeConfiguration()

	if (stubMode()) {
		console.log(configuration);
	} else {
		await writeConfigurationFile(serviceName, configuration);
	}

	/* Update configChanged with timeout to handle async updates triggering change event */
	setTimeout(() => (configChanged.value = false), 100);

	if (nprobeEnabled.value) {
		onApplyModal.value.show();
	}
}

/* Before mount: initialize configuration */
onBeforeMount(async () => {
	let interface_names = []

	updateServiceSwitch();

	/* Read interfaces */
	if (stubMode()) {
		interface_names = ['eno1'];
	} else {
		let interfaces = await getNetworkInterfaces();
		interface_names = interfaces.map(info => info.name);
	}
	interfacesList.value = interface_names
});

/* On service switch event: toggle service status */
function onServiceSwitchChange() {
	if (stubMode()) {
		console.log("Switching " + serviceName + " " + nprobeSwitch.value);
	} else {
		toggleService(serviceName, nprobeSwitch.value);
	}

	/* This is not required as there is a setInterval
	setTimeout(() => {
		updateServiceSwitch();
	}, 2000)
	*/
}

function onConfigChange(e) {
	/* Use @change="event => onConfigChange(event)" to pass the event */
	/* if (e) { 
	 * 	console.log(e);
	 * 	console.log(e.target.value);
	 * } */

	/* Update global validation flag */
	validationOk.value = true;

	/* Set config changed */
	configChanged.value = true;
}

/* On mount: load configuration from file */
onMounted(async () => {
	await loadConfiguration();

	setInterval(() => {
		updateServiceSwitch();
	}, 2000)
});

</script>

<style src="@vueform/multiselect/themes/default.css"></style>
<style src="@vueform/toggle/themes/default.css"></style>
