
<template>

<nav class="navbar navbar-expand-lg navbar-light bg-light">
	<h3 class="product-name">{{ productLabel }}</h3>
	<div class="collapse navbar-collapse">
		<ul class="navbar-nav mr-auto">
			<li v-for="instance in instances" class="nav-item" :class="{ 'active': tab == instance.name}">
				<a class="nav-link" href="#" @click="tab = instance.name">{{ instance.name }}</a>
			</li>
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
	<template  v-for="instance in instances" >
		<NprobeConf :name="instance.name" v-if="tab == instance.name" />
	</template>
	<LicenseConf :name="productName" :label="productLabel" v-show="tab == 'license'" />
</div>

<Modal ref="createInstanceModal">
	<template v-slot:title>
		Add {{ productLabel }} Instance
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
					<h5><font-awesome-icon icon="fa-solid fa-ethernet" /> Probe</h5>
					<small class="form-text text-muted">Capture traffic from a Network interface (mirror).</small>
				</div>
			</div>
			</a>
		</div>

		<div class="card w-100 wizard-card" :class="{ 'wizard-selected': instanceMode == 'collector' }">
			<a class="wizard-link" href="#" @click="instanceMode = 'collector'; onConfigChange()">
			<div class="card-body">	
				<div class="form-group wizard-form-group">
					<h5><font-awesome-icon icon="fa-solid fa-bezier-curve" /> Collector</h5>
					<small class="form-text text-muted">Collect Netflow from a router or switch.</small>
				</div>
			</div>
			</a>
		</div>

		<div class="card w-100 wizard-card" :class="{ 'wizard-selected': instanceMode == 'custom' }">
			<a class="wizard-link" href="#" @click="instanceMode = 'custom'; onConfigChange()">
			<div class="card-body">	
				<div class="form-group wizard-form-group">
					<h5><font-awesome-icon icon="fa-solid fa-file-lines" /> Custom</h5>
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
import { stubMode, fileExists } from "../functions";
import NprobeConf from './NprobeConf.vue'
import Modal from './Modal.vue'
import LicenseConf from './LicenseConf.vue'

const productName = ref("nprobe")
const productLabel = ref("nProbe")

const tab = ref("")

const createInstanceModal = ref(null)

const instanceMode = ref("")

const instances = ref([])

const instanceName = ref(null)
const validationOk = ref(false);
const invalidInstanceName = ref(false)

/* Before mount: initialize configuration */
onBeforeMount(async () => {
	if (stubMode()) {
		instances.value.push({
			name: 'eno1'
		});
		instances.value.push({
			name: 'eno2'
		});
	} else {
		//TODO
	}

	if (instances.value.length > 0) {
		tab.value = instances.value[0].name;
	}
})

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
	/* Check if there is already an instance with the same name  */
	const name = instanceName.value.value;
	const found = instances.value.find(instance => instance.name == name);
	if (found) {
		window.alert(name + " already present");
		return;
	}

	/* Add instance */
	instances.value.push({
		name: name	
	});

	/* Reset modal */
	instanceName.value.value = '';
	instanceMode.value = '';
}
</script>
