const { join, resolve, sep } = require('path')
const yaml = require('js-yaml')
const fs = require('fs')
const { pathExistsSync, copySync, removeSync } = require('fs-extra')
const { waitUntil } = require('async-wait-until')

const { tmpdir } = require('os')

const { execSync } = require('child_process')

const { debug } = require('../src/logger/logger')

const chai = require('chai')
const assert = chai.assert

const { finishedVideoNotificationsDirPath } = require('../src/detections')

const config_path = 'resources/detections.yml'
const conf = yaml.load(fs.readFileSync(config_path, 'utf8'))

exports.maxSavedImgs = conf.max_saved_imgs
exports.detectionsDirPath = require('../src/detections').dirPath
exports.newImgsThreshHold = () => yaml.load(fs.readFileSync(config_path, 'utf8')).new_imgs_threshold

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
    await fs.copyFileSync(resourcesPath + sep + fileName, `${finishedVideoNotificationsDirPath}/${fileName}`)
}

exports.setMotionPath = (emulatorPath) => {
    const configPath = 'resources/detections.yml'
    const conf = yaml.load(fs.readFileSync(configPath, 'utf8'))
    conf.paths.motion = resolve(emulatorPath)
    fs.writeFileSync(configPath, yaml.dump(conf), 'utf8')
}

exports.sleepMs = async (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Store resources files
 * @return {string} The path of the directory with the stored resources
 */
exports.storeResources = () => {
    debug('Storing resources')
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

exports.clrDir = async (dirPath) => {
    debug(`Clearing ${dirPath}`)
    fs.readdirSync(dirPath).map(name => `${dirPath}/${name}`).forEach(path => fs.rmSync(path))

    const isDirEmpty = () => fs.readdirSync(dirPath).length === 0
    try {
        await waitUntil(isDirEmpty, {timeout: 3000})
    } catch (e) {
        assert.fail(`Directory ${dirPath} hasn't cleared`)
    }
}

/**
 * Set a device with the given IP to the un/reachable state
 * @param state {Object.<string, boolean>} State: { reachable: false/true }
 * @param ip {string|undefined} IP of the device
 */
exports.setDeviceState = (state, ip = undefined) => {
    const operation = state.reachable ? 'create' : 'delete'
    const suffix = state.reachable ? ` ${ip}` : ''
    try {
        execSync(`test/resources/dummy_ip.sh ${operation}${suffix}`)
    }
    catch (error) {
        assert.fail(`Cant ${operation} a dummy interface: ${error.stderr}`)
    }
}

/**
 * Create temporary file with text or empty
 * @param name {string} - File name
 * @param txt {string|''} - Text
 * @return {string} - File's path
 */
exports.createTmpFile = (name, txt = '') => {
    const dirPath = join(tmpdir(), "ping")
    if (!pathExistsSync(dirPath)) {
        fs.mkdirSync(dirPath)
    }
    const filePath = join(dirPath, name)
    fs.writeFileSync(filePath, txt, "utf8")
    return filePath
}

