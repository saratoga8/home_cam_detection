const commands = require('./commands')
const detections = require('./detections')
const cli = require('./ios/cli')
const {eventMsgSent} = require('./ios/io')

const { debug } = require('../src/logger/logger')

const executeCmd = (name, io) => {
    const command = commands.arr.find(command => command.command_name === name)
    if (!command)
        throw new Error(`Unknown command ${name}`)
    command.exec(io)
}

/**
 * Run controller
 * @param {EventEmitter} emitter Emitter instance for sending events
 * @param {io.ios.CLI|TELEGRAM} io Input/Output instance; CLI is default
 */
function run(emitter, io = cli.io) {
    debug("Starting controller")
    emitter.on("command", (data) => {
        executeCmd(data.name, io)
    })
    emitter.on(detections.eventStr, (data) => {
        io.out.send(data)
    })
    emitter.on(eventMsgSent, () => {
        detections.cleanDir()
    })
}

/**
 * Run controller
 * @param {EventEmitter} emitter Emitter instance
 */
function stop(emitter) {
    debug('Stopping controller')
    emitter.removeAllListeners("command")
    emitter.removeAllListeners(detections.eventStr)
    emitter.removeAllListeners(eventMsgSent)
}

exports.run = run
exports.stop = stop
