<template>
	<Ntopng v-if="product == 'ntopng'" />
	<Nprobe v-if="product == 'nprobe'" />
	<N2disk v-if="product == 'n2disk'" />
</template>

<style scoped>
</style>

<script setup>
import { ref, onMounted, onBeforeMount, computed, watch } from "vue";
import Ntopng from './components/Ntopng.vue'
import Nprobe from './components/Nprobe.vue'
import N2disk from './components/N2disk.vue'

const product = ref('')

onBeforeMount(async () => {
	let pathname = window.location.pathname;

	if (pathname.includes('/ntopng/'))
		product.value = 'ntopng';
	else if (pathname.includes('/nprobe/'))
		product.value = 'nprobe';
	else if (pathname.includes('/n2disk/'))
		product.value = 'n2disk';
	else
		product.value = 'n2disk';
});

</script>

