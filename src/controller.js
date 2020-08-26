const motion = require('./motion')

const stopMotion = { command_name: "stop_motion", exec: () => { motion.stop() } }
const startMotion = { command_name: "start_motion", exec: () => { motion.start() } }
const commands = [ stopMotion, startMotion ]

function run(emitter) {
    emitter.on("command", data => {
        const command = commands.find(command => command.command_name === data.name)
        if (command === undefined) console.error(`Unknown command ${data.name}`)
        command.exec()
    })
}

exports.stopMotionCmdName = stopMotion.command_name
exports.startMotionCmdName = startMotion.command_name
exports.run = run
