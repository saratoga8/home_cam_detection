const fs = require('fs')
const chai = require('chai')
    , chaiHttp = require('chai-http')
chai.use(chaiHttp)
const assert = chai.assert
const expect = chai.expect
const { readFileSync } = require('fs')

const controller = require('../../src/controller')
const EventEmitter = require("events")
const io = require('../../src/ios/io')
const { storeResources, restoreResources, detectionsDirPath, addVideo, newImgsThreshHold, addImgFiles } = require('../utils')

const {execSync} = require('child_process')
const { waitUntil } = require('async-wait-until')

require('dotenv').config()

const chatName = 'Home camera'

const imgMsgType = 'messagePhoto'
const txtMsgType = 'messageText'
const videoMsgType = 'messageVideoNote'

let chatID

const yaml = require('js-yaml')
const config_path = 'resources/io.yml'
const conf = yaml.load(fs.readFileSync(config_path, 'utf8'))

const detections = require('../../src/detections')

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

const sendRequestViaTaas = async (body) => {
    body.api_key = process.env.TAAS_KEY
    const resp = await chai.request(taasURL).post("client").set('Content-Type', 'application/json; charset=utf-8').send(body)
    assert.equal(resp.status, 200, "Invalid status code")
    return resp.body
}

const messages = async () => {
    const body = JSON.parse(readFileSync('test/resources/telegram/chat_history.json', 'utf-8'))
    body.chat_id = chatID

    return (await sendRequestViaTaas(body)).messages
}

const send = async (txt) => {
    const body = JSON.parse(readFileSync('test/resources/telegram/send_txt.json', 'utf-8'))
    body.chat_id = chatID
    body.input_message_content.text.text = txt
    await sendRequestViaTaas(body)
}

const getChatIDs = async () => {
    const body = JSON.parse(readFileSync('test/resources/telegram/chats.json', 'utf-8'))
    return (await sendRequestViaTaas(body)).chat_ids
}

const getChatName = async (id) => {
    const body = JSON.parse(readFileSync('test/resources/telegram/chat.json', 'utf-8'))
    body.chat_id = id
    return (await sendRequestViaTaas(body)).title
}

const getChatID = async (name) => {
    const ids = await getChatIDs()
    const names = await Promise.all(
        ids.map(async id => await getChatName(id))
    )
    expect(names, `There is no chat with the name '${name}'`).includes(name)
    const ind = names.findIndex(curName => curName === name)
    return ids[ind]
}

const clrChat = async () => {
    const template = JSON.parse(readFileSync('test/resources/telegram/clr_chat.json', 'utf-8'))
    const addition = { api_key: process.env.TAAS_KEY, chat_id: chatID }
    const body = Object.assign(template, addition)

    const resp = await chai
        .request(taasURL)
        .post("client")
        .set('Content-Type', 'application/json; charset=utf-8')
        .send(body)
    assert.equal(resp.status, 200, "Invalid status code")
}

const chkChatClaring = async () => {
    await clrChat(chatName)
    const msgs = await messages()
    assert.isEmpty(msgs, `The chat ${chatName} hasn't cleared`)
}

const clrDir = async (dirPath) => {
    execSync(`rm -rf ${dirPath}/*.*`)
    const isDirEmpty = () => fs.readdirSync(dirPath).length === 0
    try {
        await waitUntil(isDirEmpty, {timeout: 3000})
    } catch (e) {
        assert.fail(`Directory ${dirPath} hasn't cleared`)
    }
}

const runTelegram = () => {
    const emitter = new EventEmitter()
    controller.run(emitter, io.ios.TELEGRAM)
    io.ios.TELEGRAM.in.receive(emitter)
}

const someMsgReceived = async () =>  (await messages()).length !== 0

const sendAndReceiveTxtMsg = async (msgTxt) => {
    await send(msgTxt)
    const msgs = await messages()
    assert.isNotEmpty(msgs, `There is no messages in the chat ${chatName}`)
    return getTxtMsgs(msgs)
}

const chkDetections = async (type) => {
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

    try {
        await waitUntil(someMsgReceived, { timeout: 8000 })
    } catch (e) {
        assert.fail('There is no any new messages')
    }
    const msgs = await messages()
    const mediaMsgs = (type === 'image') ? await getImgMsgs(msgs) : await getVideoMsgs(msgs)
    expect(mediaMsgs, `Cant get ${type} messages`).not.undefined
    expect(mediaMsgs, `No ${type} messages have found`).not.empty
    expect(mediaMsgs.length, `Invalid number of found ${type} messages`).equals(expectedMsgsNum)
}

function setTelegramBotToken() {
    expect(process.env.TELEGRAM_BOT_TOKEN, 'There is no Telegram bot token value').is.not.undefined
    conf.telegram.token = process.env.TELEGRAM_BOT_TOKEN
    fs.writeFileSync(config_path, yaml.dump(conf), 'utf8')
}

describe('Managing via Telegram', function () {
    let storedResourcesPath

    this.timeout(10000)

    after(() => restoreResources(storedResourcesPath))

    before(async () => {
        clrDir(detectionsDirPath)

        storedResourcesPath = storeResources()
        setTelegramBotToken()

        runTelegram()

        chatID = await getChatID(chatName)
        expect(chatID, `Can't get the ID of the chat '${chatName}'`).not.undefined
    })

    beforeEach(async () => {
        expect(process.env.TAAS_KEY, "There is no TAAS key").not.undefined
        await chkChatClaring()
    })

    describe('Hello command', function () {
        it('User sends hello', async () => {
            const msgTxt = 'hello'
            const txts = await sendAndReceiveTxtMsg(msgTxt)
            expect([ msgTxt, msgTxt ], "The sent command or response is invalid").eql(txts)
        })

        it('User sends an invalid command', async () => {
            const msgTxt = 'bla-bla'
            const txts = await sendAndReceiveTxtMsg(msgTxt)
            expect([ `Unknown command ${msgTxt}`, msgTxt ], "The sent command or response is invalid").eql(txts)
        })
    })
})

describe('Detections via Telegram', function () {
    let storedResourcesPath

    this.timeout(10000)

    after(() => restoreResources(storedResourcesPath))

    before(async () => {
        clrDir(detectionsDirPath)

        storedResourcesPath = storeResources()
        setTelegramBotToken();

        chatID = await getChatID(chatName)
        expect(chatID, `Can't get the ID of the chat '${chatName}'`).not.undefined
    })

    beforeEach(async () => {
        expect(process.env.TAAS_KEY, "There is no TAAS key").not.undefined
        await chkChatClaring()
    })

    it('Get video detection', async function() {
       await chkDetections('video')
    })

    it('Get images of detection', async function() {
        await chkDetections('image')
    })
})