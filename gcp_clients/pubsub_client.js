const pubsub = require('@google-cloud/pubsub')();

/**
* Publish some data to a given topic
* @param {string} topicName - the name of the pubsub topic
* @param {string} data - the data to be send on this pubsub topic
*/
exports.PublishMessage = (topicName, data, attributes) => { // FROM https://github.com/googleapis/nodejs-pubsub/blob/master/samples/topics.js
	console.log(`[PublishMessage()] Topic ${topicName} \n Data: ${data}`);

	const topic = pubsub.topic(topicName); // References an existing topic, e.g. "my-topic"
	const publisher = topic.publisher(); // Create a publisher for the topic (which can include additional batching configuration)

	// You cant buffer objects, only strings, other buffers and arrays... Look at node.js docs.. OR use JSON.stringify()....
	// Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
	const dataBuffer = Buffer.from(data);

	// ========================================================================================
	const attributes_to_send = attributes || {};
	if (attributes_to_send.time_published !== undefined) {
		attributes_to_send.time_published = Date_ISO8601toRFC3336(new Date()); // Google APIs use RFC3336 dates...
	}
	// ========================================================================================


	// attributes['time_published'] = (new Date()).toISOString();             // Dont use ISO8601 dates...

	return publisher.publish(dataBuffer, attributes);
};


/**
 * 
 * @param {Date} d 
 */
function Date_ISO8601toRFC3336 (d){
    /* use a function for the exact format desired... */
    function pad(n){return n<10 ? '0'+n : n}
    return d.getUTCFullYear()+'-'
         + pad(d.getUTCMonth()+1)+'-'
         + pad(d.getUTCDate())+'T'
         + pad(d.getUTCHours())+':'
         + pad(d.getUTCMinutes())+':'
         + pad(d.getUTCSeconds())+'Z'
}



/**
*
* @param {string} topic_name
* @param {string} subscription_name
*/
exports.CreateSubscription = (topic_name, subscription_name) => new Promise((resolve, reject) => {
	pubsub
		.topic(topic_name)
		.createSubscription(subscription_name)
		.then((results) => {
			const subscription = results[0];
			console.log(`Subscription ${subscription.name} created.`);
			resolve(results);
		})
		.catch((err) => {
			console.error('ERROR:', err);
			reject(err);
		});
});

/**
*
* @param {string} subscription_name
*/
exports.ReceiveMessagesOnSubscription = (subscription_name, MessageHandler) => {
	const subscription = pubsub.subscription(subscription_name); // Subscription must already exist
	// Listen for new messages until timeout is hit
	subscription.on('message', MessageHandler);
};
