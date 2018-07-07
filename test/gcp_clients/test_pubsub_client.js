const assert = require('assert');
const PubSubClient = require('../../gcp_clients/pubsub_client');

describe('PubSubClient', () => {
	describe('#PublishMessage()', () => {
		it('Should send a message through PubSub', (done) => {
			const TEST_TOPIC = 'test';
			const SUBSCRIPTION_NAME = 'test_subscription';
			const sentinel_message = 'sentinel';
			const message = 'test message';
			let is_pubsub_drained = false;
			let is_done = false;

			// Create an event handler to handle messages
			const messageHandler = (message_incoming) => {
				if (!is_pubsub_drained) {
					is_pubsub_drained = message_incoming.data.toString() === sentinel_message;
					PubSubClient.PublishMessage(TEST_TOPIC, message);
				} else {
					// console.log('Data we are checking');
					// console.log(message_incoming.data.toString());
					assert.equal(message_incoming.data.toString(), message);
					if (!is_done) {
						done();
						is_done = true;
					}
				}
				message_incoming.ack();		// "Ack" (acknowledge receipt of) the message
			};

			PubSubClient.CreateSubscription(TEST_TOPIC, SUBSCRIPTION_NAME)
				.then(() => {
					PubSubClient.ReceiveMessagesOnSubscription(SUBSCRIPTION_NAME, messageHandler);
					PubSubClient.PublishMessage(TEST_TOPIC, sentinel_message);
				});
		}).timeout(20000);
	});
});
