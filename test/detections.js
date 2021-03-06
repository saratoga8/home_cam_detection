const detections = require('../src/detections')
const {execSync} = require('child_process')

const chai = require('chai')
const assert = chai.assert
const should = chai.should()
chai.use(require("chai-events"));
const EventEmitter = require("events");

const fs = require('fs')

const emitter = new EventEmitter()
const {addImgFiles, maxSavedImgs, detectionsDirPath, newImgsThreshHold} = require('./utils')


describe('Detections use', async () => {
    beforeEach( () => {
        if(fs.existsSync(detectionsDirPath))
            fs.rmdirSync(detectionsDirPath, {recursive: true})
        fs.mkdirSync(detectionsDirPath, {recursive: true})
    } )

    it('start detecting when added images < thresh holder', async () => {
        detections.start(emitter)
        let p = emitter.should.not.emit(detections.eventStr);
        const imgsNum = newImgsThreshHold() - 2
        await addImgFiles(detectionsDirPath, imgsNum)
        return p
    })

    it('start detecting when added images > thresh holder', async () => {
        detections.start(emitter)
        let p = emitter.should.emit(detections.eventStr);
        const imgsNum = newImgsThreshHold() + 2
        await addImgFiles(detectionsDirPath, imgsNum)
        return p
    })

    it('clean old images', async () => {
        const newFiles = parseInt(maxSavedImgs + 5)
        await addImgFiles(detectionsDirPath, newFiles)
        const imgsNumStr = () => { return execSync(`ls ${detectionsDirPath}/*.jpg | wc -l`).toString() }
        assert.isAtLeast(parseInt(imgsNumStr()), newFiles, "There is not enough added images")
        detections.cleanDir()
        assert.equal(parseInt(imgsNumStr()), maxSavedImgs, "Invalid number of saved detection images")
        execSync(`rm ${detectionsDirPath}/*.jpg`)
    })
})