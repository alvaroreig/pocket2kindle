require('dotenv').config();
const winston = require('winston')
var request = require('request');
require('request').debug = true
var exec = require('child_process').exec;

winston.level = process.env.LOG_LEVEL;

var create_ebook=true;
var send_ebook_to_kindle=true;
var archive_in_pocket=true;

winston.log('info', {  
			"Create ebook flag": create_ebook,
			"Send ebook flag": send_ebook_to_kindle,
			"Archive in Poclet flag": archive_in_pocket
});

if (create_ebook){
	
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

		if (send_ebook_to_kindle){
			
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

				if (archive_in_pocket){

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

						/*
						Obtain the list of actions with the 
						IDs that we want to archive
						*/
						var bookmarks = new Array();
						
						for(var attributename in body.list){

							bookmarks.push({
								action : "archive",
								item_id : body.list[attributename].item_id
							});
						}

						/*
						winston.log('debug', {  
								"Bookmarks about to be archived in Pocket API": bookmarks
						})
						*/

						var modify_api_json = {
							consumer_key : process.env.POCKET_API_CONSUMER_KEY,
							access_token : process.env.POCKET_API_ACCESS_TOKEN,
							//actions : [{action:"archive",item_id:1401790956}]
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

							if (errModify != ''){
								winston.log('error', {  
									"Accesing Pocket Modify API": bodyModify
								})
								process.exit(1);
							}

							winston.log('info', {  
									"HTTP Response Code": httpResponseModify.statusCode
							})
						});
					});
				}
			});
		}
	});
}




