const fs = require('fs')
const {execSync} = require('child_process')
const yaml = require('js-yaml')
const chai = require('chai')
const assert = chai.assert
const { detectionsDirPath } = require('../../test/utils')
chai.use(require('chai-as-promised'))
//const telegram = require('../support/telegram-td')

const config_path = 'resources/detections.yml'
const conf = yaml.load(fs.readFileSync(config_path, 'utf8'))

const expect = chai.expect
const chaiFiles = require('chai-files')
chai.use(chaiFiles);

const { waitUntil } = require('async-wait-until')

const {Given, When, Then} = require('@cucumber/cucumber')

Given('There are no detections in directory', async function () {
    execSync(`rm -rf ${detectionsDirPath}/*.*`)
    const isDirEmpty = () => { return fs.readdirSync(detectionsDirPath).length === 0 }
    try {
        await waitUntil(isDirEmpty, {timeout: 3000})
    }
    catch (e) {
        assert.fail(`Directory ${detectionsDirPath} hasn't cleared`)
    }
})

const waitForTxtInFile = async (searchedStr, path) => {
    try {
        await waitUntil(() => {
            const txt = fs.readFileSync(path).toString()
            return txt.indexOf(searchedStr) > 0
        })
    }
    catch (e) {
        assert.fail(`There is no string '${searchedStr}' in the ${path}`)
    }
}

When(/^User (stop|start)s motion detecting by (program|telegram)$/, async function (action, type) {
    if(type === 'program') {
        this.childProc.stdin.write(`${action}\r`)
        const strings = { stop: "o", start: "Starting motion"}
        await waitForTxtInFile(strings[action], this.program.outputPath)
        await waitForTxtInFile("OK", this.program.outputPath)
    }
    // if(type === 'telegram')
    //     await telegram.send(action)
})


When(/^User (increases|decreases) detection threshold$/, function (action) {
    if(action === 'increases')
        conf.new_imgs_threshold = conf.new_imgs_threshold + 2
    fs.writeFileSync(config_path, yaml.dump(conf), 'utf8')
})

When('User sets time between detections {int}s', function (seconds) {
    conf.seconds_between_detections = seconds
    fs.writeFileSync(config_path, yaml.dump(conf), 'utf8')
})

When(/^User deletes all files of detections$/, function () {
    assert.pathExists(detectionsDirPath, "There is no directory of detections")
    execSync(`rm -rf ${detectionsDirPath}/*.*`)
    expect(detectionsDirPath).to.be.directory().and.empty
})

Then('The time between detections is {int}s', function (seconds) {
    const actual = yaml.load(fs.readFileSync(config_path, 'utf8')).seconds_between_detections
    assert.strictEqual(actual, seconds, `The file ${config_path} has invalid value of the time between detections`)
});