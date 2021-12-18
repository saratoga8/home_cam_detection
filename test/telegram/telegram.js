const chai = require('chai')
const expect = chai.expect


const { clrDir, storeResources, restoreResources, detectionsDirPath } = require('../utils')
const { chkChatClearing, runTelegramWithoutDetections, sendAndReceiveTxtMsg, chkDetections, setTelegramBotToken, stopTelegram,
    saveMediaType,
    runTelegramWithDetections
} = require("./connection")

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

// describe('Sending detections and managing via Telegram', function () {
//     let storedResourcesPath
//
//     this.timeout(10000)
//
//     after(() => {
//         console.log("after")
//         restoreResources(storedResourcesPath)
//     })
//
//     before(async () => {
//         console.log("before")
//         expect(process.env.TAAS_KEY, "There is no TAAS key").not.undefined
//         storedResourcesPath = await beforeCommon()
//     })
//
//     beforeEach(async () => {
//         throw Error("bla")
//         await beforeEachCommon()
//     })
//
//     context('Sending commands', () => {
//         let emitter
//
//         before(() => {
//             console.log("before sending")
//             emitter = runTelegramWithoutDetections()
//         })
//         after(() => {
//             console.log("after sending")
//             stopTelegram(emitter)
//         })
//
//         const commandTests = [
//             { cmd: 'hello', expectedAnswer: 'hello' },
//             { cmd: 'bla-bla', expectedAnswer: `Unknown command bla-bla` }
//         ]
//
//         commandTests.forEach(({cmd, expectedAnswer}) => {
//             // const title = `User sends '${cmd}' command`
//             // it(title, async () => await testCommand(cmd, expectedAnswer, chatName))
//             console.log("here")
//         })
//     })
//
//     context('Sending detections', () => {
//         let emitter
//         const detectionsTests = [
//             { type: 'image' },
//             { type: 'video' }
//         ]
//
//         after(() => {
//             stopTelegram(emitter)
//         })
//
//         detectionsTests.forEach(({type}) => {
//             console.log("Here")
//             saveMediaType(type)
//             emitter = runTelegramWithDetections()
//             // const title = `Get ${type} detections`
//             // it(title, async () => await chkDetections(type, chatName))
//         })
//     })
// })

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

