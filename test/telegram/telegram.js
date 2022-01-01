const chai = require('chai')
const expect = chai.expect

const { execFileSync  } = require('child_process')

const { clrDir, storeResources, restoreResources, detectionsDirPath } = require('../utils')
const { chkChatClearing, runTelegramWithoutDetections, sendAndReceiveTxtMsg, chkDetections, setTelegramBotToken, stopTelegram,
    saveMediaType,
    runTelegramWithDetections
} = require("./connection")

const chatName = 'home_cam'

const killNodeProcPath = 'test/resources/kill_node.sh'

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

describe('Sending commands', function () {
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
        emitter = runTelegramWithoutDetections()
    })

    beforeEach(async () => {
        await beforeEachCommon()
    })

    const commandTests = [
        { cmd: 'hello', expectedAnswer: 'hello' },
        { cmd: 'bla-bla', expectedAnswer: `Unknown command bla-bla` }
    ]

    commandTests.forEach(({cmd, expectedAnswer}) => {
        const title = `User sends '${cmd}' command`
        it(title, async () => await testCommand(cmd, expectedAnswer, chatName))
    })
})

describe('Sending image detections', function () {
    this.timeout(10000)

    let storedResourcesPath
    let emitter

    after(() => {
        restoreResources(storedResourcesPath)
        stopTelegram(emitter)
        emitter.removeAllListeners()
    })

    before(async () => {
        execFileSync(killNodeProcPath)
        expect(process.env.TAAS_KEY, "There is no TAAS key").not.undefined
        storedResourcesPath = await beforeCommon()
        emitter = runTelegramWithDetections()
    })

    beforeEach(async () => {
        await beforeEachCommon()
    })

    it ('Sending images', async () => {
        const type = 'image'
        saveMediaType(type)
        await chkDetections(type, chatName)
    })
})

