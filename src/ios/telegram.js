const commands = require('../commands')
const yaml = require('js-yaml')
const fs = require('fs')
const api = require('node-telegram-bot-api')


const sent_data = require('./sent_data')
const confPath = 'resources/io.yml'

const mediaGrpSize = 10
const videoMaxSize = 52428800

/**
 * Get used media message type. E.g 'image' or 'video'
 * @returns {string|*} String of the message type
 */
const mediaMsgType = () => {
    const conf = yaml.safeLoad(fs.readFileSync(confPath, 'utf8'))
    return (conf === undefined || conf.telegram === undefined) ? 'image' : conf.telegram.msg_type
}

/**
 * Load  API Token of Telegram bot
 * @returns {String|undefined} Token string or 'undefined'
 */
function loadToken() {
    const conf = yaml.safeLoad(fs.readFileSync(confPath, 'utf8'))
    const telegram = conf.telegram
    return (telegram !== undefined) ? telegram.token : undefined
}

let chatID = null
let bot = null

/**
 * Send text message
 * @param txt Message's text
 */
function sendMsg(txt) {
    bot.sendMessage(chatID, txt).catch((err) => {
        console.error(`Can't send message ${txt} to chat with ID=${chatID}: ${err}`)
    })
}

/**
 * Set chat ID of the Telegram bot
 * @param {String} id The ID
 */
function setChatID(id) {
    if(id !== chatID) {
        const conf = yaml.safeLoad(fs.readFileSync(confPath, 'utf8'))
        const telegram = conf.telegram
        if(telegram.chatID !== id) {
            conf.telegram.chatID = id
            fs.writeFileSync(confPath, yaml.safeDump(conf, 'utf8'), (err => console.error(`Can't write to file ${confPath}: ${err}`)))
        }
        chatID = id
    }
}

/**
 * Load chat ID of Telegram bot from file
 * @returns {String} ID
 */
function loadChatID() {
    const conf = yaml.safeLoad(fs.readFileSync(confPath, 'utf8'))
    const telegram = conf.telegram
    return telegram.chatID
}

/**
 * Stop motion process
 * @param {EventEmitter} emitter Emitter instance for sending events
 */
function stopMotion(emitter) {
    emitter.emit("command", { name: commands.stopMotion.command_name} )
    sendMsg("OK")
}

/**
 * Start motion process
 * @param {EventEmitter} emitter Emitter instance for sending events
 */
function startMotion(emitter) {
    emitter.emit("command", { name: commands.startMotion.command_name} )
    sendMsg("OK")
}

/**
 * Send text message with help about used commands
 */
function help() {
    const txt = "Used commands:\nhello - The first command after creating the bot\nstop - Stop visual detecting of any motion\nstart - Start visual detecting of any motion"
    sendMsg(txt)
}

/** bot commands */
const bot_cmds = [
    {name: "hello", exec: () => { sendMsg("hello") }},
    {name: "stop", exec: (emitter) => { stopMotion(emitter) } },
    {name: "start", exec: (emitter) => { startMotion(emitter) }},
    {name: "help", exec: () => { help() }},
    {name: "/start", exec: () => { sendMsg("Welcome")}} ]

/**
 * Receive message from Telegram bot
 * @param {EventEmitter} emitter Emitter instance for sending events
 */
function receiveBotMsg(emitter) {
    if(bot != null) {
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
}

/**
 * Receive errors from Telegram bot
 */
function receiveBotErr() {
    if(bot != null) {
        bot.on('error', (msg) => {
            console.error(`There is error in connecting to Telegram Bot: ${msg.text.toString()}`)
        })
        bot.on("polling_error", (err) => console.log(err));
    }
}

/**
 * Send pictures to Telegram bot
 * @param {Object} data Object containing name of the sent data and paths of images {@link ./sent_data}
 */
function sendPics(data) {
    if(data.name.startsWith(mediaMsgType())) {
        for(let i = 0; i < data.paths.length; i += mediaGrpSize) {
            const pathsArr = (i + mediaGrpSize > data.paths.length) ? data.paths.slice(i) : data.paths.slice(i, mediaGrpSize)
            const mediaGrp = pathsArr.map(path => { return {type: 'photo', media: path}})
            bot.sendMediaGroup(chatID, mediaGrp).catch((err) => console.error(`Can't send to telegram group of images: ${err}`))
        }
    }
}

function sendTxt(data) {  ///////// TODO Should be replaced by using sendMsg(txt)
    bot.sendMessage(chatID, data.text).catch((err) => console.error(`Can't send to telegram chat text message: ${err}`))
}

/**
 * Send video message to Telegram bot
 * @param {Object} data Object containing name of the sent data and paths of images {@link ./sent_data}
 * @param minFileSizeByte The size of the sent video should be more then the given minimal size in bytes
 */
function sendVideo(data, minFileSizeByte) {
    if(data.name === mediaMsgType()) {
        const size = fs.statSync(data.path).size
        if(size > minFileSizeByte) {
            if(size < videoMaxSize) {
                bot.sendVideoNote(chatID, data.path)
                    .catch((err) => console.error(`Can't send to telegram chat the file ${data.path}: ${err}`))
            }
            else
                console.error(`Sent video size is ${size} and should be less then ${videoMaxSize}`)
        }
    }
}

/**
 * Initialization of Telegram bot
 */
function initBot() {
    if(bot == null) {
        const token = loadToken()
        if(token !== undefined)
            bot = new api(token, {polling: true})
        else
            console.error("There is no Telegram bot API token found")
    }
}

/**
 * Send detections to Telegram bot
 * @param {Object} data Object containing name of the sent data and paths of images {@link ./sent_data}
 */
function sendDetections(data) {
    if (bot == null) initBot()
    if (chatID == null)
        chatID = loadChatID()

    const actions = {
        [sent_data.types.IMAGES.name]: () => { sendPics(data) },
        [sent_data.types.TXT.name]:    () => { sendTxt(data) },
        [sent_data.types.VIDEO.name]:  () => { sendVideo(data, 1024) }
    }
    if (data.name in actions)
        actions[data.name]()
    else
        console.error(`The type of detection '${data.name}' isn't supported for sending in Telegram`)
}

exports.io = {
    out: {
        send: (data) => { sendDetections(data) }
    },
    in: {
        receive: (emitter) => {
            initBot()
            receiveBotMsg(emitter)
            receiveBotErr()
            emitter.on('close', () => {process.exit(0)})
        }
    }
}