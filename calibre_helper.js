/**
Dependencies:
- dotenv : Needed to load parameter values from .env => already loaded
- winston: Needed for logging
- child_process: Needed to call Calibre
*/

const winston = require('winston');
var exec = require('child_process').exec;

module.exports = {
  createEbookWithPocketContent: function (callback){
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
	var replace_tags_command = 'sed -i "57s/.*/    tags = ' + process.env.LIST_OF_TAGS + 
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
					"Creating ebook": stderr,
					"Ending process":new Date()
				});
				process.exit(1);
			}

			winston.log('info', {  
				"Finished ebook creation": "OK"
			})

			callback();
		});

	});
},
  sendEbookToKindle: function (callback){
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
							"Sending email": stderr,
							"Ending process":new Date()
						});
						process.exit(1);
					}

					winston.log('info', {  
						"Ebook sent": "OK"
					})

					callback();
			});
}
};