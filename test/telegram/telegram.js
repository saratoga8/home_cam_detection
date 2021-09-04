const chai = require('chai')
const expect = chai.expect

const { clrDir, storeResources, restoreResources, detectionsDirPath } = require('../utils')
const { chkChatClearing, runTelegram, sendAndReceiveTxtMsg, chkDetections, setTelegramBotToken } = require("./connection")

const chatName = 'Home camera'

const beforeEachCommon = async () => {
    expect(process.env.TAAS_KEY, "There is no TAAS key").not.undefined
    await chkChatClearing(chatName)
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
    })

    beforeEach(async () => await beforeEachCommon())

    describe('Hello command', function () {
        it('User sends hello', async () => {
            const msgTxt = 'hello'
            const txts = await sendAndReceiveTxtMsg(msgTxt, 3000, chatName)
            expect([ msgTxt, msgTxt ], "The sent command or response is invalid").eql(txts)
        })

        it('User sends an invalid command', async () => {
            const msgTxt = 'bla-bla'
            const txts = await sendAndReceiveTxtMsg(msgTxt, 3000, chatName)
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
    })

    beforeEach(async () => await beforeEachCommon())

    it('Get video detection', async function() {
       await chkDetections('video', chatName)
    })

    it('Get images of detection', async function() {
        await chkDetections('image', chatName)
    })
})