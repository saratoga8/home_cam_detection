const motion = require('./motion')
const process = require('process');
const fs = require('fs')
const controller = require('./controller')
const detections = require('../src/detections')

const args = require('yargs').argv
const pid_path = args.pid_path

const EventEmitter = require("events")
const io = require('./ios/io')

process.on('SIGTERM', () => {
    motion.stop()
    process.exit()
})

if(motion.hasInstalled()) {
    if(pid_path != undefined) {
        fs.writeFile(pid_path, process.pid.toString(), err => {
            if (err) {
                console.error(`Can't write PID to the file ${pid_path}: ${err.message}`)
                process.exit(9)
            }
        })
        const emitter = new EventEmitter()
        detections.start(emitter)
        motion.start()
        controller.run(emitter, io.ios.CLI)
        io.ios.CLI.in.receive(emitter)
        setInterval(() => {
        }, 500)
    }
    else console.error("ERROR: There is no parameter: path of file for saving PID")
}
else
    process.exit(9)
