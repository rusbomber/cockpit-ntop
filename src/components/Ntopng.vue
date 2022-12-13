
<template>

<div v-if="installed">

	<nav class="navbar navbar-expand-lg navbar-light bg-light">
		<h3 class="product-name">{{ productName }}</h3>
		<div class="collapse navbar-collapse">
			<ul class="navbar-nav mr-auto">
				<li class="nav-item" :class="{ 'active': tab == 'configuration'}">
					<a class="nav-link" href="#" @click="tab = 'configuration'">Setup</a>
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

	<div class="configuration">
		<NtopngConf :name="instanceName" v-show="tab == 'configuration'" />
		<LicenseConf :name="productName" v-show="tab == 'license'" />
	</div>

</div>
<div v-else>
	<br />
	<center>
		<h5><b>ntopng</b> is not installed!</h5>
	</center>
</div>

</template>

<script setup>
import { ref, onMounted, onBeforeMount, computed, watch } from "vue";
import { fileExists } from "../functions";
import NtopngConf from './NtopngConf.vue'
import LicenseConf from './LicenseConf.vue'

const installed = ref(false)
const instanceName = ref("Main")
const productName = ref("ntopng")
const tab = ref("configuration")

onBeforeMount(async () => {
	installed.value = await fileExists("/usr/bin/ntopng");
});
</script>
