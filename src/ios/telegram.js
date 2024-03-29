/** @module telegram */

const commands = require('../commands')
const yaml = require('js-yaml')
const { readFileSync, statSync, writeFileSync } = require('fs')
const api = require('node-telegram-bot-api')

require('dotenv').config()


const sent_data = require('./sent_data')
const confPath = 'resources/io.yml'

const mediaGrpSize = 10
const videoMaxSize = 52428800

const { debug, warn } = require('../logger/logger')

/**
 * Get used media message type. E.g 'image' or 'video'
 * @returns {string|*} String of the message type
 */
const mediaMsgType = () => {
    const conf = yaml.load(readFileSync(confPath, 'utf8'))
    return (conf === undefined || conf.telegram === undefined) ? 'image' : conf.telegram.msg_type
}

/**
 * Load  API Token of Telegram bot
 * @returns {String|undefined} Token string or 'undefined'
 */
function initToken() {
    debug('Initialization of Telegram Bot token')
    const conf = yaml.load(readFileSync(confPath, 'utf8'))
    const telegram = conf.telegram
    return (telegram && telegram.token) ? telegram.token : process.env.TELEGRAM_BOT_TOKEN
}

let chatID = undefined
let bot = null

/**
 * Send text message
 * @param txt Message's text
 */
function sendMsg(txt) {
    debug(`Sending the message '${txt}' to the Telegram Bot`)
    bot.sendMessage(chatID, txt).catch((err) => {
        console.error(`Can't send message ${txt} to chat with ID=${chatID}: ${err}`)
    })
}

/**
 * Initialisation of a chat ID from config file or from a environment variable
 * @return {string} Chat's ID
 */
function initChatID() {
    if (!process.env.TELEGRAM_BOT_CHAT) {
        const conf = yaml.load(readFileSync(confPath, 'utf8'))
        return conf.telegram.chatID
    }
    return process.env.TELEGRAM_BOT_CHAT
}

/**
 * Set chat ID of the Telegram bot
 * @param {String} id The ID
 */
function setChatID(id) {
    debug(`Setting Telegram Chat ID to ${id}`)
    const conf = yaml.load(readFileSync(confPath, 'utf8'))
    const telegram = conf.telegram
    if(id !== chatID) {
        if(telegram.chatID !== id) {
            telegram.chatID = id
            writeFileSync(confPath, yaml.dump(conf, 'utf8'), (err => console.error(`Can't write to file ${confPath}: ${err}`)))
        }
        chatID = id
    }
}

/**
 * Load chat ID of Telegram bot from file
 * @returns {String} ID
 *
function loadChatID() {
    const conf = yaml.load(fs.readFileSync(confPath, 'utf8'))
    const telegram = conf.telegram
    return telegram.chatID
}*/

/**
 * Stop motion process
 * @param {EventEmitter} emitter Emitter instance for sending events
 */
function stopMotion(emitter) {
    debug('Stopping Motion')
    emitter.emit("command", { name: commands.stopMotion.command_name} )
    sendMsg("OK")
}

/**
 * Start motion process
 * @param {EventEmitter} emitter Emitter instance for sending events
 */
function startMotion(emitter) {
    debug('Starting Motion')
    emitter.emit("command", { name: commands.startMotion.command_name} )
    sendMsg("OK")
}

/**
 * Send text message with help about used commands
 */
function help() {
    debug('Sending help command to the Telegram Bot')
    const txt = "Used commands:\nhello - The first command after creating the bot\nstop - Stop visual detecting of any motion\nstart - Start visual detecting of any motion"
    sendMsg(txt)
}

/** bot commands */
const bot_cmds = [
    {name: "hello", exec: () => { sendMsg("hello") }},
    {name: "stop", exec: (emitter) => { stopMotion(emitter) } },
    {name: "start", exec: (emitter) => { startMotion(emitter) }},
    {name: "help", exec: () => { help() }},
    {name: "/start", exec: () => { sendMsg("Welcome")}}
]

/**
 * Receive message from Telegram bot
 * @param {EventEmitter} emitter Emitter instance for sending events
 */
function receiveBotMsg(emitter) {
    debug('Receiving message from Telegram Bot')
    if(bot != null) {
        bot.on('message', (msg) => {
            setChatID(msg.chat.id)
            if (msg.text) {
                const sentTxt = msg.text.toString()
                const cmd = bot_cmds.find(cmd => cmd.name === sentTxt.toLowerCase())
                if (cmd === undefined)
                    sendMsg(`Unknown command ${sentTxt}`)
                else
                    cmd.exec(emitter)
            }
        })
    }
}

/**
 * Receive errors from Telegram bot
 */
function receiveBotErr() {
    if(bot) {
        bot.on('error', (msg) => {
            throw new Error(`There is error in connecting to Telegram Bot: ${msg.text.toString()}`)
        })
        bot.on("polling_error", (err) => warn(err));
    }
}

/**
 * Send pictures to Telegram bot
 * @param {Object} data Object containing name of the sent data and paths of images {@link sent_data}
 */
function sendPics(data) {
    debug("Sending pictures")
    if(data.name.startsWith(mediaMsgType())) {
        for(let i = 0; i < data.paths.length; i += mediaGrpSize) {
            const pathsArr = (i + mediaGrpSize > data.paths.length) ? data.paths.slice(i) : data.paths.slice(i, mediaGrpSize)
            const mediaGrp = pathsArr.map(path => { return {type: 'photo', media: path}})
            bot.sendMediaGroup(chatID, mediaGrp).catch((err) => console.error(`Can't send to telegram a group of images: ${err}`))
        }
    }
}

function sendTxt(data) {  ///////// TODO Should be replaced by using sendMsg(txt)
    debug("Sending text message")
    if (bot)
        bot.sendMessage(chatID, data.text).catch((err) => console.error(`Can't send to telegram chat text message: ${err}`))
    else
        throw new Error("Bot instance hasn't initialized")
}

/**
 * Send video message to Telegram bot
 * @param {Object} data Object containing name of the sent data and paths of images {@link sent_data}
 * @param minFileSizeByte The size of the sent video should be more then the given minimal size in bytes
 */
function sendVideo(data, minFileSizeByte) {
    debug("Sending video message")
    if(data.name === mediaMsgType()) {
        const size = statSync(data.path).size
        debug(`Sending video ${data.path} : ${size}`)
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
    debug("Initialization of Telegram Bot")
    if(bot == null) {
        const token = initToken()
        if(token && token !== '')
            bot = new api(token, {polling: true})
        else
            throw new Error("There is no Telegram bot API token found")
        if(!chatID) {
            chatID = initChatID()
        }
    }
}

/**
 * Send detections to Telegram bot
 * @param {Object} data Object containing name of the sent data and paths of images {@link sent_data}
 */
function sendDetections(data) {
    if (!bot) initBot()              ///// TODO The case of still bot === null should be fixed

    const actions = {
        [sent_data.types.IMAGES.name]: () => { sendPics(data) },
        [sent_data.types.TXT.name]:    () => { sendTxt(data) },
        [sent_data.types.VIDEO.name]:  () => { sendVideo(data, 1024) }
    }
    if (data.name in actions)
        actions[data.name]()
    else
        throw new Error(`The type of detection '${data.name}' isn't supported for sending in Telegram`)
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
            emitter.on('close', () => {
                debug('Stopping bot')
                bot.removeAllListeners()
            })
        }
    }
}
