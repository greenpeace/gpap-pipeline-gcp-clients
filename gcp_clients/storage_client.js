const storage = require('@google-cloud/storage')();
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------

/**
* Read file data from storage into memory. This function is a promise
* and will resolve with the data if successful. 
* @param {string} bucket_name 
* @param {string} file_path 
*/
exports.GetFileDataFromStorage = function(bucket_name, file_path) {                         // from https://cloud.google.com/nodejs/docs/reference/storage/1.5.x/File
    return new Promise((resolve, reject) => {
        var bucket = storage.bucket(bucket_name);
        var file = bucket.file(file_path);
        
        file.download().then(function (content_buffer_array) {                                // if no callback  is provided to .download() then you get a promise            
            resolve(content_buffer_array[0]);                                               // contents has type Buffer (aka an array for octet streams/uint8)
        }).catch(function (error) {
            reject(error);
        });
    });
}


/**
* Using the file handle from event.data, get the contents of this file from GCP storage
* and store it in memory
* 
* @param {object}  file_metadata - The data passed to the cloud function by the bucket change event trigger
*/
exports.UploadTrigger_GetFileDataFromStorage = function(file_metadata){                     // from https://cloud.google.com/nodejs/docs/reference/storage/1.5.x/File
    return new Promise(function(resolve, reject){  
        
        var file = storage.bucket(file_metadata.bucket).file(file_metadata.name);  
        // TODO: decide whether or not to use callbacks (load entire file into memory first) or streams
        file.download().then(function(data){                          // if no callback  is provided to .download() then you get a promise            
            var contents_buffer = data[0];                              // contents has type Buffer (aka an array for octet streams/uint8)
            resolve(contents_buffer);             
        }).catch(function(error){
            reject(error);
        });
    });  
}

/**
* Upload some data in memory to a file in a bucket in GCP storage
* 
* @param {any} data 
* @param {string} bucket_name 
* @param {string} file_path 
*/
exports.UploadInMemoryDataToStorage = function(data, bucket_name, file_path) {
    
    console.log("UploadInMemoryDataToStorage");
    return new Promise((resolve, reject) => {
        
        var bucket = storage.bucket(bucket_name);
        var filepath_in_the_cloud = bucket.file(file_path);
        
        filepath_in_the_cloud.save(data, function (err) {
            if (!err) {
                console.log(`successfully wrote file to ${bucket} ${file_path}`);
                resolve({'bucket': bucket, 'file_path': file_path});
            } else {
                
                console.error("Error uploading data to bucket", err);
                reject();
            }
        });
        
    });
}