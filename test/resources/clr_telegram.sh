#!/usr/bin/env bash

TELEGRAM_PATH=$1
PEER=$2

[[ "$#" != 2 ]] && echo "Invalid number of parameters. Should be: 'path to telegram-cli' 'peer name'"

MSGS=$($TELEGRAM_PATH -WNe "history $PEER" | grep "home_cam" | wc -l)


(echo "dialog_list"; sleep 2; echo "history $PEER"; sleep 2; echo "delete_msg 1") | $TELEGRAM_PATH -WN
for i in $MSGS; do $($TELEGRAM_PATH -WNe "delete_msg $i"); done