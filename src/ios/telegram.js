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

let chatID = null
let bot = null

function sendMsg(str) {
    bot.sendMessage(chatID, str).catch((err) => {
        console.error(`Can't send message ${str} to chat with ID=${chatID}: ${err}`)
    })
}

function setChatID(ID) {
    if(ID !== chatID) {
        const conf = yaml.safeLoad(fs.readFileSync(confPath, 'utf8'))
        const telegram = conf.telegram
        if(telegram.chatID !== ID) {
            conf.telegram.chatID = ID
            fs.writeFile(confPath, yaml.safeDump(conf, 'utf8'), (err => console.error(`Can't write to file ${confPath}: ${err}`)))
        }
        chatID = ID
    }
}

function stopMotion(emitter) {
    emitter.emit("command", { name: commands.stopMotion.command_name} )
    sendMsg("OK")
}

function startMotion(emitter) {
    emitter.emit("command", { name: commands.startMotion.command_name} )
    sendMsg("OK")
}

function help() {
    const txt = "Used commands:\nhello - The first command after creating the bot\nstop - Stop visual detecting of any motion\nstart - Start visual detecting of any motion"
    sendMsg(txt)
}

const bot_cmds = [
    {name: "hello", exec: (emitter) => { sendMsg("hello") }},
    {name: "stop", exec: (emitter) => { stopMotion(emitter) } },
    {name: "start", exec: (emitter) => { startMotion(emitter) }},
    {name: "help", exec: (emitter) => { help() }}]

function receiveBotMsg(emitter) {
    bot.on('message', (msg) => {
        setChatID(msg.chat.id)
        const cmd = bot_cmds.find(cmd => cmd.name === msg.text.toString().toLowerCase())
        if (cmd === undefined)
            sendMsg(`Unknown command ${cmd}`)
        else
            cmd.exec(emitter)
    })
}

function receiveBotErr() {
    bot.on('error', (msg) => {
        console.error(`There is error in connecting to Telegram Bot: ${msg.text.toString()}`)
    })
    bot.on("polling_error", (err) => console.log(err));
}

exports.io = {
    out: {
        send: (str) => { }
    },
    in: {
        receive: (emitter) => {
            bot = bot ?? new api(token(), {polling: true})
            receiveBotMsg(emitter);
            receiveBotErr();
            emitter.on('close', () => {process.exit(0)})
        }
    }
}