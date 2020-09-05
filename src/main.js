const motion = require('./motion')
const process = require('process');
const fs = require('fs')
const controller = require('./controller')

const args = require('yargs').argv
const pid_path = args.pid_path

const EventEmitter = require("events")
const ios = require('./ios/cli')

process.on('SIGTERM', () => {
    motion.stop()
    process.exit()
})

if(motion.hasInstalled()) {
    fs.writeFile(pid_path, process.pid.toString(), err => {
        if(err) {
            console.error(`Can't write PID to the file ${pid_path}: ${err.message}`)
            process.exit(9)
        }
    })
    motion.start()
    controller.run(new EventEmitter(), ios)
    ios.io.in.receive()
    setInterval(() => {}, 100)
}
else
    process.exit(9)
