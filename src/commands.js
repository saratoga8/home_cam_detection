const motion = require('./motion')
const sent_data = require('./sent_data')
const commands = {
    stopMotion: {
        command_name: "stop_motion", exec: (io = null) => {
            motion.stop()
            const data = Object.create(sent_data.types.TXT)
            data.txt = "OK"
            if(io != null) io.out.send(data)
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