require('dotenv').config();
var request = require('request');
var exec = require('child_process').exec;

var create_ebook=true;
var archive_in_pocket=false;

if (create_ebook){
	var create_ebook_command = 'ebook-convert ' + process.env.CALIBRE_POCKETPLUS_RECIPE + 
		' ' + process.env.CALIBRE_OUTPUT_FILE + ' --username ' + process.env.POCKET_USERNAME + 
		' --password ' + process.env.POCKET_PASSWORD;


	exec(create_ebook_command, function(error, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
	});
}

if (archive_in_pocket){

	/**
	Get bookmark list from Pocket
	*/
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

		/*
		Obtain the list of actions with the 
		IDs that we want to archive
		*/
		var bookmarks = new Array();
		for(var attributename in body.list){
			bookmarks.push({
				"action" : "archive",
				"item_id" : body.list[attributename].item_id
			});
		}

		console.log(bookmarks);

		/*
		Call the modify API to archive all items
		*/

		request.post({
			url: process.env.POCKET_API_URL_MODIFY,
			json: true,
			strictSSL: false,
			headers: {
				"content-type": "application/json",
				"Accept" : "*/*"
			},
			body : {
				"consumer_key":process.env.POCKET_API_CONSUMER_KEY,
				"access_token":process.env.POCKET_API_ACCESS_TOKEN,
				"actions" : bookmarks
			}
		},function (err, httpResponse, body) {

			console.log(body);
		});

		process.exit();
	});

}


