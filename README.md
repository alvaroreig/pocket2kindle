# pocket2kindle

THIS SOFTWARE DOESN'T WORK RIGHT DUE TO A CRITICAL BUG IN IT'S MAIN DEPENDENCY ( check https://github.com/mmagnus/Pocket-Plus-Calibre-Plugin/issues/9 ). A PATCH WILL BE SUBMITTED AS SOON AS THE DEPENDENCY IS FIXED.

[![Build Status](https://travis-ci.org/alvaroreig/pocket2kindle.svg?branch=master)](https://travis-ci.org/alvaroreig/pocket2kindle) [![Coverage Status](http://coveralls.io/repos/github/alvaroreig/pocket2kindle/badge.svg?branch=master)](https://coveralls.io/github/alvaroreig/pocket2kindle?branch=master)

Simple script that uses calibre to generate an ebook with the bookmarks stored in Pocket, sends it to the specified (kindle) email address and then archives all the sent bookmarks.

It is avalaible as a docker container, but you can download the code and run it anywhere.

- [pocket2kindle](#pocket2kindle)
  * [What does it do](#what-does-it-do)
  * [Requirements](#requirements)
    + [Docker requirements](#docker-requirements)
    + [Standalone requirements](#standalone-requirements)
  * [Getting access to Pocket API](#getting-access-to-pocket-api)
  * [Usage](#usage)
    + [Docker](#docker)
    + [Standalone](#standalone)
      - [Installation](#installation)
      - [Execution](#execution)
  * [Infraestructure](#infraestructure)
    + [Automated testing](#automated-testing)
    + [Continuous integration](#continuous-integration)
    + [Coverall information and badge](#coverall-information-and-badge)
  * [FAQ](#faq)
    + [Why do I have to provide Pocket's username/password AND the API keys?](#why-do-i-have-to-provide-pocket-s-username-password-and-the-api-keys-)
    + [I have noticed that the Pocketplus recipe already archives the bookmarks after creating the ebook, why the API calls?](#i-have-noticed-that-the-pocketplus-recipe-already-archives-the-bookmarks-after-creating-the-ebook--why-the-api-calls-)
    + [I am a Feedly user, will you provide a Feedly2Kindle version?](#i-am-a-feedly-user--will-you-provide-a-feedly2kindle-version-)
  * [Changelog](#changelog)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>Table of contents generated with markdown-toc</a></i></small>



## What does it do

This script:

* Uses Calibre to connect to your Pocket account and build an ebook with your news
* Uses Calibre to connect to an email server (Mailgun or any SMTP server) and send the ebook to your email.
* Uses the Pocket API to archive all the items

It has been tested in Docker and Linux (Ubuntu, Raspbian), but it should work in other operating systems.

## Requirements

* A Pocket account
* A Pocket CONSUMER_KEY and a valid ACCESS_TOKEN. Check 'Getting access to Pocket API' section.
* A mailgun account or an SMTP email account. I don't recommend using gmail.
* An email address to receive the ebook, if you have a kindle it will be downloaded OTA.

### Docker requirements

* Tested in Docker 17.04.0-ce, build 4845c56

### Standalone requirements

* Nodejs
* Calibre ( https://calibre-ebook.com/ )
* Pocket+ Calibre recipe, from Marcin Magnus ( https://github.com/mmagnus ). Already included.

## Getting access to Pocket API

To use this script you need access to Pocket's API, but Pocket doesn't provide developer tokens. Therefore, you have to use oath to generate an access tokens. It's simpler than it sounds, just follow this guide from James Mackenzie: 

http://www.jamesfmackenzie.com/getting-started-with-the-pocket-developer-api/

## Usage

### Docker

Pocket2kindle is avalaible in DockerHub. Just download the .env-sample file (https://raw.githubusercontent.com/alvaroreig/pocket2kindle/master/.env-sample) , input your credentials and run the container:

```sh
docker run --rm --env-file YOUR_ENV_FILE alvaroreig/pocket2kindle-amd64
```

The output will show you the progress:. With loglevel=info:
```sh
Starting process:Sun Sep 25 2016 16:58:22 GMT+0200 (CEST)
info:  Create ebook flag=true, Send ebook flag=true, Archive in Pocket flag=true
info:  List of tags=[\'Actualidad\',\'Expertos\',\'Cultura\',\'Deporte\',\'AAPP\',\'Tecnología\']
info:  Starting ebook creation=...
info:  Finished ebook creation=OK
info:  Sending ebook to kindle=...
info:  Ebook sent=OK
info:  Getting bookmark list from Pocket=...
info:  Pocket bookmarks retrieved=OK
info:  Bookmarks retrieved=6
info:  Archiving bookmark list in Pocket=...
info:  Pocket bookmarks archived=OK, Ending process=Sun Sep 25 2016 16:58:52 GMT+0200 (CEST)

```

If you want to receive your news every day, just set up a cronjob. In my raspberry pi the line is:

    # Every day at 6 AM
    00 6  * * * /usr/bin/docker run --rm --env-file=MY_ENV_FILE alvaroreig/pocket2kindle-amd64 >> MYLOG.log 2>&1

### Standalone

#### Installation

Install nodejs and calibre. Asuming Ubuntu/Debian:

```sh
sudo apt-get install calibre nodejs
```

Clone the repository:

```sh
git clone https://github.com/alvaroreig/pocket2kindle.git
```

Copy the sample .env file and fill in your values in your .env file:

```sh
cd pocket2kindle/src
cp tools/.env-sample .env
```

If you are sending the ebook to a kindle address, make sure that the email send-from address is in the approved list of your amazon account. Check https://www.amazon.com/gp/help/customer/display.html?nodeId=201974240

Only set your options in the env file, do not modify the pocketplus.recipe file.
    
Install the dependencies of the proyect

```sh
cd src && npm install
```

#### Execution

Inside the directory, execute:

```sh
cd src && npm start
```

Or directly call index.js:

```sh
cd src && node index.js
```

## Infraestructure

### Automated testing
This software has (some) automated testing using Mocha. They are located in /test/test.js:

* https://github.com/alvaroreig/pocket2kindle/blob/master/test/test.js

### Continuous integration
With every commit, pocket2kindle is tested and deployed in Travis Ci and Docker Hub:

* https://travis-ci.org/alvaroreig/pocket2kindle
* https://hub.docker.com/r/alvaroreig/pocket2kindle-amd64/

### Coverall information and badge

Testing coverage information is provided using Istambul and Coveralls:

* https://coveralls.io/github/alvaroreig/pocket2kindle?branch=master

## FAQ

### Why do I have to provide Pocket's username/password AND the API keys?

The Calibre Recipe uses web scrapping, so they username/password is needed for logging in.

The API keys are needed to archive the bookmarks.

### I have noticed that the Pocketplus recipe already archives the bookmarks after creating the ebook, why the API calls?

The pocletplus recipe works great, but sometimes (in my case, pretty often) the archive operation fails. Therefore, a bulk archive is needed if you don't want to get duplicated content the next time.

### I am a Feedly user, will you provide a Feedly2Kindle version?

Actually I am a Feedly user. I chose Pocket because the hardest part of the work ( creating the ebook) was already avalaible. My "entry point" is Feedly, but it is easy to copy news from Feedly to Pocket using IFTTT:

https://ifttt.com/recipes/102176-feeds-to-pocket

Just set up a rule that maps your desired categories in Feedly with the corresponding tags in Pocket.

If you use any other service to access your favorite sites, just look for a similar rule in IFTTT.

## Changelog

### 1.3.2
* Decoupling pocket_api_helper.js
* Bumping coveralls integration to 35%

### 1.3.1
* Mocha testing.
* Coveralls integration (19% so far)

### 1.3
* Mailgun integration
* More information if a parameter is missing

### 1.2.2
* New file structure
* Travis CI integration

### 1.2.1
* Forcing image compression due to gmail's size limit

### 1.2
* Updating recipe to support multiple images per article.
* Removing support for arm.
### 1.1.2
* Refactoring code, moving every block of functionality to helpers.
* Adding timestamp.
* Adding reference to docker image compiled in rpi.
### 1.1.1
* Docker support
* Quiet dotenv

### 1.1.0

* Included a parameter to specify the tags used in the ebook's creation process. These tags will overwrite the line 46 of the pocketplus.recipe file
* Small bugfixes
### 1.0

* First working release
