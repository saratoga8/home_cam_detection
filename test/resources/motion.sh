#!/usr/bin/env bash

path=/tmp/motion.emulator
echo "Motion's emulator has started" > "$path"
sleep 30
echo "Motion's emulator has stopped" >> "$path"
