FROM node:slim

WORKDIR /usr/src/home_cam
VOLUME ["/usr/src/home_cam"]

RUN apt-get update && apt-get upgrade && apt-get install -y motion

ENTRYPOINT ["/bin/bash"]