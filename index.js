/**
Dependencies:
- dotenv : Needed to load parameter values from .env
- winston: Needed for logging
- request: Needed to access the Pocket API
- child_process: Needed to call Calibre
*/

require('dotenv').config();
const winston = require('winston')
var request = require('request');
var exec = require('child_process').exec;

/**
If any required parameter is missing, abort
*/
if ((process.env.LOG_LEVEL == null)){
	console.log('Missing parameter in .env file: LOG_LEVEL. Aborting');
	process.exit(1);
}

winston.level = process.env.LOG_LEVEL;

if (
	(process.env.POCKET_API_URL_GET == null) ||
	(process.env.POCKET_API_URL_MODIFY == null) ||
	(process.env.POCKET_API_CONSUMER_KEY == null) ||
	(process.env.POCKET_API_ACCESS_TOKEN == null) ||
	(process.env.POCKET_USERNAME == null) ||
	(process.env.POCKET_PASSWORD == null) ||
	(process.env.CALIBRE_POCKETPLUS_RECIPE == null) ||
	(process.env.CALIBRE_OUTPUT_FILE == null) ||
	(process.env.SMTP_SERVER == null) ||
	(process.env.SMTP_PORT == null) ||
	(process.env.SMTP_ENCRYPT == null) ||
	(process.env.SMTP_USERNAME == null) ||
	(process.env.SMTP_PASSWORD == null) ||
	(process.env.KINDLE_ADDRESS == null) ||
	(process.env.CREATE_EBOOK == null) ||
	(process.env.SEND_EBOOK == null) ||
	(process.env.ARCHIVE_BOOKMARKS == null) ||
	(process.env.LIST_OF_TAGS == null) 
	){
		winston.log('error', {  
			"At least one of the required parameters is missing": ".",
			"Check .env file" : "."
		});
		process.exit(1);
}

if (process.env.LOG_LEVEL == 'debug'){
	require('request').debug = true;
}

var create_ebook=process.env.CREATE_EBOOK;
var send_ebook_to_kindle=process.env.SEND_EBOOK;
var archive_in_pocket=process.env.ARCHIVE_BOOKMARKS;

winston.log('info', {  
	"Create ebook flag": create_ebook,
	"Send ebook flag": send_ebook_to_kindle,
	"Archive in Pocket flag": archive_in_pocket
});

if (create_ebook == 'true'){

	/**
	We have to replace the line 46 of the pocletplus.recipe file
	with the tags specified by the user in the LIST_OF_TAGS parameter
	*/
	winston.log('info', {  
		"List of tags": process.env.LIST_OF_TAGS
	})

	/**
	Compose the sed command
	*/
	var replace_tags_command = 'sed -i "46s/.*/    tags = ' + process.env.LIST_OF_TAGS + 
	'/" pocketplus.recipe';

	winston.log('debug', {  
		"Replace tags command": replace_tags_command
	});

	/**
	Execute the seed command
	*/
	exec(replace_tags_command, function(error, stdout, stderr) {

		if (stderr != ''){
			winston.log('error', {  
				"Replace tags output": stderr
			});	
		}
				
		var create_ebook_command = 'ebook-convert ' + process.env.CALIBRE_POCKETPLUS_RECIPE + 
		' ' + process.env.CALIBRE_OUTPUT_FILE + ' --username ' + process.env.POCKET_USERNAME + 
		' --password ' + process.env.POCKET_PASSWORD;

		winston.log('debug', {  
			"Create ebook command": create_ebook_command
		})

		winston.log('info', {  
			"Starting ebook creation": "..."
		})

		exec(create_ebook_command, function(error, stdout, stderr) {

			winston.log('debug', {  
				"Create ebook output": stdout
			})

			if (stderr != ''){
				winston.log('error', {  
					"Creating ebook": stderr
				});
				process.exit(1);
			}

			winston.log('info', {  
				"Finished ebook creation": "OK"
			})

			if (send_ebook_to_kindle == 'true'){

				var send_ebook_command='calibre-smtp --attachment ' + process.env.CALIBRE_OUTPUT_FILE
				+ ' --relay ' + process.env.SMTP_SERVER + ' --port ' + process.env.SMTP_PORT
				+ ' --username ' + process.env.SMTP_USERNAME + ' --password '
				+ process.env.SMTP_PASSWORD + ' --encryption-method ' + process.env.SMTP_ENCRYPT
				+ ' --subject PocketToKindle ' + process.env.SMTP_USERNAME
				+ ' ' + process.env.KINDLE_ADDRESS + ' PocketToKindle';

				winston.log('debug', {  
					"Send ebook command": send_ebook_command
				})

				winston.log('info', {  
					"Sending ebook to kindle": "..."
				});

				exec(send_ebook_command, function(error, stdout, stderr) {

					winston.log('debug', {  
						"Send ebook output": stdout
					})

					if (stderr != ''){
						winston.log('error', {  
							"Sending email": stderr
						})
						process.exit(1);
					}

					winston.log('info', {  
						"Ebook sent": "OK"
					})

					if (archive_in_pocket == 'true'){

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
							consumer_key:process.env.POCKET_API_CONSUMER_KEY,
							access_token:process.env.POCKET_API_ACCESS_TOKEN
						}
					},function (err, httpResponse, body) {

						if (err != null){
							winston.log('error', {  
								"Accesing Pocket Retrieve API": err
							})
							process.exit(1);
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
							consumer_key : process.env.POCKET_API_CONSUMER_KEY,
							access_token : process.env.POCKET_API_ACCESS_TOKEN,
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
									"Accesing Pocket Modify API": errModify
								})
								process.exit(1);
							}

							winston.log('info', {  
								"Pocket bookmarks archived": "OK"
							})
						});
					});
				}
			});
			}
		});

	});
}




