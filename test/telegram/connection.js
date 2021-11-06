const fs = require('fs')
const chai = require('chai')
    , chaiHttp = require('chai-http')
chai.use(chaiHttp)
const assert = chai.assert
const expect = chai.expect

const controller = require('../../src/controller')
const EventEmitter = require("events")
const io = require('../../src/ios/io')
const { detectionsDirPath, addVideo, newImgsThreshHold, addImgFiles } = require('../utils')


const { waitUntil } = require('async-wait-until')

require('dotenv').config()




const yaml = require('js-yaml')
const config_path = 'resources/io.yml'
const conf = yaml.load(fs.readFileSync(config_path, 'utf8'))

const detections = require('../../src/detections')

const imgMsgType = 'messagePhoto'
const txtMsgType = 'messageText'
const videoMsgType = 'messageVideoNote'

const taasURL = "https://api.t-a-a-s.ru/"

const getTxtMsgs = async (msgs) => {
    return msgs
        .filter((msg) => msg.content['@type'] === txtMsgType)
        .map((msg) => msg.content.text.text)
}

const getImgMsgs = async (msgs) => msgs.map((msg) => msg.content['@type'] === imgMsgType)

const getVideoMsgs = async (msgs) => msgs.map((msg) => msg.content['@type'] === videoMsgType)

const addVideoDetection = async () =>  await addVideo(detectionsDirPath)

const addImagesDetections = async () => {
    const imgsNum = newImgsThreshHold() + 2
    await addImgFiles(detectionsDirPath, imgsNum)
}

/**
 * Send API request via TAAS
 * @param body {JSON} JSON of the request's body
 * @return {Promise<JSON>} JSON body of a response
 */
const sendRequestViaTaas = async (body) => {
    body.api_key = process.env.TAAS_KEY
    const resp = await chai
        .request(taasURL)
        .post("client")
        .set('Content-Type', 'application/json; charset=utf-8')
        .send(body)

    assert.equal(resp.status, 200, "Invalid status code")
    return resp.body
}

/**
 * Get messages of a chat
 * @param chatName {string} Chat's name
 * @return {Promise<Object[]>} array of messages
 */
const messages = async (chatName) => {
    const body = getBodyFromResourcesFile('chat_history.json')
    body.chat_id = await getChatID(chatName)

    return (await sendRequestViaTaas(body)).messages
}

const getBodyFromResourcesFile = (fileName) => {
    const bodyTxt = fs.readFileSync(`test/resources/telegram/${fileName}`, 'utf-8')
    return JSON.parse(bodyTxt)
}

/**
 * Send text message to a chat
 * @param txt {string} Message's text
 * @param chatName {string} Chat's name
 * @return {Promise<void>}
 */
const send = async (txt, chatName) => {
    const body = getBodyFromResourcesFile('send_txt.json')
    body.chat_id = await getChatID(chatName)
    body.input_message_content.text.text = txt
    await sendRequestViaTaas(body)
}

const getChatIDs = async () => {
    const body = getBodyFromResourcesFile('chats.json')
    return (await sendRequestViaTaas(body)).chat_ids
}

const getChatName = async (id) => {
    const body = getBodyFromResourcesFile('chat.json')
    body.chat_id = id
    return (await sendRequestViaTaas(body)).title
}

const waitUntilMsgsSent = async (conditionFunc, errTxt, timeout) => {
    try {
        await waitUntil(conditionFunc, { timeout })
    } catch (e) {
        assert.fail(errTxt)
    }
}

/**
 * Get chat ID by name
 * @param name {string} Chat's name
 * @return {Promise<string>} Chat's ID
 */
const getChatID = async (name) => {
    const ids = await getChatIDs()
    const names = await Promise.all(
        ids.map(async id => await getChatName(id))
    )
    expect(names, `There is no chat with the name '${name}'`).includes(name)
    const ind = names.findIndex(curName => curName === name)
    return ids[ind]
}

const clrChat = async (name) => {
    let body = getBodyFromResourcesFile('clr_chat.json')

    const chatID = await getChatID(name)
    const addition = { api_key: process.env.TAAS_KEY, chat_id: chatID }

    body = Object.assign(body, addition)

    const resp = await chai
        .request(taasURL)
        .post("client")
        .set('Content-Type', 'application/json; charset=utf-8')
        .send(body)
    assert.equal(resp.status, 200, `Invalid status code`)
}


exports.runTelegram = () => {
    const emitter = new EventEmitter()
    controller.run(emitter, io.ios.TELEGRAM)
    io.ios.TELEGRAM.in.receive(emitter)
    return emitter
}

exports.stopTelegram = (emitter) => {
    controller.stop(emitter)
}

exports.chkChatClearing = async (chatName) => {
    await clrChat(chatName)
    const msgs = await messages(chatName)
    assert.isEmpty(msgs, `The chat ${chatName} hasn't cleared`)
}

/**
 * Send a message with the given text and wait for an answer
 * @param msgTxt {string} The text of message
 * @param timeout {number} Timeout in ms of waiting for presenting of the sent message and the answer
 * @param chatName {string} Telegram chat name
 * @return {Promise<string[]>} The texts of messages from chat
 */
exports.sendAndReceiveTxtMsg = async (msgTxt, timeout, chatName) => {
    await send(msgTxt, chatName)

    const errTxt = `There are no sent and received messages in the chat '${chatName}'`

    const expectedCond = async () => (await messages(chatName)).length === 2
    await waitUntilMsgsSent(expectedCond, errTxt, timeout)
    const msgs = await messages(chatName)
    return getTxtMsgs(msgs)
}

/**
 * Check receiving detections chat
 * @param type {string} Type of detection (video/image)
 * @param chatName {string} Chat's name
 * @return {Promise<void>}
 */
exports.chkDetections = async (type, chatName) => {
    conf.telegram.msg_type = type
    fs.writeFileSync(config_path, yaml.dump(conf), 'utf8')

    const emitter = new EventEmitter()
    detections.start(emitter)
    controller.run(emitter, io.ios.TELEGRAM)

    if (type === 'image')
        await addImagesDetections()
    else
        await addVideoDetection()

    const expectedMsgsNum = (type === 'image') ? newImgsThreshHold() : 1
    const expectedCond = async () => {
        const actual = (await messages(chatName)).length
        console.log(`Expected: ${expectedMsgsNum}, actual: ${actual}`)
        return actual === expectedMsgsNum
    }
    await waitUntilMsgsSent(expectedCond, 'There are no enough detection messages', 8000)

    const msgs = await messages(chatName)
    const mediaMsgs = (type === 'image') ? await getImgMsgs(msgs) : await getVideoMsgs(msgs)
    expect(mediaMsgs, `Cant get ${type} messages`).not.undefined
    expect(mediaMsgs, `No ${type} messages have found`).not.empty
    expect(mediaMsgs.length, `Invalid number of found ${type} messages`).equals(expectedMsgsNum)
}

exports.setTelegramBotToken = () => {
    expect(process.env.TELEGRAM_BOT_TOKEN, 'There is no Telegram bot token value').is.not.undefined
    conf.telegram.token = process.env.TELEGRAM_BOT_TOKEN
    fs.writeFileSync(config_path, yaml.dump(conf), 'utf8')
}