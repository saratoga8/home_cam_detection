const motion = require('./motion')
const commands = {
    stopMotion: {
        command_name: "stop_motion", exec: (output = null) => {
            motion.stop()
            if(output != null) output.send('OK')
        }
    },
    startMotion: {
        command_name: "start_motion", exec: () => {
            motion.start()
        }
    }
}

exports.stopMotion = commands.stopMotion
exports.startMotion = commands.startMotion
exports.arr = [ commands.stopMotion, commands.startMotion ]