const detections = require('../src/detections')
const {execSync} = require('child_process')

const chai = require('chai')
const assert = chai.assert
const expect = chai.expect
chai.should()
chai.use(require("chai-events"))
const EventEmitter = require("events");

const fs = require('fs')


const {addImgFiles, maxSavedImgs, detectionsDirPath, newImgsThreshHold, sleepMs} = require('./utils')

const spies = require('chai-spies')
chai.use(spies)
const io = require('../src/ios/io')
const controller = require('../src/controller')

const { finishedVideoNotificationsDirPath } = require('../src/detections')
const tmpFilePath = `${finishedVideoNotificationsDirPath}/video.finished`

describe('Detections use', async () => {
    let emitter

    beforeEach( () => {
        emitter = new EventEmitter()
        if(fs.existsSync(detectionsDirPath))
            fs.rmdirSync(detectionsDirPath, {recursive: true})
        if(fs.existsSync(tmpFilePath))
            fs.rmSync(tmpFilePath)
        fs.mkdirSync(detectionsDirPath, {recursive: true})
        chai.spy.on(io.ios.CLI.out, ['send'])
    } )

    afterEach(function ()  {
        controller.stop(emitter)
        detections.stop()
        emitter.removeAllListeners()
        chai.spy.restore(io.ios.CLI.out)
    })

    it('start detecting when added images < thresh holder', async () => {
        detections.start(emitter)
        controller.run(emitter)
        const imgsNum = newImgsThreshHold() - 2
        await addImgFiles(detectionsDirPath, imgsNum)
        await sleepMs(100)
        expect(io.ios.CLI.out.send).to.have.not.been.called
    })

    it('start detecting when added images > thresh holder', async () => {
        detections.start(emitter)
        controller.run(emitter)
        emitter.should.emit(detections.eventStr);
        const imgsNum = newImgsThreshHold() + 2
        await addImgFiles(detectionsDirPath, imgsNum)
        await sleepMs(100)
        expect(io.ios.CLI.out.send).to.have.been.called(1)
    })

    it('start detecting when added video', async () => {
        detections.start(emitter)
        controller.run(emitter)
        const videoPath = 'test/resources/video.mp4'
        expect(videoPath, "The file with video doesn't exist").to.be.exist
        await fs.copyFileSync(videoPath, `${detectionsDirPath}/video.mp4`)
        await fs.copyFileSync('test/resources/video.finished', tmpFilePath)
        await sleepMs(100)
        expect(io.ios.CLI.out.send).to.have.been.called(1)
    })

    it('clean old images', async () => {
        const newFiles = parseInt(maxSavedImgs + 5)
        await addImgFiles(detectionsDirPath, newFiles)
        const imgsNumStr = () => execSync(`ls ${detectionsDirPath}/*.jpg | wc -l`).toString()
        assert.isAtLeast(parseInt(imgsNumStr()), newFiles, "There is not enough added images")
        detections.cleanDir()
        await sleepMs(100)
        assert.equal(parseInt(imgsNumStr()), maxSavedImgs, "Invalid number of saved detection images")
    })
})