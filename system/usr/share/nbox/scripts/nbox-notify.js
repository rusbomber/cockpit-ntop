/*
 * nBox UI - JS Tool to Notify service status changes
 * 2022-23 © ntop
 */

const conf_file = "/etc/nbox/nbox.json";
const log_file = "/var/log/nbox-notify.log";
const debug = true;

const os = require("os");
const fs = require('fs')
const http = require("http");
const https = require("https");

function post(http_mod, { body, ...options }) {
	return new Promise((resolve, reject) => {
		const req = http_mod.request({
			method: 'POST',
			...options,
		},
		res => {
			const chunks = [];
			res.on('data', data => chunks.push(data))
			res.on('end', () => {
				let res_body = Buffer.concat(chunks);
				switch(res.headers['content-type']) {
					case 'application/json':
						res_body = JSON.parse(res_body);
						break;
				}
				resolve(res_body)
			})
		})

		req.on('error', reject);

		if(body) {
			req.write(body);
		}

		req.end();
	})
}

async function notify_to_webhook(event_data, url) {
	const addr = new URL(url);

	const settings = {
		hostname: addr.hostname,
		port: addr.port,
		path: addr.pathname,
		headers: {
			//'Authorization': 'Bearer ' + auth_token,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(event_data)
	}

	try {
		if (addr.protocol == 'https:') {
			const res = await post(https, settings);
		} else {
			const res = await post(http, settings);
		}
	} catch (err) {
		console.log("Failure posting event (" + addr.protocol + ")");
		if (debug) {
			console.log(err);
		}
	}
}

async function notify_to_syslog_remote(event_data, address, format) {
	/* Build Message */
	let event_name = event_data.event;

	switch (event_data.event) {
		case 'start':
			event_name = "started";
			break;
		case 'stop':
			if (!event_data.exit_status ||
			    event_data.exit_status == "0") {
				event_name = "shutted down";
			} else {
				event_name = "died";
				if (event_data.exit_status) {
					event_name += " (" + event_data.exit_status + ")";
				}
			}
			break;
	}

	let message = '';

	if (format && format == 'json') {
		message = JSON.stringify(event_data);

	} else /* 'text' */ {
		message = event_data.service_name;
		if (event_data.instance_name) {
			message += "@" + event_data.instance_name;
		}
		message += " " + event_name;
		message += " on " + event_data.hostname;
	}

	/* Send */
	const addr = address.trim().split(/:/);
	const host = addr.shift();
	const port = addr.shift();

	var net = require('net');
	var client = new net.Socket();

	await client.connect(port, host, function() {
		client.write(message);
		client.destroy();
	});
	client.on('error', (err) => {
		console.error('Failure posting event (syslog)')
		if (debug) {
			console.log(err);
		}
	});
}

async function notify_to_file(event_data, path) {
	try {
		fs.appendFileSync(path, JSON.stringify(event_data) + "\n");
	} catch (err) {
		console.log(err);
	}
}

async function handle_event(event_data) {

	if (!fs.existsSync(conf_file)) {
		return;
	}

	const conf_content = fs.readFileSync(conf_file);
	const configuration = JSON.parse(conf_content);

	if (debug) {
		console.log(configuration);
	}

	/* Check if enabled */
	if (!configuration ||
		!configuration['notifications']) {
		return;
	}

	const notifications = configuration['notifications'];

	if (!notifications['enabled']) {
		return;
	}

	/* Check verbosity */
	if (notifications['verbosity'] &&
		notifications['verbosity'] == 'failures' &&
		(!event_data['exit_status'] || event_data['exit_status'] == "0")) {
		/* Failures only - and this is not a failure */
		return;
	}

	if (debug) {
		notify_to_file(event_data, log_file);
	}

	if (notifications['webhook'] && notifications['webhook']['url']) {
		notify_to_webhook(event_data, notifications['webhook']['url']);
	}

	if (notifications['syslog'] && notifications['syslog']['address']) {
		notify_to_syslog_remote(event_data, notifications['syslog']['address'], notifications['syslog']['format']);
	}
}

async function main() {
	let args = process.argv;

	args.shift();
	args.shift();

	if (args.length < 3) {
		console.log("Usage: node nbox-notify.js <service> <instance> <event> [<SERVICE_RESULT> <EXIT_CODE> <EXIT_STATUS>]");
		console.log("Example: node nbox-notify.js 'nprobe' 'eth1' 'stop' 'signal' 'killed' 'SEGV'");
		return;
	}

	const event_data = {
		epoch:         Math.floor(Date.now() / 1000),
		hostname:      os.hostname(),
		service_name:  args.shift(),
		instance_name: args.shift(),
		event:         args.shift(),
	}
	if (args.length > 0) event_data.trigger     = args.shift();
	if (args.length > 0) event_data.exit_code   = args.shift();
	if (args.length > 0) event_data.exit_status = args.shift();

	handle_event(event_data);
}

main();
