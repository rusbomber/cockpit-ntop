
<template>

<div class="configuration">

<div class="card w-100">
	<div class="card-header">
		<div class="card-title">
			<h3>Notifications</h3>
		</div>
	</div>

	<div class="card-body">

		<!-- <p class="card-text">Sample text.</p>-->

		<div class="form-group">
			<h5>Enable Notifications</h5>
			<Toggle v-model="alertsSwitch" @change="onConfigChange()" />
		</div>

		<div class="form-group">
			<h5>Verbosity</h5>
			<Multiselect v-model="verbosityLevel" mode="single" ref="verbosityMultiselect" @change="onConfigChange()" :options="[
			{ value: 'all', label: 'All Events' },
			{ value: 'failures', label: 'Failures Only' },
		]" />
			<small class="form-text text-muted">Verbosity level to select events to be notified.</small>
		</div>
		
		<div class="form-floating">
			<div class="form-group">
				<h5>Webhook URL</h5>
				<input type="text" class="form-control" :class="{ 'border border-danger': invalidWebhookURL }" ref="webhookURL" @change="onConfigChange()" />
				<small class="form-text text-muted">Webhook URL for delivering events (e.g. https://www.example.com/service/status/callback)</small>
			</div>
		</div>

		<div class="form-floating">
			<div class="form-group">
				<h5>Remote Syslog Server</h5>
				<input type="text" class="form-control" :class="{ 'border border-danger': invalidSyslogAddr }" ref="syslogAddr" @change="onConfigChange()" />
				<small class="form-text text-muted">Address of a remote Syslog server (or <a href="https://www.ntop.org/guides/ntopng/advanced_features/syslog.html" target="_blank">ntopng</a>) for delivering alerts via TCP (e.g. 192.168.1.1:514)</small>
			</div>
		</div>

	</div>

	<div class="card-footer">
		<div class="d-grid gap-2 d-md-flex justify-content-md-end">
			<button class="btn btn-primary" @click="saveConfiguration()" :disabled="!configChanged || !validationOk">Save Configuration</button>
		</div>
	</div>
</div>

</div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount, computed, watch } from "vue";
import { useToast } from "vue-toastification";
import Multiselect from '@vueform/multiselect'
import Toggle from '@vueform/toggle'
import Modal from './Modal.vue'
import { stubMode, getLSBRelease, isURL, isIPPort, readSettings, writeSettings } from "../functions";

const toast = useToast();

/* 
 * Component parameters
 * Types: String, Object, Number, Boolean, Array
 * Print with console.logs(props.name);
 */
const props = defineProps({
})

/* Empty configuration */
const verbosityLevel = ref("all");

/* Form data */
const webhookURL = ref(null)
const syslogAddr = ref(null)
const verbosityMultiselect = ref(null);
const alertsSwitch = ref(false)
const configChanged = ref(false)

const validationOk = ref(true);
const invalidWebhookURL = ref(false)
const invalidSyslogAddr = ref(false)

async function loadConfiguration() {

	/* Read configuration file, if any */

	let configuration = {};

	if (stubMode()) {
		configuration = {
			enabled: true,
			verbosity: 'failures',
			webhook: {
				url: 'https://www.example.com/service/status/callback'
			}
		};
	} else { 
		configuration = await readSettings("notifications");
		//console.log(configuration);
	}

	if (configuration['enabled']) {
		alertsSwitch.value = configuration['enabled'];
	}

	if (configuration['verbosity']) {
		verbosityMultiselect.value.select(configuration['verbosity']);
	}

	if (configuration['webhook']) {
		if (configuration['webhook']['url']) {
			webhookURL.value.value = configuration['webhook']['url'];
		}
	}

	if (configuration['syslog']) {
		if (configuration['syslog']['address']) {
			syslogAddr.value.value = configuration['syslog']['address'];
		}
	}

	/* Update configChanged with timeout to handle async updates triggering change event */
	setTimeout(() => (configChanged.value = false), 100);
}

function computeConfiguration() {
	let form_configuration = {};

	form_configuration['enabled'] = alertsSwitch.value;

	form_configuration['verbosity'] = verbosityLevel.value;

	form_configuration['webhook'] = {
		url: webhookURL.value.value
	}

	form_configuration['syslog'] = {
		address: syslogAddr.value.value
	}

	return form_configuration;
}

async function saveConfiguration() {
	const configuration = computeConfiguration()

	let success = false;
	let message = "";

	if (stubMode()) {
		console.log(configuration);
	} else {
		try {
			success = await writeSettings("notifications", configuration);
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
	} else {
		toast.warning("Unable to write the configuration. " + message);
	}
}

/* Before mount */
onBeforeMount(async () => {
});

function onConfigChange(e) {
	/* Use @change="event => onConfigChange(event)" to pass the event */
	/* if (e) { 
	 * 	console.log(e);
	 * 	console.log(e.target.value);
	 * } */

	/* Reset */
	invalidWebhookURL.value = false;
	invalidSyslogAddr.value = false;

	/* Validate */
	const endpoint = webhookURL.value.value;
	if (endpoint && !isURL(endpoint)) {
		invalidWebhookURL.value = true;
	}

	const addr = syslogAddr.value.value;
	if (addr && !isIPPort(addr)) {
		invalidSyslogAddr.value = true;
	}

	/* Update global validation flag */
	validationOk.value = !invalidWebhookURL.value && !invalidSyslogAddr.value;

	/* Set config changed */
	configChanged.value = true;
}

/* On mount: load configuration from file */
onMounted(async () => {
	await loadConfiguration();
});

</script>

<style src="@vueform/multiselect/themes/default.css"></style>
<style src="@vueform/toggle/themes/default.css"></style>
