const chai = require('chai')
const expect = chai.expect

const { clrDir, storeResources, restoreResources, detectionsDirPath } = require('../utils')
const { chkChatClearing, runTelegram, sendAndReceiveTxtMsg, chkDetections, setTelegramBotToken, stopTelegram} = require("./connection")

const chatName = 'home_cam'

const beforeEachCommon = async () => {
    await chkChatClearing(chatName)
}

const testCommand = async (commandTxt, expectedAnswer, chatName, timeOut = 3000) => {
    const txts = await sendAndReceiveTxtMsg(commandTxt, timeOut, chatName)
    expect([ expectedAnswer, commandTxt ], "The sent command or response is invalid").eql(txts)
}

const beforeCommon = async () => {
    await clrDir(detectionsDirPath)

    const storedResourcesPath = storeResources()
    setTelegramBotToken()
    return storedResourcesPath
}

describe('Sending detections and managing via Telegram', function () {
    let storedResourcesPath

    this.timeout(10000)

    after(() => {
        restoreResources(storedResourcesPath)
    })

    before(async () => {
        expect(process.env.TAAS_KEY, "There is no TAAS key").not.undefined
        storedResourcesPath = await beforeCommon()
    })

    beforeEach(async () => await beforeEachCommon())

    context('Sending commands', () => {
        let emitter

        before(() => { emitter = runTelegram() })
        after(() => { stopTelegram(emitter) })

        const commandTests = [
            { cmd: 'hello', expectedAnswer: 'hello' },
            { cmd: 'bla-bla', expectedAnswer: `Unknown command bla-bla` }
        ]

        commandTests.forEach(({cmd, expectedAnswer}) => {
            const title = `User sends '${cmd}' command`
            it(title, async () => await testCommand(cmd, expectedAnswer, chatName))
        })
    })

    context('Sending detections', () => {
        const detectionsTests = [
            { type: 'image' },
            { type: 'video' }
        ]

        detectionsTests.forEach(({type}) => {
            const title = `Get ${type} detections`
            it(title, async () => await chkDetections(type, chatName))   /////////////// SHOULD BE EXTRACTED CONTROLLER AND DETECTIONS TO BEFORE/AFTER HOOK
        })
    })
})