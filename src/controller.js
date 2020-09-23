const commands = require('./commands')
const detections = require('./detections')
const cli = require('./ios/cli')

/**
 * Run controller
 * @param {EventEmitter} emitter Emitter instance for sending events
 * @param {CLI|TELEGRAM} io Input/Output instance
 */
function run(emitter, io = cli.io) {
    emitter.on("command", data => {
        const command = commands.arr.find(command => command.command_name === data.name)
        if (command === undefined) console.error(`Unknown command ${data.name}`)
        command.exec(io)
    })
    emitter.on(detections.eventStr, (data) => {
        io.out.send(data)
    })
}

exports.run = run
