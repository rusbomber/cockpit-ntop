
<template>

<nav class="navbar navbar-expand-lg navbar-light bg-light">
	<h3 class="product-name">{{ productName }}</h3>
	<div class="collapse navbar-collapse">
		<ul class="navbar-nav mr-auto">
			<li class="nav-item">
				<a class="nav-link" href="#" @click="createInstanceModal.show()">Add Instance</a>
			</li>
			<li class="nav-item" :class="{ 'active': tab == 'license'}">
				<a class="nav-link" href="#" @click="tab = 'license'">License</a>
			</li>
		</ul>
	</div>
</nav>

<div class="configuration">
	<LicenseConf :name="productName" v-show="tab == 'license'" />
</div>

<Modal ref="createInstanceModal">
	<template v-slot:title>
		Add {{ productName }} Instance
	</template>
	<template v-slot:body>

		<div class="form-group">
			<h5>Instance Name</h5>
			<input type="text" class="form-control" :class="{ 'border border-danger': invalidInstanceName }" ref="instanceName" @change="onConfigChange()" />
			<small class="form-text text-muted">Name for the new instance. Only letters and numbers are allowed.</small>
		</div>

		<div class="form-group">
			<h5>Mode</h5>
		</div>

		<div class="card w-100 wizard-card" :class="{ 'wizard-selected': instanceMode == 'probe' }">
			<a class="wizard-link" href="#" @click="instanceMode = 'probe'; onConfigChange()">
			<div class="card-body">
				<div class="form-group wizard-form-group">
					<h5>Probe</h5>
					<small class="form-text text-muted">Capture traffic from a Network interface (mirror).</small>
				</div>
			</div>
			</a>
		</div>

		<div class="card w-100 wizard-card" :class="{ 'wizard-selected': instanceMode == 'collector' }">
			<a class="wizard-link" href="#" @click="instanceMode = 'collector'; onConfigChange()">
			<div class="card-body">	
				<div class="form-group wizard-form-group">
					<h5>Collector</h5>
					<small class="form-text text-muted">Collect Netflow from a router or switch.</small>
				</div>
			</div>
			</a>
		</div>

		<div class="card w-100 wizard-card" :class="{ 'wizard-selected': instanceMode == 'custom' }">
			<a class="wizard-link" href="#" @click="instanceMode = 'custom'; onConfigChange()">
			<div class="card-body">	
				<div class="form-group wizard-form-group">
					<h5>Custom</h5>
					<small class="form-text text-muted">Advanced - create a configuration from scratch.</small>
				</div>
			</div>
			</a>
		</div>

	</template>
	<template v-slot:footer>
		<button class="btn btn-primary" @click="createInstance(); createInstanceModal.close()" :disabled="!validationOk">Create</button>
		<button class="btn btn-secondary" @click="createInstanceModal.close()">Close</button>
	</template>
</Modal>

</template>

<script setup>
import { ref, onMounted, onBeforeMount, computed, watch } from "vue";
import Modal from './Modal.vue'
import LicenseConf from './LicenseConf.vue'

const productName = ref("nprobe")
const tab = ref("configuration")

const createInstanceModal = ref(null)

const instanceMode = ref("")

const instanceName = ref(null)
const validationOk = ref(false);
const invalidInstanceName = ref(false)

function isValidInstanceName(str) {
	var pattern = new RegExp('^([a-z\\d-]*[a-z\\d])*$','i');
	return pattern.test(str);
}

function onConfigChange(e) {
	/* Use @change="event => onConfigChange(event)" to pass the event */
	/* if (e) { 
	 * 	console.log(e);
	 * 	console.log(e.target.value);
	 * } */

	/* Reset */
	invalidInstanceName.value = false;

	/* Validate */
	const name = instanceName.value.value;
	if (name && !isValidInstanceName(name)) {
		invalidInstanceName.value = true;
	}
	
	/* Update global validation flag */
	validationOk.value = name && instanceMode.value && !invalidInstanceName.value;
}

function createInstance() {

}
</script>
