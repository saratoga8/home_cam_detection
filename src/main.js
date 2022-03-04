const motion = require('./motion')
const process = require('process');
process.env["NTBA_FIX_350"] = '1'
process.env["NTBA_FIX_319"] = '1'
const fs = require('fs')
const controller = require('./controller')
const detections = require('../src/detections')
const ping = require('../src/ping')

const args = require('yargs').argv
const pid_path = args.pid_path

const EventEmitter = require("events")
const emitter = new EventEmitter()

const { error, debug } = require('../src/logger/logger')


/**
 * Stop the program when the signal of killing has gotten
 */
const stopOnKillSignal = () => {
    process.on('SIGTERM', () => {
        motion.stop()
        detections.stop()
        controller.stop(emitter)
        ping.stop()
        debug("Exiting")
        process.exit()
    })
}

const startProgramParts = (io) => {
    detections.start(emitter)
    motion.start()
    controller.run(emitter, io)
    io.in.receive(emitter)
    const pingInfo = { ips: 'resources/ips.data', conf: 'resources/ping.yml' }
    ping.start(pingInfo, emitter)
}

const saveProgramPID = () => {
    const pid = process.pid.toString()
    debug(`Save program PID ${pid} to the file ${pid_path}`)
    fs.writeFile(pid_path, pid, err => {
        if (err) {
            throw new Error(`Can't write PID to the file ${pid_path}: ${err.message}`)
        }
    })
}

/**
 * Start the program with the given IO instance
 * @param io {ios} IO object (e.g. CLI or TELEGRAM)
 */
const startProgram = (io) => {
    debug('Starting program')
    saveProgramPID()
    startProgramParts(io)
    setInterval(() => {}, 500)
}

try {
    const io = require('./ios/io').loadFrom('resources/io.yml')

    stopOnKillSignal()

    if(motion.hasInstalled()) {
        if(pid_path) {
            startProgram(io)
        }
        else
            throw new Error("There is no parameter: path of file for saving PID")
    }
    else
        throw new Error("The motion isn't installed")
}
catch (err) {
    error(`Can't start the program: ${err}`)
    process.exit(9)
}


