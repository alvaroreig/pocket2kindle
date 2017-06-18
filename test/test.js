var assert = require("assert"); // node.js core module
require('dotenv').config({silent: true});
const winston = require('winston');
winston.level = process.env.TEST_LOG_LEVEL;

var mailgun_helper = require('../src/mailgun_helper');
var calibre_helper = require('../src/calibre_helper');




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
    this.timeout(10000);
    calibre_helper.createEbookWithPocketContent(function(status){
		  assert.equal(status,0);
      done();
		});
  })
});