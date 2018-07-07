const assert = require('assert');
const StorageClient = require('../../gcp_clients/storage_client');

describe('StorageClient', () => {
	describe('#UploadInMemoryDataToStorage()', () => {
		it('Should upload some random data to storage', (done) => {

			const original_data = 'some data to upload';
			const a_valid_bucket_name = 'dataflow-java-learning';
			const file_path = 'uploaded_file_path.txt';

			StorageClient.UploadInMemoryDataToStorage(original_data, a_valid_bucket_name, file_path)
				.then(() => StorageClient.GetFileDataFromStorage(a_valid_bucket_name, file_path))
				.then((buffer) => {
					// console.log("----------Storage buffer-------");
					// console.log(buffer);
					// console.log("--------------------------------");
					assert.strictEqual(buffer.toString(), original_data);
					done();
				})
				.catch((err) => {
					done(err);
				});
		}).timeout(20000);
	});
});
