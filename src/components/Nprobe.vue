
<template>

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
		</ul>
	</div>
</nav>

<div class="configuration">
	<LicenseConf :name="productName" v-show="tab == 'license'" />
</div>

</template>

<script setup>
import { ref, onMounted, onBeforeMount, computed, watch } from "vue";
import LicenseConf from './LicenseConf.vue'

const instanceName = ref("Main")
const productName = ref("nprobe")
const tab = ref("configuration")
</script>
