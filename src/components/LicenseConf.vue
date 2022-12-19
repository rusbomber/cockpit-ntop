
<template>

<div class="configuration">
<div class="card w-100">
	<div class="card-header">
		<div class="card-title">
			<h3>{{ label }} License</h3>
		</div>
	</div>

	<div class="card-body">
		<div class="form-group" v-show="appVersion != ''">
			<h5>Version</h5>
			<span>{{ appVersion }}</span>
		</div>
		<div class="form-group" v-show="appEdition != ''">
			<h5>Edition</h5>
			<span>{{ appEdition }}</span>
		</div>
		<div class="form-group" v-show="appSystemID != ''">
			<h5>System ID</h5>
			<span>{{ appSystemID }}</span>
		</div>
		<div class="form-group" v-show="appLicense != ''">
			<h5>License Status</h5>
			<span :class="{'text-success': appLicense == 'Permanent'}"><b>{{ appLicense }}</b></span>
		</div>
		<div class="form-group" v-show="appMaintenance != ''">
			<h5>Maintenance Status</h5>
			<span>{{ appMaintenance }}</span>
		</div>

		<div class="form-group">
			<h5>License Key</h5>
			<textarea ref="licenseKeyTextArea" class="form-control" placeholder="Paste the license key here" style="height: 10rem"></textarea>
			<small class="form-text text-muted"></small>
		</div>
	</div>

	<div class="card-footer">
		<div class="d-grid gap-2 d-md-flex justify-content-md-end">
			<a href="#" class="btn btn-primary" @click="saveLicense()">Save License</a>
		</div>
	</div>
</div>

<Modal ref="onApplyModal">
	<template v-slot:title>
		License Saved
	</template>
	<template v-slot:body>
		The license key has been applied, please note that the service should be restarted for the license to take effect.
	</template>
	<template v-slot:footer>
		<button class="btn btn-secondary" @click="onApplyModal.close()">Got it</button>
	</template>
</Modal>

</div>

</template>

<script setup>
import { ref, onMounted, onBeforeMount, computed, watch } from "vue";
import { stubMode, getLSBRelease, readFile, writeFile, getApplicationVersion } from "../functions";
import Modal from './Modal.vue'

const licenseKeyTextArea = ref(null)
const onApplyModal = ref(null)

const appVersion = ref("")
const appSystemID = ref("")
const appEdition = ref("")
const appLicense = ref("")
const appMaintenance = ref("")

/* 
 * Component parameters
 * Types: String, Object, Number, Boolean, Array
 * Print with console.logs(props.name);
 */
const props = defineProps({
	name: {
		type: String,
		required: true
	},
	label: {
		type: String,
		required: true
	}
})

async function readLicense() {
	const license_key = await readFile("/etc/" + props.name + ".license");
	licenseKeyTextArea.value.value = license_key
}

async function writeLicense() {
	const license_key = licenseKeyTextArea.value.value
	await writeFile("/etc/" + props.name + ".license", license_key);
}

async function readSystemInformation() {
	const info = await getApplicationVersion(props.name);

	//console.log(info);

	info.forEach(function (item) {
		switch (item.name) {
			case 'Version':
				appVersion.value = item.value;
				break;
			case 'System Id':
			case 'SystemID':
				appSystemID.value = item.value;
				break;
			case 'Edition':
				appEdition.value = item.value;
				break;
			case 'License Type':
			case 'License':
				appLicense.value = item.value;
				break;
			case 'Maintenance':
				appMaintenance.value = item.value;
				break;
		}
	});
}

async function saveLicense() {
	writeLicense()
	onApplyModal.value.show();
}

/* On mount: read current license */
onMounted(async () => {
	if (stubMode()) {

	} else {
		await readLicense();
		await readSystemInformation();
	}
});

</script>

