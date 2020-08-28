#!/usr/bin/env bash

FILE=".pid"
[ ! -s $FILE ] && echo "ERROR: File $FILE with PID of running program doesn't exist or empty" >> /dev/stderr && exit 1
PID=$(cat $FILE)
kill "$PID"