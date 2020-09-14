const commands = require('../commands')
const readline = require('readline')

exports.io = {
    out: {
        send: (str) => { console.log(str) }
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