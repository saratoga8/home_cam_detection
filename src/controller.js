const motion = require('./motion')

const stopMotion = { command_name: "stop_motion", exec: () => { motion.stop() } }
const commands = [ stopMotion ]

function run(emitter) {
    emitter.on("command", data => {
        const command = commands.find(command => command.command_name === data.name)
        if (command === undefined) console.error(`Unknown command ${data.name}`)
        command.exec()
    })
}

exports.stopMotionCmdName = stopMotion.command_name
exports.run = run
