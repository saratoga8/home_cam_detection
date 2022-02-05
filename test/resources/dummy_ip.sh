#!/usr/bin/env bash




if [ "delete" = "$1" ]
then
  [[ -n `lsmod | grep dummy` ]] && rmmod dummy
fi

if [ "create" = "$1" ]
then
  IP=$2

  modprobe -v dummy numdummies=2
  [[ -z `lsmod | grep dummy` ]] && echo "The dummy interface not created" && exit 1
  ip addr add $IP/24 dev dummy0
  [[ -z `ifconfig -a | grep $IP` ]] && echo "The IP $IP has not set to the dummy interface" && exit 1
  exit 0
fi

