const {Then, When} = require('cucumber');
const chai = require('chai')
const assert = chai.assert
const should = chai.should
const expect = chai.expect
chai.use(require('chai-fs'))
const fs = require('fs')
const {sleep} = require('sleep')

const {addImgFiles, detectionsDirPath, newImgsTrashHold} = require('../../test/utils')

const yaml = require('js-yaml')
const config_path = 'resources/detections.yml'

const {execSync} = require('child_process')

When(/^There are detections with number (more|less) than threshold$/, function (action) {
    assert.pathExists(detectionsDirPath, "There is no directory of detections")
    const imgsNum = Math.round((action == 'more') ? newImgsTrashHold() + 2 : newImgsTrashHold() / 2)
    addImgFiles(detectionsDirPath, imgsNum)
    sleep(1)
});

Then(/^Program (DOES|DOESN'T) detect motion$/, function (action) {
    const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
    const imgExt = conf.extensions.img

    const errMsg = action === 'DOES' ? "There is no found detections paths" : "There is still found detections paths"
    const pattern = RegExp(`${detectionsDirPath}/(\\w+).${imgExt}`, 'g')
    const txt = fs.readFileSync(this.program.outputPath, 'utf8')
    if (action == 'DOES') {
        assert.isNotNull(txt.match(pattern), "There is no detections")
        assert.isTrue(txt.match(pattern).length >= newImgsTrashHold(), errMsg)
    }
    else
        assert.isNull(txt.match(pattern), errMsg)
    fs.truncateSync(this.program.outputPath)
})
