const fs = require('fs')
const { messages, send, waitForLastMsgs, clearHistory, txtMsgType } = require('./telegram-td')
const chai = require('chai')
    , chaiHttp = require('chai-http')
chai.use(chaiHttp)
const assert = chai.assert
const expect = chai.expect
const {execSync} = require('child_process')
const { waitUntil } = require('async-wait-until')
const controller = require('../../src/controller')
const EventEmitter = require("events")
const io = require('../../src/ios/io')
const {storeResources, restoreResources, detectionsDirPath} = require('../utils')



const {sleepMs} = require("../utils");


const clrDir = async (dirPath) => {
    execSync(`rm -rf ${dirPath}/*.*`)
    const isDirEmpty = () => {
        return fs.readdirSync(dirPath).length === 0
    }
    try {
        await waitUntil(isDirEmpty, {timeout: 3000})
    } catch (e) {
        assert.fail(`Directory ${dirPath} hasn't cleared`)
    }
}

const chkConnectionToTelegram = async () => {
    require('dotenv').config()
    expect(process.env.TELEGRAM_BOT_TOKEN, "Environment variable TELEGRAM_BOT_TOKEN hasn't found").not.undefined
    const resp = await chai.request("https://api.telegram.org").get(`/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates`)
    assert.equal(resp.status, 200, "User hasn't telegram bot")
}

const clearChannel = async () => {
    await clearHistory()
    await sleepMs(3000)
    let msgs = await messages()
    if(msgs.length !== 0) {
        await clearHistory()
        await sleepMs(3000)
        msgs = await messages()
        assert.equal(msgs.length, 0, 'Not all messages have been deleted')
    }
}

const runTelegram = () => {
    const emitter = new EventEmitter()
    controller.run(emitter, io.ios.TELEGRAM)
    io.ios.TELEGRAM.in.receive(emitter)
}

describe('Telegram commands', function () {
    this.timeout(10000)
    let storedResourcesPath

    afterEach(() => restoreResources(storedResourcesPath))

    beforeEach(async () => {
        await clrDir(detectionsDirPath)
        await clearChannel()
        await chkConnectionToTelegram()
        storedResourcesPath = storeResources()
        runTelegram()
    })

    it('User sends an invalid command', async () => {
        const msgTxt = 'bla-bla'
        await send(msgTxt)
        let msgs = await waitForLastMsgs(2, txtMsgType)
        assert.equal(msgs.shift(), `Unknown command ${msgTxt}`, "The answer is invalid")
        assert.equal(msgs.shift(), msgTxt, "The sent command is invalid")

    })

    it('User sends hello', async () => {
         const msgTxt = 'hello'
        await send(msgTxt)
//        await sleepMs(3000)
        const msgs = await waitForLastMsgs(1, txtMsgType)
//        assert.equal(msgs.shift(), msgTxt, "The answer is invalid")
        assert.equal(msgs.shift(), msgTxt, "The sent command is invalid")
    })

})