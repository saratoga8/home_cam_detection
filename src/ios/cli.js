const commands = require('../commands')
const readline = require('readline')
const sent_data = require('../sent_data')

exports.io = {
    out: {
        send: (data) => {
            if(data.name === sent_data.types.IMAGES.name) {
                console.log(data.paths)
            }
            else if(data.name === sent_data.types.TXT.name) {
                console.log(data.txt)
            }
        }
    },
    in: {
        receive: (emitter) => {
            const rl = readline.createInterface({ input: process.stdin })
            rl.on('line', (line) => {
                switch (line.trim()) {                     // TODO use hash instead switch
                    case 'stop':
                        emitter.emit("command", { name: commands.stopMotion.command_name} )
                        break;
                    case 'start':
                        emitter.emit("command", { name: commands.startMotion.command_name} )
                        break;
                    default:
                        console.log('Unknown command: ' + line.trim())
                }
            }).on('close', () => { process.exit(0) })
        }
    }
}