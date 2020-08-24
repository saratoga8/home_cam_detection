const motion = require('../src/motion')
const assert = require('chai').assert
const controller = require('../src/controller')
const EventEmitter = require("events")
const {execSync, exec} = require('child_process')

const isRunning = () => {
    return execSync('ps -e').toString().split('\n').find(str => str.includes("motion")) === undefined
}

const killMotion = async () => {
    await exec('killall motion', (err) => {
        if (err) return
    })
}

function waitUntil(timeoutSec, sleepMs = 100, msg, callback) {
    return new Promise((resolve) => {
//        const timesNum = timeoutSec * 1000 / sleepMs
//        for(let i = 0; i < timesNum; ++i) {
            setTimeout(() => {
                callback()
                resolve(true)
            }, sleepMs)
//        }
    })
}

describe('Controller', () => {
   after(() => { killMotion() })
   beforeEach('Kill motion', () => { killMotion() } )

    it('Controller stops motion', (done) => {
        motion.start()
        assert.notEqual(isRunning(), undefined, "Running Motion hasn't found")
        const emitter = new EventEmitter()
        controller.run(emitter)
        emitter.emit("command", { name: controller.stopMotionCmdName} )
        waitUntil(20, 100, "Running Motion hasn't stopped", () => {
            console.log("test")
        }).then(  success => console.log(success) )
    })
})