/**
Dependencies:
- dotenv : Needed to load parameter values from .env => already loaded
- winston: Needed for logging
- request: Needed to access the Pocket API
*/

const winston = require('winston');
var request = require('request');

if (process.env.LOG_LEVEL == 'debug'){
	require('request').debug = true;
}

module.exports = {
  archiveInPocket:function(consumer_key,access_token,callback){
	/**
	Get bookmark list from Pocket
	*/

	winston.log('info', {  
		"Getting bookmark list from Pocket": "..."
	});

	request.post({
		url: process.env.POCKET_API_URL_GET,
		json: true,
		strictSSL: false,
		headers: {
			"content-type": "application/json",
			"Accept" : "*/*"
		},
		body : {
			consumer_key:consumer_key,
			access_token:access_token
		}
	},function (err, httpResponse, body) {

		if (err != null){
			winston.log('error', {  
				"Accesing Pocket Retrieve API": err,
				"Ending process":new Date()
			});
			callback(-1);
			//process.exit(1);
		}
		
		if (httpResponse.statusCode != 200){
			winston.log('info', {  
				"Response different than 200": httpResponse.statusCode,
				"Ending process":new Date()
			});
			callback(httpResponse.statusCode);
		}

		winston.log('info', {  
			"Pocket bookmarks retrieved": "OK"
		})

		/*
		Obtain the list of actions with the 
		IDs that we want to archive
		*/
		var bookmarks = new Array();
		var number_of_bookmarks = 0;

		for(var attributename in body.list){

			bookmarks.push({
				action : "archive",
				item_id : body.list[attributename].item_id
			});
			number_of_bookmarks++;
		}

		winston.log('info', {  
			"Bookmarks retrieved": number_of_bookmarks
		})

		var modify_api_json = {
			consumer_key : consumer_key,
			access_token : access_token,
			actions : bookmarks
		};

		winston.log('debug', {  
			"JSON about to be send to Poclet Modify API": modify_api_json
		})

		/*
		Call the modify API to archive all items
		*/

		winston.log('info', {  
			"Archiving bookmark list in Pocket": "..."
		});

		request.post({
			url: process.env.POCKET_API_URL_MODIFY,
			json: true,
			strictSSL: false,
			headers: {
				"content-type": "application/json",
				"Accept" : "*/*"
			},
			body : modify_api_json
		},function (errModify, httpResponseModify, bodyModify) {

			if (errModify != null){
				winston.log('error', {  
					"Accesing Pocket Modify API": errModify,
					"Ending process":new Date()
				})
				callback(-1)
				//process.exit(1);
			}
			
			if (httpResponse.statusCode != 200){
				winston.log('info', {  
					"Response different than 200": httpResponse.statusCode,
					"Ending process":new Date()
				});
				callback(httpResponse.statusCode);
			}

			winston.log('info', {  
				"Pocket bookmarks archived": "OK",
				"Ending process":new Date()
			});
			
			callback(200);
		});
	});
}
};