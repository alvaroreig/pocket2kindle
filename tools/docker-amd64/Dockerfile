# alvaroreig/pocket2kindle-amd64

FROM ubuntu
MAINTAINER Alvaro Reig "alvaroreig@gmail.com"

# For use while debugging
#ADD ./ /pocket2kindle
# Command for compiling images in local environment. Must cd to the root folder
#docker build -f tools/docker-amd64/Dockerfile . -t alvaroreig/pocket2kindle-amd64-debug
#docker run -it --rm -v $MY_DIR:/p2k --entrypoint=/bin/bash alvaroreig/pocket2kindle-amd64-debug

RUN \
  
  # Install dependencies.
  apt-get update && \
  DEBIAN_FRONTEND=noninteractive PYTHONIOENCODING="utf-8" apt-get install --no-install-recommends -y \
  git curl calibre ca-certificates && \   
  
  # Installing nodejs
  curl -sL https://deb.nodesource.com/setup_6.x | bash - && \
  apt-get install -y nodejs && \

  # Clone repository and install dependencies
  git clone https://github.com/alvaroreig/pocket2kindle.git && \

  cd /pocket2kindle/src && npm install && \

  # Cleaning up
  apt-get remove -y git curl && apt-get -y autoremove && apt-get clean && \ 
  apt-get purge && \
  rm -rf rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

  # Assuming that the env vars are passed on runtime, this command sends Pocket's content to Kindle.
  ENTRYPOINT cd /pocket2kindle/src && nodejs index.js