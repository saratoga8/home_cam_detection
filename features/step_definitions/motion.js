const {Given, Then, When} = require('@cucumber/cucumber');
const chai = require('chai')
const assert = chai.assert
const expect = chai.expect
chai.use(require('chai-fs'))
const fs = require('fs')

const {addImgFiles, detectionsDirPath, newImgsThreshHold} = require('../../test/utils')

const yaml = require('js-yaml')
const config_path = 'resources/detections.yml'

const { resolve } = require('path')

const { waitUntil } = require('async-wait-until')

When(/^There are detections with number (more|less) than threshold$/, async function (action) {
    expect(detectionsDirPath).to.be.a.directory()
    const imgsNumBefore = fs.readdirSync(detectionsDirPath).length
    const imgsNum = Math.round((action === 'more') ? newImgsThreshHold() + 2 : newImgsThreshHold() / 2)
    await addImgFiles(detectionsDirPath, imgsNum)

    const expectedCondition = () => fs.readdirSync(detectionsDirPath).length === imgsNumBefore + imgsNum
    try {
        await waitUntil(expectedCondition, { timeout: 3000})
    } catch (e) {
        assert.fail(`Copying detections to ${detectionsDirPath} has failed`)
    }
})

Then(/^Program (DOES|DOESN'T) detect motion$/, async function (action) {
    fs.truncateSync(this.program.outputPath)
    const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
    const imgExt = conf.extensions.img

    const outputPath = this.program.outputPath

    const msgPart = action === 'DOES' ? 'are no' : 'are still'
    const errMsg = `There ${msgPart} detections paths in program's output file ${outputPath}`

    const getTxtFromOutput = () => fs.readFileSync(outputPath, 'utf8')

    const pattern = RegExp(`${detectionsDirPath}/(\\w+).${imgExt}`, 'g')
    const expectedCondition = (action === 'DOES')
        ? () => getTxtFromOutput().match(pattern) && getTxtFromOutput().match(pattern).length >= newImgsThreshHold()
        : () => getTxtFromOutput().match(pattern) === null

    try {
        await waitUntil(expectedCondition, { timeout: 3000})
    } catch (e) {
        assert.fail(errMsg)
    }
})


Given(/^There is video detection$/, async function () {
    const videoPath = resolve('test/resources/video.mp4')
    expect(videoPath, "The file with video doesn't exist").to.be.exist
    await fs.copyFileSync(videoPath, `${detectionsDirPath}/video.mp4`)
    await fs.copyFileSync('test/resources/video.finished', `/tmp/video.finished`)
});