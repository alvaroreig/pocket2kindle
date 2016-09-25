/**
Dependencies:
- dotenv : Needed to load parameter values from .env
- winston: Needed for logging
- request: Needed to access the Pocket API
- child_process: Needed to call Calibre
*/

require('dotenv').config({silent: true});
const winston = require('winston');


var pocket_api_helper = require('./pocket_api_helper');
var calibre_helper = require('./calibre_helper');

/**
We don't have log access yet
*/
console.log("Starting process:" + new Date());

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
			"Check .env file" : ".",
			"Ending process":new Date()
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
	calibre_helper.createEbookWithPocketContent(function(){
		if (send_ebook_to_kindle == 'true'){
			calibre_helper.sendEbookToKindle(function (){
				if (archive_in_pocket == 'true'){
					pocket_api_helper.archiveInPocket();
				} else {
					winston.log('info', {
						"Ending process":new Date()
					});
				}
			})
		}
	});
}




