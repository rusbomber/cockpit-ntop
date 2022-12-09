<template>
	<Ntopng v-if="product == 'ntopng'" />
	<Nprobe v-if="product == 'nprobe'" />
</template>

<style scoped>
</style>

<script setup>
import { ref, onMounted, onBeforeMount, computed, watch } from "vue";
import Ntopng from './components/Ntopng.vue'
import Nprobe from './components/Nprobe.vue'

const product = ref('')

onBeforeMount(async () => {
	let pathname = window.location.pathname;

	if (pathname.includes('/ntopng/'))
		product.value = 'ntopng';
	else if (pathname.includes('/nprobe/'))
		product.value = 'nprobe';
	else
		product.value = 'ntopng';
});

</script>

