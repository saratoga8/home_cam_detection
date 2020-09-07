#!/usr/bin/env bash

PID_PATH="$PWD/.pid"
cd ..
node src/main.js --pid_path="$PID_PATH" &
exit 0