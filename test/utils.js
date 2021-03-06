const sleep = require('sleep')
const {execSync} = require('child_process')
const yaml = require('js-yaml')
const fs = require('fs')
const {sep} = require('path')

function waitUntil(timeoutSec, sleepMs = 100, callback) {
    return new Promise((resolve, reject) => {
        const maxNum = timeoutSec * 1000 / sleepMs
        let result = false
        for (let i = 0; i < maxNum; ++i) {
            sleep.msleep(sleepMs)
            if (callback()) {
                result = true
                break
            }
        }
        result ? resolve(result) : reject(result)
    })
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
//        fs.writeFileSync(imgPath, "", {flag: 'w'})
        await fs.copyFileSync(srcImgPath, imgPath)
    }
}

const path = require('path')

exports.setMotionPath = (emulatorPath) => {
    const configPath = 'resources/detections.yml'
    const conf = yaml.safeLoad(fs.readFileSync(configPath, 'utf8'))
    conf.paths.motion = path.resolve(emulatorPath)
    fs.writeFileSync(configPath, yaml.safeDump(conf), 'utf8')
}


exports.waitUntil = waitUntil