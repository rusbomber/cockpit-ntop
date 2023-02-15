
<template>

<nav class="navbar navbar-expand-lg navbar-light bg-light">
	<a class="navbar-brand" href="#">
		<h3 class="product-name">Preferences</h3>
	</a>

	<button class="navbar-toggler collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMainMenu" aria-controls="navbarMainMenu" aria-expanded="false" aria-label="Toggle navigation">
		<span class="navbar-toggler-icon"></span>
	</button>

	<div class="collapse navbar-collapse" id="navbarMainMenu">
		<ul class="navbar-nav mr-auto">
			<li class="nav-item" :class="{ 'active': tab == 'notifications'}">
				<a class="nav-link" href="#" @click="tab = 'notifications'"><font-awesome-icon icon="fa-solid fa-bell" class="fa-size-small" /> Notifications</a>
			</li>
		</ul>
	</div>
</nav>

<NotificationsConf v-show="tab == 'notifications'" />

</template>

<script setup>
import { ref, onMounted, onBeforeMount, computed, watch } from "vue";
import { stubMode, fileExists } from "../functions";
import NotificationsConf from './NotificationsConf.vue'
import LicenseConf from './LicenseConf.vue'

const tab = ref("notifications")

onBeforeMount(async () => {
	if (stubMode()) {
	}
});
</script>
