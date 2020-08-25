const motion = require('../src/motion')
const assert = require('chai').assert
const controller = require('../src/controller')
const EventEmitter = require("events")
const {execSync, exec} = require('child_process')
const sleep = require('sleep')

const isRunning = () => {
    const result = execSync('ps -e').toString().split('\n').find(str => str.includes("motion"))
    return result !== undefined
}

const killMotion = async () => {
    await exec('killall motion', (err) => {
        if (err) return
    })
}

function waitUntil(timeoutSec, sleepMs = 100, callback) {
    return new Promise((resolve, reject) => {
        const maxNum = timeoutSec * 1000 / sleepMs
        let result = false
        for (let i = 0; i < maxNum; ++i) {
            sleep.msleep(sleepMs)
            if (callback) {
                result = true
                break
            }
        }
        resolve(result)
    })
}

describe('Controller', () => {
    after(() => { killMotion() })
    beforeEach('Kill motion', () => { killMotion() } )

    it('Controller stops motion', () => {
        motion.start()
        assert.notEqual(isRunning(), undefined, "Running Motion hasn't found")
        const emitter = new EventEmitter()
        controller.run(emitter)
        emitter.emit("command", { name: controller.stopMotionCmdName} )
        waitUntil(1, 100, isRunning()).then ( success => assert.isTrue(success, "Running Motion hasn't stopped") )
    })
})