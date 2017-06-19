var assert = require("assert"); // node.js core module
require('dotenv').config({silent: true});
const winston = require('winston');
winston.level = process.env.TEST_LOG_LEVEL;

var mailgun_helper = require('../src/mailgun_helper');
var calibre_helper = require('../src/calibre_helper');
var pocket_api_helper = require('../src/pocket_api_helper');


describe('mailgun_helper.js', function(){
  it('should send an email using sendEmail(data,callback()', function(done){
    
    var data = {
    	from: process.env.MAILGUN_FROM_ADDRESS,
    	to: process.env.TEST_MAIL_TO_ADDRESS,
    	subject: 'Your testing email',
    	text: 'Email body while testing with mocha'
  	};
  	
    mailgun_helper.sendEmail(data,function(status){
        assert.equal(status,0);
        done();
    });
  })
});

describe('calibre_helper.js', function(){
  it('should create an ebbok using createEbookWithPocketContent(callback()', function(done){
    this.timeout(20000);
    calibre_helper.createEbookWithPocketContent(function(status){
		  assert.equal(status,0);
      done();
		});
  })
});

describe('pocket_api_helper.js', function(){
  it('should archive every item using archiveInPocket(consumer_key,access_token)', function(done){
    this.timeout(20000);
    pocket_api_helper.archiveInPocket(process.env.TEST_POCKET_API_CONSUMER_KEY,process.env.TEST_POCKET_API_ACCESS_TOKEN,function(status){
		  assert.equal(status,200);
      done();
		});
  })
  it('should fail as the credentials are wrong using archiveInPocket(consumer_key,access_token)', function(done){
    this.timeout(20000);
    pocket_api_helper.archiveInPocket("wrong","also_wrong",function(status){
		  assert.notEqual(status,200);
      done();
		});
  })
});