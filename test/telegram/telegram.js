const chai = require('chai')
const expect = chai.expect

const { clrDir, storeResources, restoreResources, detectionsDirPath } = require('../utils')
const { chkChatClearing, runTelegram, sendAndReceiveTxtMsg, chkDetections, setTelegramBotToken, stopTelegram} = require("./connection")

const chatName = 'Home camera'

const beforeEachCommon = async () => {
    expect(process.env.TAAS_KEY, "There is no TAAS key").not.undefined
    await chkChatClearing(chatName)
}

const testCommand = async (commandTxt, expectedAnswer, chatName, timeOut = 3000) => {
    const txts = await sendAndReceiveTxtMsg(commandTxt, timeOut, chatName)
    expect([ expectedAnswer, commandTxt ], "The sent command or response is invalid").eql(txts)
}

const beforeCommon = () => {
    clrDir(detectionsDirPath)

    const storedResourcesPath = storeResources()
    setTelegramBotToken()
    return storedResourcesPath
}

describe('Sending detections and managing via Telegram', function () {
    let storedResourcesPath
    let emitter

    this.timeout(10000)

    after(() => {
        restoreResources(storedResourcesPath)
        stopTelegram(emitter)
    })

    before(async () => {
        storedResourcesPath = beforeCommon()
        emitter = runTelegram()
    })

    beforeEach(async () => await beforeEachCommon())

    context('Sending commands', () => {
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
            { type: 'video' },
//            { type: 'image' }
        ]

        detectionsTests.forEach(({type}) => {
            const title = `Get ${type} detections`
            it(title, async () => await chkDetections(type, chatName))
        })
    })
})