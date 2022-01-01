PROCS=`ps -ef | grep "bin/node " | awk '{print $2}'`
PROCS_NUM=`echo "$PROCS" | wc -l`

if [ $PROCS_NUM -gt 1 ]
then
  echo "$PROCS" | head -n 1 | xargs kill
fi