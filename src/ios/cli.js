const commands = require('../commands')
const readline = require('readline')
const sent_data = require('./sent_data')

const { debug } = require('../logger/logger')

const outputPath = '/tmp/out.txt'

const fs = require('fs')

exports.io = {
    out: {
        send: (data) => {
            if(data.name === sent_data.types.IMAGES.name) {
                debug(`Sending images: ${data.paths}`)
                fs.writeFileSync(outputPath, data.paths)
            }
            else if(data.name === sent_data.types.TXT.name) {
                debug(`Sending text: ${data.txt}`)
                fs.writeFileSync(outputPath, data.txt)
            }
            else if(data.name === sent_data.types.VIDEO.name) {
                 debug(`Sending video`)
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