const fs = require('fs')
const {execSync} = require('child_process')
const yaml = require('js-yaml')
const chai = require('chai')
const assert = chai.assert
const {waitUntil, detectionsDirPath} = require('../../test/utils')
chai.use(require('chai-as-promised'))

const config_path = 'resources/detections.yml'
const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
//const detectionsDirPath = conf.paths.detections_dir
const ext = conf.extensions.img

const {sleep} = require('sleep')
const expect = chai.expect
const chaiFiles = require('chai-files')
chai.use(chaiFiles);
const file = chaiFiles.file




const {Given, When} = require('cucumber')

Given('There are no detections in directory', function () {
    execSync(`rm -rf ${detectionsDirPath}/*.*`)
    const isDirEmpty = () => { return fs.readdirSync(detectionsDirPath).length === 0 }
    assert.isFulfilled(waitUntil(1, 100, isDirEmpty, "Directory hasn't cleared"))
})

When(/^User stops motion detecting by program$/, function () {
    sleep(2)
    this.childProc.stdin.write("stop\r")
    sleep(2)
    expect(file(this.program.outputPath)).to.contain("OK")
    expect(file(this.program.outputPath)).to.contain("Stopping motion")
    sleep(5)
})


When(/^User (increases|decrease) detection threshold$/, function (action) {
    if(action === 'increases')
        conf.new_imgs_threshold = conf.new_imgs_threshold + 2
    fs.writeFileSync(config_path, yaml.safeDump(conf), 'utf8')
})

When('User sets time between detections {int}s', function (seconds) {
    conf.seconds_between_detections = seconds
    fs.writeFileSync(config_path, yaml.safeDump(conf), 'utf8')
})

When(/^User deletes all files of detections$/, function () {
    assert.pathExists(detectionsDirPath, "There is no directory of detections")
    execSync(`rm -rf ${detectionsDirPath}/*.*`)
})