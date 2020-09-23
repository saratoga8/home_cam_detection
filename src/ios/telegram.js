const commands = require('../commands')
const yaml = require('js-yaml')
const fs = require('fs')
const api = require('node-telegram-bot-api')
process.env["NTBA_FIX_350"] = 1

const sent_data = require('./sent_data')

const confPath = 'resources/io.yml'
const {sleep} = require('sleep')

const mediaMsgType = () => {
    const conf = yaml.safeLoad(fs.readFileSync(confPath, 'utf8'))
    return (conf === undefined || conf.telegram === undefined) ? 'image' : conf.telegram.msg_type
}

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
    {name: "hello", exec: () => { sendMsg("hello") }},
    {name: "stop", exec: (emitter) => { stopMotion(emitter) } },
    {name: "start", exec: (emitter) => { startMotion(emitter) }},
    {name: "help", exec: () => { help() }},
    {name: "/start", exec: () => { sendMsg("Welcome")}} ]

function receiveBotMsg(emitter) {
    bot.on('message', (msg) => {
        setChatID(msg.chat.id)
        const sentTxt = msg.text.toString()
        const cmd = bot_cmds.find(cmd => cmd.name === sentTxt.toLowerCase())
        if (cmd === undefined)
            sendMsg(`Unknown command ${sentTxt}`)
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

function botInitialized() {
    if(bot != null) {
        if (chatID != null) return true
        console.error("Chat ID of telegram bot hasn't initialized")
    } else
        console.error("Telegram bot instance hasn't initialized")
    return false
}

function sendDetections(data) {
    if (!botInitialized()) return
    if(data.name === sent_data.types.IMAGES.name && data.name === mediaMsgType()) {
        data.paths.forEach(path => {
            bot.sendPhoto(chatID, path).catch((err) => console.error(`Can't send to telegram chat the file ${path}: ${err}`))
        })
    }
    else if(data.name === sent_data.types.TXT.name) {
        bot.sendMessage(chatID, data.text).catch((err) => console.error(`Can't send to telegram chat text message: ${err}`))
    }
    else if(data.name === sent_data.types.VIDEO.name && data.name === mediaMsgType()) {
        if(fs.statSync(data.path).size > 1000)
            bot.sendVideoNote(chatID, data.path).catch((err) => console.error(`Can't send to telegram chat the file ${data.path}: ${err}`))
    }
    else
        console.warn(`The type of detection '${data.name}' isn't supported for sending in Telegram`)
}

exports.io = {
    out: {
        send: (data) => { sendDetections(data) }
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