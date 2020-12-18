FROM node:14

WORKDIR /usr/src/home_cam
VOLUME ["/usr/src/home_cam"]

COPY features features
COPY resources resources
COPY src src
COPY test test
COPY package.json package.json
COPY telegram-cli telegram-cli

RUN touch /tmp/stam && rm /tmp/stam

#RUN apt-get update && apt-get install -y motion procps
RUN apt-get update && apt-get install -y libreadline-dev libconfig-dev libssl-dev lua5.2 liblua5.2-dev libevent-dev libjansson-dev libpython-dev make libgcrypt20-dev
RUN git clone --recursive https://github.com/vysheng/tg.git /tg

WORKDIR /tg
RUN ./configure --disable-openssl && make

ENTRYPOINT ["/bin/bash"]