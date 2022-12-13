
export async function getNetworkInterfaces() {
	let json;

	var proc = await cockpit.spawn(["pfcount", "-I"])
	.then(function (data) { 
		json = JSON.parse(data);
	})
	.catch(function (exception) {
		console.log("Failure running pfcount");
		//console.log(exception);
	});

	if (json && json.interfaces)
		return json.interfaces;
	else
		return [];
}

export async function getApplicationVersion(name) {
	let info;

	var proc = await cockpit.spawn([name, "--version"])
	.then(function (data) { 
		const lines = data.split(/\r?\n/);
		info = lines.map((line) => {
			const [name, ...value_arr] = line.split(':');
			const value = value_arr.join(':');
			return {
				name: name.trim(),
				value: value.trim()
			};
		});
	})
	.catch(function (exception) {
		console.log("Failure running " + name + " --version");
		//console.log(exception);
	});

	if (info)
		return info;
	else
		return [];
}


export async function isServiceActive(name) {
	let active = false;

	var proc = await cockpit.spawn(["systemctl", "is-active", name])
	.then(function (data) { 
		if (data && data.trim() == "active")
			active = true;
	})
	.catch(function (exception) {
		//console.log("isServiceActive exception");
		//console.log(exception);
	});

	return active;
}

export async function isServiceEnabled(name) {
	let enabled = false;

	var proc = await cockpit.spawn(["systemctl", "is-enabled", name])
	.then(function (data) { 
		if (data && data.trim() == "enabled")
			enabled = true;
	})
	.catch(function (exception) {
		//console.log("isServiceEnabled exception");
		//console.log(exception);
	});

	return enabled;
}

export async function toggleService(name, enable) {

	/* console.log("Setting " + name + " " + (enable?"on":"off")); */

	var proc1 = await cockpit.spawn(["systemctl", "-q", enable ? "enable" : "disable", name], {superuser:"require"})
	.then(function (data) { 
	})
	.catch(function (exception) {
		//console.log("toggleService exception (enable/disable)");
		//console.log(exception);
	});

	var proc2 = await cockpit.spawn(["systemctl", "-q", enable ? "restart" : "stop", name], {superuser:"require"})
	.then(function (data) { 
	})
	.catch(function (exception) {
		//console.log("toggleService exception (start/stop)");
		//console.log(exception);
	});
}

export async function restartService(name) {
	var proc2 = await cockpit.spawn(["systemctl", "-q", "restart", name], {superuser:"require"})
	.then(function (data) { 
	})
	.catch(function (exception) {
		//console.log("restartService exception");
		//console.log(exception);
	});
}

export async function getLSBRelease() {
	const LSBReleaseFile = cockpit.file("/etc/lsb-release", { superuser: 'try' });
	const LSBRelease = await LSBReleaseFile.read();
	return LSBRelease;
}

export function parseConfiguration(content) {
	const lines = content.split(/\r?\n/);
	const params = lines.filter((line) => { 
		line = line.trim();
		return !(line.length == 0 || line.startsWith("#"));
	});
	const options = params.map((param) => {
		const [option, ...value_arr] = param.split('=');
		const value = value_arr.join('=');
		return {
			name: option,
			value: value
		};
	});

	return options;
}

export function serializeConfiguration(configuration) {
	let content = "";

	configuration.forEach(function (option) {
		if (option.name) {
			content += option.name;
			if (option.value)
				content += '=' + option.value;
			content += '\n';
		}
	});

	return content;
}

export async function fileExists(path) {
	let exists = false;

	var proc = await cockpit.spawn(["stat", path])
	.then(function () { 
		exists = true;
	})
	.catch(function (exception) {
	});

	return exists;
}

export async function readFile(path) {
	const file = cockpit.file(path, { superuser: 'try' });

	if (!file) {
		return "";
	}

	const content = await file.read();

	return content
}

export async function writeFile(path, content) {
	const file = cockpit.file(path, { superuser: 'try' });

	if (!file) {
		return;
	}

	await file.replace(content);
}

export async function readConfigurationFile(product, instance) {
	const path = "/etc/" + product + "/" + product + (instance ? "-" + instance : "") + ".conf";

	const content = await readFile(path);

	return parseConfiguration(content);
}

export async function writeConfigurationFile(product, configuration, instance) {
	const path = "/etc/" + product + "/" + product + (instance ? "-" + instance : "") + ".conf";

	const content = serializeConfiguration(configuration);

	await writeFile(path, content);
}

