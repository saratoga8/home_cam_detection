const yaml = require('js-yaml')
const config_path = 'resources/detections.yml'
const fs = require('fs')
const motion = require('../src/motion')
const {execSync, exec} = require('child_process')
const chai = require('chai')
const assert = chai.assert
const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
const motionPath = conf.paths.motion
const testUtils = require('./utils')
const should = chai.should()
chai.use(require("chai-events"));
chai.use(require('chai-as-promised'))

function isRunning() {
    const result = execSync('ps -e').toString().split('\n').find(str => str.includes("motion"))
    return result !== undefined
}

function isStopped() {
    const result = execSync('ps -e').toString().split('\n').find(str => str.includes("motion"))
    return result === undefined || result.includes("motion <defunct>")
}

const killMotion = () => {
    try {
        const result = execSync('ps -e').toString().split('\n').find(str => str.includes("motion"))
        if(result !== undefined)
            execSync('killall motion')
    } catch (e) {
        console.error("Can't kill motion")}
}

describe('Motion use', () => {
    after(() => { motion.stop() })
    beforeEach('Kill motion', () => { motion.stop() })

    it("Motion hasn't installed", async () => {
        conf.paths.motion = "/bla/bla"
        fs.writeFileSync(config_path, yaml.safeDump(conf), 'utf8')
        const result = motion.hasInstalled()
        conf.paths.motion = motionPath
        fs.writeFileSync(config_path, yaml.safeDump(conf), 'utf8')
        assert.isFalse(result, "Motion HAS installed")
    })

    it("Motion starting and stopping", () => {
        assert.isFulfilled(testUtils.waitUntil(2, 100, isStopped), "Running Motion hasn't stopped")
        motion.start()
        assert.isTrue(isRunning(), "Running Motion hasn't started")
        motion.stop()
        assert.isFulfilled(testUtils.waitUntil(2, 100, isStopped), "Running Motion hasn't stopped")
    })

    it("Motion re-start", () => {
        assert.isFulfilled(testUtils.waitUntil(2, 100, isStopped), "Running Motion hasn't stopped")
        motion.start()
        assert.isTrue(isRunning(), "Running Motion hasn't started")
        motion.stop()
        assert.isFulfilled(testUtils.waitUntil(2, 100, isStopped), "Running Motion hasn't stopped")
        motion.start()
        assert.isTrue(isRunning(), "Running Motion hasn't re-started")
        motion.stop()
        assert.isFulfilled(testUtils.waitUntil(2, 100, isStopped), "Running Motion hasn't stopped")
    })

    it("Motion repeated starting", () => {
        assert.isFulfilled(testUtils.waitUntil(2, 100, isStopped), "Running Motion hasn't stopped")
        motion.start()
        assert.isTrue(isRunning(), "Running Motion hasn't started")
        motion.start()
        assert.isTrue(isRunning(), "Running Motion hasn't re-started")
        motion.stop()
        assert.isFulfilled(testUtils.waitUntil(2, 100, isStopped), "Running Motion hasn't stopped")
    })

    it("Motion repeated stopping", () => {
        assert.isFulfilled(testUtils.waitUntil(2, 100, isStopped), "Running Motion hasn't stopped")
        motion.start()
        assert.isTrue(isRunning(), "Running Motion hasn't started")
        motion.stop()
        assert.isFulfilled(testUtils.waitUntil(2, 100, isStopped), "Running Motion hasn't stopped")
        motion.stop()
        assert.isFulfilled(testUtils.waitUntil(2, 100, isStopped), "Running Motion hasn't stopped")
    })
})

exports.killMotion = killMotion
exports.isRunning = isRunning
exports.isStopped = isStopped