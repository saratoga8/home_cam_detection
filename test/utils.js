const sleep = require('sleep')
const {execSync} = require('child_process')
const yaml = require('js-yaml')
const fs = require('fs')

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

const config_path = 'resources/motion.yml'
const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))

exports.maxSavedImgs = conf.max_saved_imgs
exports.detectionsDirPath = conf.paths.detections_dir
exports.newImgsTrashHold = conf.new_imgs_threshold

exports.add_files = (path, num) => { execSync("for i in `seq " + num + "`; do touch \"" + path + "/file$i.jpg\"; done") }
exports.waitUntil = waitUntil