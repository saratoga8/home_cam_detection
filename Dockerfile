FROM node:14

WORKDIR /usr/src/home_cam
VOLUME ["/usr/src/home_cam"]

COPY features features
COPY resources resources
COPY src src
COPY test test
COPY package.json package.json

RUN touch /tmp/stam && rm /tmp/stam

RUN apt-get update && apt-get install -y motion procps
RUN npm install && npm test

ENTRYPOINT ["/bin/bash"]