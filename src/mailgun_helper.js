/**
Dependencies:
- dotenv : Needed to load parameter values from .env => already loaded
- winston: Needed for logging
- malgun: self explanatory
*/

const winston = require('winston');


module.exports = {
  sendEmail: function (data,callback){
    
    var api_key = process.env.MAILGUN_API_KEY
    var domain = process.env.MAILGUN_DOMAIN
    var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
  	
		winston.log('info', {  
			"Sending email to...": process.env.KINDLE_ADDRESS
		})

    mailgun.messages().send(data, function (error, body) {
    	winston.log('debug', {  
			"Mailgun response": body
		})

		if (error != undefined){
			winston.log('error', {  
				"Sending email": error,
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