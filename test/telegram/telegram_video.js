const chai = require('chai')
const expect = chai.expect


const { clrDir, storeResources, restoreResources, detectionsDirPath } = require('../utils')
const { chkChatClearing, chkDetections, setTelegramBotToken, stopTelegram,
    saveMediaType,
    runTelegramWithDetections
} = require("./connection")

const chatName = 'home_cam'

const beforeEachCommon = async () => {
    await chkChatClearing(chatName)
}

const beforeCommon = async () => {
    await clrDir(detectionsDirPath)

    const storedResourcesPath = storeResources()
    setTelegramBotToken()
    return storedResourcesPath
}


describe('Sending video detections', function () {
    this.timeout(10000)

    let storedResourcesPath
    let emitter

    after(() => {
        restoreResources(storedResourcesPath)
        stopTelegram(emitter)
        emitter.removeAllListeners()
    })

    before(async () => {
        expect(process.env.TAAS_KEY, "There is no TAAS key").not.undefined
        storedResourcesPath = await beforeCommon()
        emitter = runTelegramWithDetections()
    })

    beforeEach(async () => {
        await beforeEachCommon()
    })

    it ('Sending video', async () => {
        const type = 'video'
        saveMediaType(type)
        await chkDetections(type, chatName)
    })
})