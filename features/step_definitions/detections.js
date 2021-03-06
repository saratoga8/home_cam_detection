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

const telegram = require('../support/telegram-cli')
const {Given, When, Then} = require('@cucumber/cucumber')

Given('There are no detections in directory', function () {
    execSync(`rm -rf ${detectionsDirPath}/*.*`)
    const isDirEmpty = () => { return fs.readdirSync(detectionsDirPath).length === 0 }
    assert.isFulfilled(waitUntil(1, 100, isDirEmpty, "Directory hasn't cleared"))
})

When(/^User (stop|start)s motion detecting by (program|telegram)$/, function (action, type) {
    if(type === 'program') {
        this.childProc.stdin.write(`${action}\r`)
        sleep(1)
        expect(file(this.program.outputPath)).to.contain("OK")
        const txt = { stop: "Stopping motion", start: "Starting motion"}
        expect(file(this.program.outputPath)).to.contain(txt[action])
    }
    if(type === 'telegram')
        telegram.sendMsg(action, telegram.botName)
})


When(/^User (increases|decreases) detection threshold$/, function (action) {
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

Then('The time between detections is {int}s', function (seconds) {
    const actual = yaml.safeLoad(fs.readFileSync(config_path, 'utf8')).seconds_between_detections
    assert.strictEqual(actual, seconds, `The file ${config_path} has invalid value of the time between detections`)
});