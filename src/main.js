const motion = require('./motion')
const process = require('process');
process.env["NTBA_FIX_350"] = '1'
process.env["NTBA_FIX_319"] = '1'
const fs = require('fs')
const controller = require('./controller')
const detections = require('../src/detections')

const args = require('yargs').argv
const pid_path = args.pid_path

const EventEmitter = require("events")

const io = require('./ios/io').loadFrom('resources/io.yml')

const { error, debug } = require('../src/logger/logger')

if(io == null) {
    error("Loading IO instance failed")
    process.exit(1)
}

process.on('SIGTERM', () => {
    motion.stop()
    debug("Exiting")
    process.exit()
})

if(motion.hasInstalled()) {
    if(pid_path !== undefined) {
        fs.writeFile(pid_path, process.pid.toString(), err => {
            if (err) {
                error(`Can't write PID to the file ${pid_path}: ${err.message}`)
                process.exit(9)
            }
        })
        const emitter = new EventEmitter()
        detections.start(emitter)
        motion.start()
        controller.run(emitter, io)
        io.in.receive(emitter)
        setInterval(() => {}, 500)
    }
    else error("ERROR: There is no parameter: path of file for saving PID")
}
else
    process.exit(9)
