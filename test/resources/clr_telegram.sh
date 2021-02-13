#!/usr/bin/env bash

TELEGRAM_PATH=$1
PEER=$2

[[ "$#" != 2 ]] && echo "Invalid number of parameters. Should be: 'path to telegram-cli' 'peer name'" && exit 1

#finish_if_no_bot() {
#  RESULT=$($TELEGRAM_PATH -WNe "dialog_list" | grep "$PEER")
#  [ -z "$RESULT" ] && exit 0
#}
#
#finish_if_no_bot

MSGS_NUM=0
msg_num() {
  RESULT='bla'
  while [[ -n "$RESULT" ]]; do
     RESULT=$( (echo "dialog_list"; sleep 5; echo "history $PEER"; sleep 2; echo "quit") | $TELEGRAM_PATH -WNDC )
     MSGS_NUM=$(echo "$RESULT" | grep -c '[1-9]')
     RESULT=$(echo "$RESULT" | grep "FAIL")
  done
}

msg_num
[ $MSGS_NUM -eq 1 ] && exit 0


while true; do
  RESULT=$( (echo "dialog_list"; sleep 5; echo "history $PEER"; sleep 5; echo "delete_msg 1"; sleep 2; echo "quit") | $TELEGRAM_PATH -WND | grep "FAIL" )
  while [[ -n "$RESULT" ]]; do
      echo "retry"
      RESULT=$( (echo "dialog_list"; sleep 5; echo "history $PEER"; sleep 5; echo "delete_msg 1"; sleep 2; echo "quit") | $TELEGRAM_PATH -WND | grep "FAIL" )
  done
  msg_num
  [ $MSGS_NUM -eq 2 ] && exit 0
done
