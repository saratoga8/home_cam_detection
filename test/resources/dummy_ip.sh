#!/usr/bin/env bash

if [ "delete" = "$1" ]
then
  [[ -n `ip addr | grep dummy` ]] && sudo ip link delete dummy0
fi

if [ "create" = "$1" ]
then
  IP=$2

  sudo ip link add dummy0 type dummy
  [[ -z `ip addr | grep dummy0` ]] && echo "The dummy interface not created" && exit 1
  sudo ip address add $IP/26 dev dummy0
  [[ -z `ip addr | grep $IP` ]] && echo "The IP $IP has not set to the dummy interface" && exit 1
  sudo ip link set dummy0 up
  exit 0
fi

