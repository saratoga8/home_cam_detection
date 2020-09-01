const commands = require('./commands')
const detections = require('./detections')

function run(emitter) {
    emitter.on("command", data => {
        const command = commands.arr.find(command => command.command_name === data.name)
        if (command === undefined) console.error(`Unknown command ${data.name}`)
        command.exec()
    })
}

exports.run = run
