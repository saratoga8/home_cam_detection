const sleep = require('sleep')

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

exports.waitUntil = waitUntil