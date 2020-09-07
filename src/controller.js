const commands = require('./commands')
const detections = require('./detections')

function run(emitter, io) {
    emitter.on("command", data => {
        const command = commands.arr.find(command => command.command_name === data.name)
        if (command === undefined) console.error(`Unknown command ${data.name}`)
        command.exec(io)
    })
    emitter.on(detections.eventStr, data => {
        io.out.send(data.files)
    })
}

exports.run = run
