
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
			<li class="nav-item" :class="{ 'active': tab == 'configuration'}">
				<a class="nav-link" href="#" @click="tab = 'configuration'"><font-awesome-icon icon="fa-solid fa-file-waveform" class="fa-size-small" /> Setup</a>
			</li>
			<li class="nav-item" :class="{ 'active': tab == 'license'}">
				<a class="nav-link" href="#" @click="tab = 'license'"><font-awesome-icon icon="fa-solid fa-id-card" /> License</a>
			</li>
			<li class="nav-item">
				<a class="nav-link" :href="'/system/logs#/?priority=info&tag=' + productName" target="_parent"><font-awesome-icon icon="fa-solid fa-scroll" /> Logs</a>
			</li>
		</ul>
	</div>
</nav>

<NtopngConf :name="instanceName" :isEdge="isEdge" v-show="tab == 'configuration'" />
<LicenseConf :name="productName" :label="productLabel" v-show="tab == 'license'" />

</div> <!-- installed -->
<div v-if="notInstalled">
	<br />
	<center>
		<h5><b>ntopng</b> is not installed!</h5>
	</center>
</div>

</template>

<script setup>
import { ref, onMounted, onBeforeMount, computed, watch } from "vue";
import { stubMode, fileExists } from "../functions";
import NtopngConf from './NtopngConf.vue'
import LicenseConf from './LicenseConf.vue'

const installed = ref(false)
const notInstalled = ref(false)

const instanceName = ref("Main")

const productName = ref("ntopng")
const productLabel = ref("ntopng")
const isEdge = ref(false)

const tab = ref("configuration")

onBeforeMount(async () => {
	if (stubMode()) {
		installed.value = true;
	} else {
		/* Detect ntopng binary */
		installed.value = await fileExists("/usr/bin/ntopng");
		if (!installed.value) {
			/* Detect nEdge binary */
			installed.value = await fileExists("/usr/bin/nedge");
			if (installed.value) {
				productLabel.value = "ntopng Edge";
				isEdge.value = true;
			}
		}
		notInstalled.value = !installed.value;
	}
});
</script>
