const fs = require('fs')
const { waitForLastMsgs, clearHistory, areLastMessagesOfType, videoMsgType, imgMsgType } = require('./telegram-td')
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
const {storeResources, restoreResources, addImgFiles, detectionsDirPath, newImgsThreshHold, addVideo} = require('../utils')

const detections = require('../../src/detections')



const yaml = require('js-yaml')
const config_path = 'resources/io.yml'
const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))


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

const clrBotFromMsgs = async () => {
    await clearHistory()
}

const addImagesDetections = async () => {
    const imgsNum = newImgsThreshHold() + 2
    await addImgFiles(detectionsDirPath, imgsNum)
}

const addVideoDetection = async () => {
    await addVideo(detectionsDirPath)
}

const chkConnectionToTelegram = async () => {
    require('dotenv').config()
    expect(process.env.TELEGRAM_BOT_TOKEN, "Environment variable TELEGRAM_BOT_TOKEN hasn't found").not.undefined
    const resp = await chai.request("https://api.telegram.org").get(`/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates`)
    assert.equal(resp.status, 200, "User hasn't telegram bot")
}

describe('Telegram detections', function () {
    this.timeout(5000)
    let storedResourcesPath

    beforeEach(async () => {
        await chkConnectionToTelegram()
        storedResourcesPath = storeResources()
        await clrDir(detectionsDirPath)
        await clrBotFromMsgs()
    })

    afterEach(() => restoreResources(storedResourcesPath))

    it('Get images message', async function() {
        conf.telegram.msg_type = 'image'
        fs.writeFileSync(config_path, yaml.safeDump(conf), 'utf8')

        const emitter = new EventEmitter()
        detections.start(emitter)
        controller.run(emitter, io.ios.TELEGRAM)

        await addImagesDetections()
        const expectedMsgsNum = newImgsThreshHold() + 1
        const lastMsgs = await waitForLastMsgs(expectedMsgsNum)
        assert.equal(lastMsgs.length, expectedMsgsNum, 'Invalid number of received messages')
        assert(await areLastMessagesOfType(imgMsgType), 'Not all received messages are images')
    })

    it('Get video message', async function() {
        conf.telegram.msg_type = 'video'
        fs.writeFileSync(config_path, yaml.safeDump(conf), 'utf8')

        const emitter = new EventEmitter()
        detections.start(emitter)
        controller.run(emitter, io.ios.TELEGRAM)

        await addVideoDetection()

        await waitForLastMsgs(1)
        assert(await areLastMessagesOfType(videoMsgType), 'Not all received messages are videos')
    })

})
