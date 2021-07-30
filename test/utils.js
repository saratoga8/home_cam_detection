const { join, resolve, sep } = require('path')
const yaml = require('js-yaml')
const fs = require('fs')
const { tmpdir } = require('os')
const { copySync, removeSync } = require('fs-extra')

const waitUntil = async (expectedCondition, timeoutSec, stepMSec = 100) => {
    const times = timeoutSec * 1000 / stepMSec
    let result = false
    for (let i = 0; i < times; ++i) {
        setTimeout(async () => {
            result = await expectedCondition()
        }, stepMSec)
        if(result)
            break
    }
    return result
}

const config_path = 'resources/detections.yml'
const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))

exports.maxSavedImgs = conf.max_saved_imgs
exports.detectionsDirPath = require('../src/detections').dirPath
exports.newImgsThreshHold = () => yaml.safeLoad(fs.readFileSync(config_path, 'utf8')).new_imgs_threshold

exports.addImgFiles = async (path, num) => {
    const srcImgPath = 'test/resources/square.jpg'
    for(let i = 0; i < num; i++) {
        const imgPath = `${path}${sep}file${Math.floor(Math.random() * 1000)}.jpg`
        await fs.copyFileSync(srcImgPath, imgPath)
    }
}

exports.addVideo = async (destPath) => {
    const resourcesPath = resolve('test/resources/')
    let fileName = 'video.mp4'
    const videoPath = resourcesPath + sep + fileName
    await fs.copyFileSync(videoPath, destPath + sep + fileName)
    fileName = 'video.finished'
    await fs.copyFileSync(resourcesPath + sep + fileName, `/tmp/${fileName}`)
}

exports.setMotionPath = (emulatorPath) => {
    const configPath = 'resources/detections.yml'
    const conf = yaml.safeLoad(fs.readFileSync(configPath, 'utf8'))
    conf.paths.motion = resolve(emulatorPath)
    fs.writeFileSync(configPath, yaml.safeDump(conf), 'utf8')
}

exports.sleepMs = async (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Store resources files
 * @return {string} The path of the directory with the stored resources
 */
exports.storeResources = () => {
    const dirPath = fs.mkdtempSync(join(tmpdir(), "resources"), "utf8")
    copySync(resolve('resources'), dirPath)
    return dirPath
}

/**
 * Restore resources from the given directory
 * @param {string} fromPath
 */
exports.restoreResources = (fromPath) => {
    copySync(fromPath, resolve('resources'))
    removeSync(fromPath)
}