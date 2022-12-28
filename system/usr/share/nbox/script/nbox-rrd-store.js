/*
 * nBox UI - JS Tool for dumping RRDs
 * 2022 © ntop
 */

const { promisify } = require('util');
const exec = promisify(require('child_process').exec)
const fs = require('fs')

async function get_running_services(application) {
	const cmd = "systemctl list-units  --type=service  --state=running | grep nprobe | tr -d ' ' | cut -d '.' -f 1";
	const output = await exec(cmd);
	return output.stdout.trim().split(/\r?\n/);
}

async function get_service_pid(instance) {
	const cmd = "systemctl show -p MainPID " + instance + " 2>/dev/null | cut -d= -f2";
	const output = await exec(cmd);
	return output.stdout.trim();
}

async function get_service_stats(pid) {
	let stats = [];
	const cmd = "cat /proc/net/pf_ring/stats/" + pid + "-*";
	const output = await exec(cmd);
	if (output.stdout) {
		const lines = output.stdout.trim().split(/\r?\n/);
		stats = lines.map(info => {
			const pair = info.split(/:(.*)/s);
			return {
				name: pair[0].trim(),
				value: pair[1].trim()
			} 
		});
	}
	return stats
}

async function update_rrd(application, instance, stats) {
	const volume = "/storage";
	const dir = volume + "/rrd/" + application;
	const path = dir + "/" + instance + ".rrd";

	let cmd = "mkdir -p " + dir;
	let output = await exec(cmd);

	if (!fs.existsSync(path)) {
		cmd = "rrdtool create --step 10 " + path + " " +
			"DS:receivedPkts:GAUGE:30:0:U " +
			"DS:filteredPkts:GAUGE:30:0:U " +
			"DS:droppedPkts:GAUGE:30:0:U " +
			"DS:receivedBytes:GAUGE:30:0:U " +
			"DS:exportedFlows:GAUGE:30:0:U " +
			"RRA:AVERAGE:0.5:1:180 " +
			"RRA:AVERAGE:0.5:30:600";
		output = await exec(cmd);
	}

	cmd = "rrdtool update " + path + " " +
		"N:" + stats['receivedPkts'] +
		 ":" + stats['filteredPkts'] +
		 ":" + stats['droppedPkts'] +
		 ":" + stats['receivedBytes'] +
		 ":" + stats['exportedFlows'];
	output = await exec(cmd);
}

async function dump_nprobe_stats() {
	const application = "nprobe";

	const instances = await get_running_services(application);
	for (const instance of instances) {
		const pid = await get_service_pid(instance);

		//console.log("--- Instance " + instance  + " has PID = " + pid);

		const service_stats = await get_service_stats(pid);

		let stats = [];
		service_stats.forEach(function(item) {
			//console.log(item.name + " => " + item.value);
			switch (item.name) {
				case 'Packets':
					const packets_info = item.value.split(' ')[0].split('/');
					stats['receivedPkts'] = packets_info[0];
					stats['filteredPkts'] = packets_info[0];
					stats['droppedPkts'] = packets_info[1];
					break;
				case 'Bytes':
					stats['receivedBytes'] = item.value; 
					break;
				case 'FlowExportStats':
					const flow_info = item.value.split(' ')[0].split('/');
					stats['exportedFlows'] = flow_info[2]; 
					break;
			}
		})

		update_rrd(application, instance, stats);
	}
}

setInterval(dump_nprobe_stats, 1000);
