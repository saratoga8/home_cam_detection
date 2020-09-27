const detections = require('../src/detections')
const {execSync} = require('child_process')

const chai = require('chai')
const assert = chai.assert
const should = chai.should()
chai.use(require("chai-events"));
const EventEmitter = require("events");

const emitter = new EventEmitter()
const {addImgFiles, maxSavedImgs, detectionsDirPath, newImgsTrashHold} = require('./utils')


describe('Detections use', async () => {
    it('start detecting', async () => {
        detections.cleanDir()
        detections.start(emitter)
        let p = emitter.should.emit(detections.eventStr);
        const imgsNum = newImgsTrashHold() + 2
        addImgFiles(detectionsDirPath, imgsNum)
        return p
    })

    it('clean old images', () => {
        const newFiles = parseInt(maxSavedImgs + 5)
        addImgFiles(detectionsDirPath, newFiles)
        const imgsNumStr = () => { return execSync(`ls ${detectionsDirPath}/*.jpg | wc -l`).toString() }
        assert.isAtLeast(parseInt(imgsNumStr()), newFiles, "There is not enough added images")
        detections.cleanDir()
        assert.equal(parseInt(imgsNumStr()), maxSavedImgs, "Invalid number of saved detection images")
        execSync(`rm ${detectionsDirPath}/*.jpg`)
    })
})