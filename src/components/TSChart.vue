<template>
	<apexchart type="area" :options="chartOptions" :series="series"></apexchart>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, computed } from "vue";

const props = defineProps({
	series: {
		type: Object,
		required: true
	},
	unit: {
		type: String, /* bps, pps */
		required: false
	}
})

const chartOptions = ref({
	chart: {
		stacked: true,
		zoom: {
			enabled: false,
			autoScaleYaxis: true
		},
		toolbar: {
			show: false
		}
	},
	xaxis: {
		type: 'datetime',
		tickAmount: 6
	},
	yaxis: {
		labels: {
			formatter: function (value) {
				if (props.unit == 'bps')
					return value/1000000 + " Mbps";
				else
					return value/1000 + " Kpps";
			}
		}
	},
	tooltip: {
		enabled: false,
		x: {
			show: false,
			format: 'dd MMM yyyy hh:mm:ss'
		}
	},
	markers: {
		size: 0,
		style: 'hollow'
	},
	dataLabels: {
		enabled: false
	},
	stroke: {
		curve: 'straight',
		width: 0,
	},
	fill: {
		type: 'solid',
		opacity: 1,
	}
})

</script>

