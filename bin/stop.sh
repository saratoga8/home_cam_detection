#!/usr/bin/env bash

FILE=".pid"
[ ! -s $FILE ] && echo "ERROR: File $FILE with PID of running program doesn't exist or empty" && exit 1
PID=$(cat $FILE)
kill "$PID"
rm -f $FILE