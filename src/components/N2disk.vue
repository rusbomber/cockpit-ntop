
<template>

<div v-if="installed">

<nav class="navbar navbar-expand-lg navbar-light bg-light">
	<a class="navbar-brand" href="#">
		<h3 class="product-name">{{ productLabel }}</h3>
	</a>

	<button class="navbar-toggler collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMainMenu" aria-controls="navbarMainMenu" aria-expanded="false" aria-label="Toggle navigation">
		<span class="navbar-toggler-icon"></span>
	</button>

	<div class="collapse navbar-collapse" id="navbarMainMenu">
		<ul class="navbar-nav mr-auto">
			<li v-for="instance in instances" class="nav-item" :class="{ 'active': tab == instance.name}">
				<a class="nav-link" href="#" @click="tab = instance.name">{{ instance.label }}</a>
			</li>
			<li class="nav-item">
				<a class="nav-link" href="#" @click="createInstanceModal.show()"><font-awesome-icon icon="fa-solid fa-plus" class="fix-fa-vertical-align" title="Add Instance" /></a>
			</li>
			<li class="nav-item" :class="{ 'active': tab == 'license'}">
				<a class="nav-link" href="#" @click="tab = 'license'">License</a>
			</li>
			<li class="nav-item">
				<a class="nav-link" :href="'/system/logs#/?priority=info&tag=' + productName" target="_parent">Logs</a>
			</li>
		</ul>
	</div>
</nav>

<template  v-for="instance in instances" >
	<N2diskConf :name="instance.name" :label="instance.label" v-if="tab == instance.name" />
</template>
<LicenseConf :name="productName" :label="productLabel" v-show="tab == 'license'" />
<div v-if="tab != 'license' && instances.length == 0">
	<br /><center><span><b>{{ productLabel }}</b> has not been configured yet, please create an instance.</span></center>
</div>

<Modal ref="createInstanceModal">
	<template v-slot:title>
		Add {{ productLabel }} Instance
	</template>
	<template v-slot:body>
		<div class="form-group">
			<h5>Instance Name</h5>
			<input type="text" class="form-control" :class="{ 'border border-danger': invalidInstanceName }" ref="instanceName" @change="onModalChange()" />
			<small class="form-text text-muted">Name for the new instance. Only letters and numbers are allowed.</small>
		</div>
	</template>
	<template v-slot:footer>
		<button class="btn btn-primary" @click="createInstance(); createInstanceModal.close()" :disabled="!validationOk">Create</button>
		<button class="btn btn-secondary" @click="createInstanceModal.close()">Close</button>
	</template>
</Modal>

</div> <!-- installed -->
<div v-else>
	<br />
	<center>
		<h5><b>{{ productLabel }}</b> is not installed!</h5>
	</center>
</div>

</template>

<script setup>
import { ref, onMounted, onBeforeMount, computed, watch } from "vue";
import { stubMode, fileExists, isValidInstanceName, getConfigurationFileList, getLicensedN2diskBinary } from "../functions";
import N2diskConf from './N2diskConf.vue'
import Modal from './Modal.vue'
import LicenseConf from './LicenseConf.vue'

const productName = ref("n2disk")
const productLabel = ref("n2disk")

const installed = ref(false)

const tab = ref("")

const createInstanceModal = ref(null)

const instances = ref([])

const instanceName = ref(null)
const validationOk = ref(false);
const invalidInstanceName = ref(false)

/* Before mount: initialize configuration */
onBeforeMount(async () => {
	if (stubMode()) {
		installed.value = true;
	} else {
		installed.value = await fileExists("/usr/bin/" + productName.value);
	}

	if (stubMode()) {
		instances.value.push({
			name: 'SampleInterface',
			label: 'SampleInterface'
		});
	} else {
		const names = await getConfigurationFileList(productName.value);
		names.sort();
		names.forEach(function (name) {
			let label = name;

			if (name == '') {
				label = "Default";
			}

			instances.value.push({ 
				name: name,
				label: label
			});
		});
	}

	if (instances.value.length > 0) {
		tab.value = instances.value[0].name;
	}
})

function onModalChange(e) {
	/* Use @change="event => onModalChange(event)" to pass the event */
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
	validationOk.value = name && !invalidInstanceName.value;
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
		name: name,
		label: name
	});

	tab.value = name;

	/* Reset modal */
	instanceName.value.value = '';
}
</script>
