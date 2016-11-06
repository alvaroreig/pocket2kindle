# dsantoro/pocket2kindle

FROM ubuntu
MAINTAINER Daniele Santoro "psyacca@gmail.com"

# Update and install dependencies.
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
	calibre \
	nodejs \
	npm \
&& rm -rf /var/lib/apt/lists/*

# Clone repository and install dependencies
RUN git clone https://github.com/alvaroreig/pocket2kindle.git && \
    cd pocket2kindle && \
    npm install

# Cleaning up
RUN apt-get remove -y git && apt-get -y autoremove && apt-get clean && \
    apt-get purge && \
    rm -rf /tmp/* /var/tmp/*

# Assuming that the env vars are passed on runtime, this command sends Pocket's content to Kindle.
ENTRYPOINT cd pocket2kindle && nodejs index.js
