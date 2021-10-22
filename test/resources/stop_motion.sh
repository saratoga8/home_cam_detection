#!/usr/bin/env bash

motion_file_name="motion.sh"
pid=$(ps -u "$USER" -o pid,cmd,args | grep bash | grep "/$motion_file_name" | awk '{print $1}')
kill $pid

