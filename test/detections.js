const detections = require('../src/detections')
const {execSync, exec} = require('child_process')
const fs = require('fs')
const yaml = require('js-yaml')
const chai = require('chai')
const assert = chai.assert
const should = chai.should()
chai.use(require("chai-events"));

const config_path = 'resources/motion.yml'
const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
const maxSavedImgs = conf.max_saved_imgs
const detectionsDirPath = conf.paths.detections_dir
const newImgsTrashHold = conf.new_imgs_threshold
const { emitter } = require('../src/main')

describe('Detections use', async () => {
    it('start detecting', async () => {
        detections.cleanDir()
        detections.start()
        let p = emitter.should.emit(detections.eventStr);
        const imgsNum = newImgsTrashHold + 2
        execSync("for i in `seq " + imgsNum + "`; do touch \"" + detectionsDirPath + "/file$i.jpg\"; done")
        return p
    })

    it('clean old images', () => {
        const newFiles = maxSavedImgs + 5
        execSync("for i in `seq " + newFiles + "`; do touch \"" + detectionsDirPath + "/file$i.jpg\"; done")
        detections.cleanDir()
        exec(`ls ${detectionsDirPath}/*.jpg | wc -l`, (err, stdout, stderr) => {
            if(stdout) assert.equal(stdout, maxSavedImgs, "Invalid number of saved detection images")
        })
        execSync(`rm ${detectionsDirPath}/*.jpg`)
      })
})