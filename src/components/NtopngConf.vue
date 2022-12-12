
<template>

<div class="configuration">
<div class="card w-100">
	<div class="card-header">
		<div class="card-title">
			<h3>{{ name }} Instance</h3>
		</div>
		<div class="service-switch">
			<button class="btn btn-default" title="Open ntopng" @click="openNtopng()" :disabled="!(ntopngEnabled && ntopngActive)"><font-awesome-icon icon="fa-solid fa-desktop" /></button>
			<Toggle v-model="ntopngSwitch" onLabel="On" offLabel="Off" @change="onServiceSwitchChange()" :class="{ 'toggle-red': ntopngEnabled && !ntopngActive }" />
		</div>
	</div>

	<div class="card-body">

		<!-- <p class="card-text">Sample text.</p>-->

		<div class="form-group">
			<h5>Interfaces</h5>
			<Multiselect v-model="selectedInterfaces" :options="interfacesList" mode="tags" placeholder="Select the interfaces" :close-on-select="false" ref="interfaceMultiselect" @change="onConfigChange()" />
			<small class="form-text text-muted"></small>
		</div>

		<div class="form-group">
			<h5>Local Networks</h5>
			<TagInput v-model="localNetworks" @change="onConfigChange()" ref="localNetworksInput" />
			<small class="form-text text-muted"></small>
		</div>

		<div class="form-group">
			<h5>DNS Mode</h5>
			<Multiselect v-model="dnsMode" mode="single" ref="dnsModeMultiselect" @change="onConfigChange()" :options="[
			{ value: '0', label: 'Decode DNS responses and resolve local numeric IPs only' },
			{ value: '1', label: 'Decode DNS responses and resolve all numeric IPs' },
			{ value: '2', label: 'Decode DNS responses but do not resolve numeric IPs' },
			{ value: '3', label: 'Do not decode DNS/MDNS/HTTP/TLS responses and do not resolve numeric IPs (all hosts)' },
			{ value: '4', label: 'Do not decode DNS/MDNS/HTTP/TLS responses and do not resolve numeric IPs (localhost only)' },
		]" />
			<small class="form-text text-muted"></small>
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
			<button class="btn btn-primary" @click="saveConfiguration()" :disabled="!configChanged">Save Configuration</button>
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
import { getLSBRelease, getNetworkInterfaces, isServiceActive, isServiceEnabled, toggleService, restartService, readConfigurationFile, parseConfiguration, writeConfigurationFile } from "../functions";

/* 
 * Component parameters
 * Types: String, Object, Number, Boolean, Array
 * Print with console.logs(props.name);
 */
const props = defineProps({
	name: {
		type: String,
		required: true
	}
})

const serviceName = "ntopng";

/* Service status */
const ntopngActive = ref(false);
const ntopngEnabled = ref(false);
const ntopngSwitch = ref(false)

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

/* Development*/
const stubMode = false;

/* Data */
const interfacesList = ref([]);
let persistentConfiguration = [];

/* Update service switch state */
async function updateServiceSwitch() {
	/* Service status */
	if (stubMode) {
		ntopngActive.value = true;
		ntopngEnabled.value = true;
	} else {
		ntopngActive.value = await isServiceActive(serviceName);
		ntopngEnabled.value = await isServiceEnabled(serviceName);
	}

	if (ntopngEnabled.value) {
		ntopngSwitch.value = true;
	}

}

async function loadConfiguration() {
	let configuration = []

	/* Read configuration file, if any */
	if (stubMode) {
		configuration = [ 
			{ name: '-i', value: 'eno1' }, 
			{ name: '-n', value: '2' }, 
			{ name: '-w', value: '3000' },
			{ name: '-m', value: '192.168.1.0/24,192.168.2.0/24'},
			{ name: '--community' } 
		]
	} else { 
		configuration = await readConfigurationFile(serviceName);
		//console.log(configuration);
	}

	configuration.forEach(function (option) {
		switch (option.name) {
			case '-i':
			case '--interface':
				if (option.value)
					selectedInterfaces.value.push(option.value);
					/* Note that the below is not working in Cockpit: 
					 * interfaceMultiselect.value.select(option.value); */
				break;
			case '-n':
			case '--dns-mode':
				if (option.value)
					dnsModeMultiselect.value.select(option.value);
				break;
			case '-m':
			case '--local-networks':
				if (option.value) {
					const networks = option.value.split(',');
					networks.forEach(function (network) {
						localNetworksInput.value.addTag(network);
					});
				}
				break;
			default:
				advancedSettingsTextarea.value.value += option.name;
				if (option.value)
					advancedSettingsTextarea.value.value += '=' + option.value;
				advancedSettingsTextarea.value.value += '\n';
				break;
		}
	});

	persistentConfiguration = configuration;
	configChanged.value = false;
}

function computeConfiguration() {
	let form_configuration = []

	selectedInterfaces.value.forEach(function (if_name) {
		form_configuration.push({ name: '-i', value: if_name });
	});

	if (localNetworks.value.length > 0) {
		form_configuration.push({ name: '-m', value: localNetworks.value.join(',') });
		console.log(localNetworks.value.join(','));
	}

	const advanced_configuration = parseConfiguration(advancedSettingsTextarea.value.value);

	const configuration = form_configuration.concat(advanced_configuration);

	return configuration
}

async function saveConfiguration() {
	const configuration = computeConfiguration()

	if (stubMode) {
		console.log(configuration);
	} else {
		await writeConfigurationFile(serviceName, configuration);
	}

	persistentConfiguration = configuration;
	configChanged.value = false;

	if (ntopngEnabled.value) {
		onApplyModal.value.show();
	}
}

/* Before mount: initialize configuration */
onBeforeMount(async () => {
	let interface_names = []

	updateServiceSwitch();

	/* Read interfaces */
	if (stubMode) {
		interface_names = ['eno1', 'eno2'];
	} else {
		let interfaces = await getNetworkInterfaces();
		interface_names = interfaces.map(info => info.name);
	}
	interfacesList.value = interface_names
});

/* On service switch event: toggle service status */
function onServiceSwitchChange() {
	if (stubMode) {
		console.log("Switching " + serviceName + " " + ntopngSwitch.value);
	} else {
		toggleService(serviceName, ntopngSwitch.value);
	}

	/* This is not required as there is a setInterval
	setTimeout(() => {
		updateServiceSwitch();
	}, 2000)
	*/
}

function onConfigChange() {
	configChanged.value = true;
}

function openNtopng() {
	const hostname = location.hostname;
	const url = 'http://' + hostname + ':3000';
	window.open(url, '_blank').focus();
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
