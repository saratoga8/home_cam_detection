const yaml = require('js-yaml')
const config_path = 'resources/motion.yml'
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
    console.log(result)
    return result !== undefined
}

function isStopped() {
    const result = execSync('ps -e').toString().split('\n').find(str => str.includes("motion"))
    return result === undefined || result.includes("motion <defunct>")
}

const killMotion = () => {
    try {
        execSync('killall motion')
    } catch (e) {
        console.error("Can't kill motion")}
}

let counter = 0

function giveFalse() {
    console.log("bla")
    counter += 1
    return false
}

describe('Motion use', () => {
    after(killMotion)
    beforeEach(killMotion)

    it("Motion hasn't installed", async () => {
        conf.paths.motion = "/bla/bla"
        fs.writeFileSync(config_path, yaml.safeDump(conf), 'utf8')
        const result = motion.hasInstalled()
        conf.paths.motion = motionPath
        fs.writeFileSync(config_path, yaml.safeDump(conf), 'utf8')
        assert.isFalse(result, "Motion HAS installed")
    })

    it("Motion starting", async () => {
        assert.isFulfilled(testUtils.waitUntil(2, 100, isStopped), "Running Motion hasn't stopped")
        motion.start()
        assert.isTrue(isRunning(), "Motion hasn't started")
    })

    it("Motion stopping", () => {
        assert.isFulfilled(testUtils.waitUntil(2, 100, isStopped), "Running Motion hasn't stopped")
        motion.start()
        assert.isTrue(isRunning(), "Running Motion hasn't started")
        motion.stop()
        assert.isFulfilled(testUtils.waitUntil(2, 100, isStopped), "Running Motion hasn't stopped")
    })

    it.skip("Motion re-start", () => {
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

    it.skip("Should be deleted", (done) => {
        assert.isFulfilled(testUtils.waitUntil(1, 100, () => { return giveFalse() }), "Failed test")
        assert.isFulfilled(testUtils.waitUntil(1, 100, () => { return giveFalse() }), "Failed")
    })
})

exports.killMotion = killMotion
exports.isRunning = isRunning
exports.isStopped = isStopped