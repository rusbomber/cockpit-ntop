/*
 * Utility functions to manage tasks implementing a scheduler.
 *
 * Task status:
 * - pending
 * - running
 * - completed
 * - processed
 *
 */

/* Run a redis command */
async function redis() {
	let output = '';

	let command = ["redis-cli"];
	let args = Array.from(arguments);

	command = command.concat(args);

	await cockpit.spawn(command)
	.then(function (data) {
		output = data; 
	})
	.catch(function (exception) {
		console.log("Redis failure");
		console.log(exception);
	});

	return output.trim();
}

/* Generate a task ID from a sequence number */
async function createTaskID() {
	return await redis('INCR', 'nbox.tasks.ID');
}

/* Push a task ID to a redis queue to be processed */
async function pushTask(id) {
	/* Dequeue with redis-cli LPOP nbox.tasks.queue */
	await redis('RPUSH', 'nbox.tasks.queue', id);
}

/* Create a new task. A new task ID is returned.*/
export async function createTask(info) {
	/* Generate Task ID */
	let id = await createTaskID();

	/* Set Status */
	await redis('HSET', 'nbox.tasks:' + id, 'status', 'pending');

	/* Store Info (base64 encoded JSON) */
	await redis('HSET', 'nbox.tasks:' + id, 'info', btoa(JSON.stringify(info)));

	/* Enqueue */
	await pushTask(id);

	return id;
}

/* Get task status */
export async function getTaskStatus(id) {
	const status = await redis('HGET', 'nbox.tasks:' + id, 'status');
	if (status.length == 0)
		return 'unknown';
	return status;
}

/* Get task info */
export async function getTaskInfo(id) {
	const info = await redis('HGET', 'nbox.tasks:' + id, 'info');
	if (into.length == 0)
		return {};
	return JSON.parse(atob(info));
}

/* Delete a task */
export async function deleteTask(id) {
	await redis('DEL', 'nbox.tasks:' + id);
}

