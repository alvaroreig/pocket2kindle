/**
Dependencies:
- dotenv : Needed to load parameter values from .env
- winston: Needed for logging
*/

require('dotenv').config({silent: true});
const winston = require('winston');


var pocket_api_helper = require('./pocket_api_helper');
var calibre_helper = require('./calibre_helper');
var mailgun_helper = require('./mailgun_helper');

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

var parameters_common = [
	['SEND_EBOOK_METHOD',process.env.SEND_EBOOK_METHOD],
	['POCKET_API_URL_GET',process.env.POCKET_API_URL_GET],
	['POCKET_API_URL_MODIFY',process.env.POCKET_API_URL_MODIFY],
	['POCKET_API_CONSUMER_KEY',process.env.POCKET_API_CONSUMER_KEY],
	['POCKET_API_ACCESS_TOKEN',process.env.POCKET_API_ACCESS_TOKEN],
	['POCKET_USERNAME',process.env.POCKET_USERNAME],
	['POCKET_PASSWORD',process.env.POCKET_PASSWORD],
	['CALIBRE_POCKETPLUS_RECIPE',process.env.CALIBRE_POCKETPLUS_RECIPE],
	['CALIBRE_OUTPUT_FILE',process.env.CALIBRE_OUTPUT_FILE],
	['KINDLE_ADDRESS',process.env.KINDLE_ADDRESS],
	['CREATE_EBOOK',process.env.CREATE_EBOOK],
	['ARCHIVE_BOOKMARKS',process.env.ARCHIVE_BOOKMARKS],
	['LIST_OF_TAGS',process.env.LIST_OF_TAGS]
];

var parameters_smtp = [
	['SMTP_SERVER',process.env.SMTP_SERVER],
	['SMTP_PORT',process.env.SMTP_PORT],
	['SMTP_ENCRYPT',process.env.SMTP_ENCRYPT],
	['SMTP_USERNAME',process.env.SMTP_USERNAME],
	['SMTP_PASSWORD',process.env.SMTP_PASSWORD]
];

var parameters_mailgun = [
	['MAILGUN_API_KEY',process.env.MAILGUN_API_KEY],
	['MAILGUN_DOMAIN',process.env.MAILGUN_DOMAIN],
	['MAILGUN_FROM_ADDRESS',process.env.MAILGUN_FROM_ADDRESS]
];

// Checking common parameters
for (var i = 0; i < parameters_common.length; i++) {
	//parameters_common[i][1] contains the value
	//parameters_common[i][0] contains the parameter name
  if (parameters_common[i][1] == null){
  		winston.log('error', {  
			"At least one of the common parameters is missing": ".",
			"Parameter missing" : parameters_common[i][0],
			"Check .env file" : ".",
			"Ending process":new Date()
		});
		process.exit(1);
  	
  }
}

// Checking mailgun parameters
if (parameters_common[0][1] == 'mailgun'){
	for (var i = 0; i < parameters_mailgun.length; i++) {
	  if (parameters_mailgun[i][1] == null){
	  		winston.log('error', {  
				"At least one of the mailgun parameters is missing": ".",
				"Parameter missing" : parameters_mailgun[i][0],
				"Check .env file" : ".",
				"Ending process":new Date()
			});
			process.exit(1);
	  	
	  }
	}
}

// Checking smtp parameters
if (parameters_common[0][1] == 'smtp'){
	for (var i = 0; i < parameters_smtp.length; i++) {
	  if (parameters_smtp[i][1] == null){
	  		winston.log('error', {  
				"At least one of the smtp parameters is missing": ".",
				"Parameter missing" : parameters_smtp[i][0],
				"Check .env file" : ".",
				"Ending process":new Date()
			});
			process.exit(1);
	  	
	  }
	}
}


if (process.env.LOG_LEVEL == 'debug'){
	require('request').debug = true;
}

var create_ebook=process.env.CREATE_EBOOK;
var send_ebook_to_kindle=process.env.SEND_EBOOK_METHOD;
var archive_in_pocket=process.env.ARCHIVE_BOOKMARKS;

winston.log('info', {  
	"Create ebook flag": create_ebook,
	"Send ebook flag": send_ebook_to_kindle,
	"Archive in Pocket flag": archive_in_pocket
});

if (create_ebook == 'true'){
	calibre_helper.createEbookWithPocketContent(function(){
		if (send_ebook_to_kindle == 'smtp'){
			calibre_helper.sendEbookToKindle(function (){
				if (archive_in_pocket == 'true'){
					pocket_api_helper.archiveInPocket();
				} else {
					winston.log('info', {
						"Ending process":new Date()
					});
				}
			})
		}else if(send_ebook_to_kindle == 'mailgun'){
			mailgun_helper.sendEmail(function (){
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




