const motion = require('./motion')
const process = require('process');
const EventEmitter = require("events");

const emitter = new EventEmitter()

if(motion.hasInstalled()) {
    motion.start()
    motion.stop()
}
else
    process.exit(9)

exports.emitter = emitter