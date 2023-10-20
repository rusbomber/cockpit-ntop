
<template>

<div class="configuration">

<div class="card w-100">
	<div class="card-header">
		<div class="card-title">
			<h3>{{ name }} Instance</h3>
		</div>
		<div class="service-switch">
			<button class="btn btn-default" title="Open ntopng" @click="openNtopng()" :disabled="!(ntopngEnabled && ntopngActive)"><font-awesome-icon icon="fa-solid fa-desktop" /></button>
			<Toggle v-model="ntopngSwitch" onLabel="On" offLabel="Off" @change="onServiceSwitchChange()" :class="{ 'toggle-red': ntopngEnabled && !ntopngActive, 'toggle-yellow': ntopngSwitch && !ntopngEnabled && !ntopngActive }" />
		</div>
	</div>

	<div class="card-body">

		<!-- <p class="card-text">Sample text.</p>-->

		<div class="form-group">
			<h5>Interfaces</h5>
			<Multiselect v-model="selectedInterfaces" :options="interfacesList" mode="tags" placeholder="Select the interfaces" :close-on-select="false" ref="interfaceMultiselect" @change="onConfigChange()" @select="onInterfaceSelect()" />
			<small class="form-text text-muted">Network interfaces used for packet capture.</small>
		</div>

		<div class="form-group">
			<h5>Local Networks</h5>
			<TagInput v-model="localNetworks" @change="onConfigChange()" ref="localNetworksInput" />
			<small class="form-text text-muted">Local networks in CIDR format (e.g. 192.168.1.0/24) used to identify local hosts.</small>
		</div>

		<div class="form-group" v-if="!isEdge">
			<h5>DNS Mode</h5>
			<Multiselect v-model="dnsMode" mode="single" ref="dnsModeMultiselect" @change="onConfigChange()" :options="[
			{ value: '0', label: 'Decode DNS responses and resolve local numeric IPs only' },
			{ value: '1', label: 'Decode DNS responses and resolve all numeric IPs' },
			{ value: '2', label: 'Decode DNS responses but do not resolve numeric IPs' },
			{ value: '3', label: 'Do not decode DNS/MDNS/HTTP/TLS responses and do not resolve numeric IPs (all hosts)' },
			{ value: '4', label: 'Do not decode DNS/MDNS/HTTP/TLS responses and do not resolve numeric IPs (localhost only)' },
		]" />
			<small class="form-text text-muted">Address resolution mode used for displaying host names.</small>
		</div>

		<div class="form-group" v-if="!isEdge">
			<h5>Flow Collection</h5>
			<Toggle v-model="flowCollectionSwitch" @change="onConfigChange()" />
		</div>
		
		<div class="form-floating collapse" :class="{ 'show': flowCollectionSwitch }">
			<div class="form-group">
				<h5>Collection Endpoint</h5>
				<input type="text" class="form-control" :class="{ 'border border-danger': invalidFlowCollectionEndpoint }" ref="flowCollectionEndpoint" @change="onConfigChange()" />
				<small class="form-text text-muted">Flow collection endpoint (e.g. zmq://127.0.0.1:5556 or kafka://192.168.1.1) to receive flows from nProbe.</small>
			</div>
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
			<button class="btn btn-primary" @click="saveConfiguration()" :disabled="!isAdministrator || !configChanged || !validationOk">Save Configuration</button>
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
import Multiselect from '@vueform/multiselect'
import Toggle from '@vueform/toggle'
import Modal from './Modal.vue'
import TagInput from "./TagInput.vue";
import { stubMode, isEndpoint, getLSBRelease, getNetworkInterfaces, isServiceActive, isServiceEnabled, toggleService, restartService, readConfigurationFile, parseConfiguration, writeConfigurationFile, isValidInterfaceName } from "../functions";

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
	isEdge: {
		type: Boolean,
		required: true
	}
})

const serviceName = "ntopng";

const customInterfaceLabel = "Add Custom Interface..";

const isAdministrator = ref(false);

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
const flowCollectionSwitch = ref(false)
const flowCollectionEndpoint = ref(null)
const advancedSettingsTextarea = ref(null);
const configChanged = ref(false)
const onApplyModal = ref(null)
const collapseEndpoint = ref(null)

const validationOk = ref(true);
const invalidFlowCollectionEndpoint = ref(false)

/* Custom Interface Modal Form */
const createInterfaceModal = ref(null)
const interfaceModalInterfaceName = ref(null)

const interfaceModalValidationOk = ref(true)
const interfaceModalInvalidInterfaceName = ref(false)

/* Data */
const interfacesList = ref([]);

