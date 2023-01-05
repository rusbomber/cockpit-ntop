/*
 * nBox UI - JS Tool for reading RRDs
 * 2022-23 © ntop
 */

const { promisify } = require('util');
const exec = promisify(require('child_process').exec)
const fs = require('fs')

async function get_rrd_data(application, instance, minutes) {
	let data = []

	const volume = "/storage";
	const dir = volume + "/rrd/" + application;
	const path = dir + "/" + instance + ".rrd";

	const cmd = "rrdtool fetch " + path + " AVERAGE -s -" + minutes + "min";
	const output = await exec(cmd);

	if (output.stdout) {
		const lines = output.stdout.trim().split(/\r?\n/);

		const names = lines.shift().split(' ').filter(name => name.length > 0);

		const empty = lines.shift();

		for (const line of lines) {
			const columns = line.split(' ');
			const epoch = columns[0];
			let index = 1;
			for (name of names) {
				if (!data[name])
					data[name] = [];
				data[name].push({
					x: epoch,
					y: columns[index]
				});
				index++;
			}
		}
	}
	
	return data;
}

async function main() {
	let args = process.argv;

	args.shift();
	args.shift();

	if (args.length != 2) {
		console.log("Usage: node nbox-rrd-read.js <application> <instance>");
		console.log("Example: node nbox-rrd-read.js nprobe nprobe@eth1");
		return;
	}

	const application = args.shift();
	const instance = args.shift();
	const minutes = "5";

	const data = await get_rrd_data(application, instance, minutes);

	console.log(data);
}

main();
