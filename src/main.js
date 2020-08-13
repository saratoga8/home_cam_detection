const motion = require('./motion')
const process = require('process');


if(motion.hasInstalled()) {
    motion.start()
    motion.stop()
}
else
    process.exit(9)
