const commands = require('../commands')
const yaml = require('js-yaml')
const fs = require('fs')
const api = require('node-telegram-bot-api')

const confPath = 'resources/io.yml'

function token() {
    const conf = yaml.safeLoad(fs.readFileSync(confPath, 'utf8'))
    const telegram = conf.telegram
    return (telegram !== undefined) ? telegram.token : undefined
}


function hello() {
    console.log("hello")
}

let bot = null
const bot_cmds = [ {txt: "hello", exec: () => { hello() }} ]

exports.io = {
    out: {
        send: (str) => { }
    },
    in: {
        receive: (emitter = null) => {
            bot = bot ?? new api(token(), {polling: true})
            bot.on('message', (msg) => {
                console.log(msg)
                const command = bot_cmds.find(cmd => cmd.txt === msg.text().toString().toLowerCase())
                if(command === undefined)
                    console.log("Unknown command")
                else
                    console.log(command.exec)
            })
            bot.on('close', () => {process.exit(0)})
        }
    }
}