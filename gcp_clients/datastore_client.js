
const Datastore = require('@google-cloud/datastore');
// Imports the Google Cloud client library
const datastore = new Datastore({ projectId: process.env.GCLOUD_PROJECT });

const _in_memory_api_keys = {};

/**
 * This function will get single valued data (things like API keys) from the datastore
 * on the first call, and cache+return it.
 *
 * On subsequent calls, it will just access the in-memory cache to get the value. The assumption being
 * that this value will not have updated in the intervening time.
 *
 * @param {string} datastore_type_key
 */
const GetAPIKey = datastore_type_key => new Promise((resolve, _) => {
	if (_in_memory_api_keys[datastore_type_key] !== undefined) {
		resolve(_in_memory_api_keys[datastore_type_key]);
	} else {
		const query = datastore
			.createQuery(datastore_type_key)
			.filter('account', '=', 'Greenpeace'); // TODO: remove this!

		datastore.runQuery(query).then((response) => {
			_in_memory_api_keys[datastore_type_key] = response[0][0].api_key;
			resolve(_in_memory_api_keys[datastore_type_key]);
		});
	}
});

/**
  *
  * @param {String} type_key
  * @param {Object} entity
  */
const CreateEntity = (type_key, entity_data) => {
	const taskKey = datastore.key(type_key);

	const entity = {
		key: taskKey,
		data: entity_data,
	};

	return new Promise((resolve, reject) => {
		datastore
			.save(entity)
			.then(() => {
				resolve(taskKey.id);
			})
			.catch((err) => {
				console.error('ERROR:', err);
				reject(err);
			});
	});
};

const ReadEntity = (type_key, filter_array) => {
	const query = datastore.createQuery(datastore_type_key);

	for (let i = 0; i < filter_array.length; i++) {
		const query_parts = filter_array[i].split(' ');
		query.filter(query_parts[0], query_parts[1], query_parts[2]);
	}

	return new Promise((resolve, reject) => {
		datastore.runQuery(query).then((response) => {
			resolve(response);
		});
	});
};


// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
//                                      module exports
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

exports.DataStore = datastore;
exports.DataStoreUtils = {
	GetAPIKey,
	CreateEntity,
};
