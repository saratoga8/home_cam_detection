FROM node:16.8.0-bullseye-slim

WORKDIR /usr/src/home_cam
VOLUME ["/usr/src/home_cam"]

COPY features features
COPY resources resources
COPY src src
COPY test test
COPY package.json package.json
COPY bin bin

RUN touch /tmp/stam && rm /tmp/stam

RUN mkdir -p motion/detections

ENTRYPOINT ["/bin/bash"]