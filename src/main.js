const motion = require('./motion')
const process = require('process');
const EventEmitter = require("events");



if(motion.hasInstalled()) {
    motion.start()
    motion.stop()
}
else
    process.exit(9)