/* Update service switch state */
async function updateServiceSwitch() {
	/* Service status */
	if (stubMode()) {
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

function appendAdvancedSettings(name, value) {
	advancedSettingsTextarea.value.value += name;
	if (value)
		advancedSettingsTextarea.value.value += '=' + value;
	advancedSettingsTextarea.value.value += '\n';
}

async function loadConfiguration() {

	/* Read interfaces */

	let interface_names = []

	if (stubMode()) {
		interface_names = ['eno1', 'eno2'];
	} else {
		let interfaces = await getNetworkInterfaces();
		interface_names = interfaces.map(info => info.name);
	}

	interface_names.push(customInterfaceLabel);

	interfacesList.value = interface_names

	/* Read configuration file, if any */

	let configuration = []

	if (stubMode()) {
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
				if (option.value) {
					if (option.value.startsWith("tcp://") ||
					    option.value.startsWith("zmq://") ||
					    option.value.startsWith("kafka://")) {
						if (flowCollectionEndpoint.value.value) {
							appendAdvancedSettings(option.name, option.value);
						} else {
							flowCollectionSwitch.value = true;
							flowCollectionEndpoint.value.value = option.value;
						}
					} else {
						const found = interfacesList.value.find(ifname => ifname == option.value);
						if (!found) {
							/* Custom interface? Adding to the list.. */
							interfacesList.value.unshift(option.value);
						}

						selectedInterfaces.value.push(option.value);
						/* Note that the below is not working in Cockpit: 
						 * interfaceMultiselect.value.select(option.value); */
					}
				}
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

	if (localNetworks.value.length > 0) {
		form_configuration.push({ name: '-m', value: localNetworks.value.join(',') });
		//console.log(localNetworks.value.join(','));
	}

	if (flowCollectionSwitch.value && flowCollectionEndpoint.value) {
		form_configuration.push({ name: '-i', value: flowCollectionEndpoint.value.value });
	}

	const advanced_configuration = parseConfiguration(advancedSettingsTextarea.value.value);

	const configuration = form_configuration.concat(advanced_configuration);

	return configuration
}

async function saveConfiguration() {
	const configuration = computeConfiguration()

	let success = false;
	let message = "";

	if (stubMode()) {
		console.log(configuration);
	} else {
		try {
			success = await writeConfigurationFile(serviceName, configuration);
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

		if (ntopngEnabled.value) {
			onApplyModal.value.show();
		}
	} else {
		toast.warning("Unable to write the configuration. " + message);
	}
}

/* Before mount */
onBeforeMount(async () => {

	if (stubMode()) {
		isAdministrator.value = true;
	} else {
		let permission = cockpit.permission({ admin: true });
		permission.addEventListener("changed", function() {
			isAdministrator.value = permission.allowed ? true : false;
		})
	}

	updateServiceSwitch();
});

/* On service switch event: toggle service status */
function onServiceSwitchChange() {

	if (!isAdministrator.value) {
		toast.warning("User is not allowed to toggle services.");
		ntopngSwitch.value = !ntopngSwitch.value;
		return;
	}

	if (stubMode()) {
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

function onConfigChange(e) {
	/* Use @change="event => onConfigChange(event)" to pass the event */
	/* if (e) { 
	 * 	console.log(e);
	 * 	console.log(e.target.value);
	 * } */

	/* Reset */
	invalidFlowCollectionEndpoint.value = false;

	/* Validate */
	if (flowCollectionSwitch.value) {
		const endpoint = flowCollectionEndpoint.value.value;
		if (endpoint && !isEndpoint(endpoint)) {
			invalidFlowCollectionEndpoint.value = true;
		}
	}
	
	/* Update global validation flag */
	validationOk.value = !invalidFlowCollectionEndpoint.value;

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
	selectedInterfaces.value.push(name);

	/* Reset modal */
	interfaceModalInterfaceName.value.value = '';
}

/* Called on interface selected */
async function onInterfaceSelect(e) {
	const custom_selected = selectedInterfaces.value.find(ifname => ifname == customInterfaceLabel);
	if (custom_selected) {
		selectedInterfaces.value = selectedInterfaces.value.filter(function(ifname) { return ifname !== customInterfaceLabel })
		createInterfaceModal.value.show();
		return;
	}

	onConfigChange(e);
}

/* On mount: load configuration from file */
onMounted(async () => {
	await loadConfiguration();

	setInterval(() => {
		updateServiceSwitch();
	}, 2000)
});

function openNtopng() {
	const hostname = location.hostname;
	const url = 'http://' + hostname + ':3000';
	window.open(url, '_blank').focus();
}

</script>

<style src="@vueform/multiselect/themes/default.css"></style>
<style src="@vueform/toggle/themes/default.css"></style>
