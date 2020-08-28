const yaml = require('js-yaml')
const config_path = 'resources/motion.yml'
const fs = require('fs')
const motion = require('../src/motion')
const {execSync, exec} = require('child_process')
const assert = require('chai').assert
const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
const motionPath = conf.paths.motion
const testUtils = require('./utils')

const isRunning = () => {
    const result = execSync('ps -e').toString().split('\n').find(str => str.includes("motion"))
    return result !== undefined
}

const killMotion = () => {
    try {
        execSync('killall motion')
    } catch (e) {
        console.error("Can't kill motion")}
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
        testUtils.waitUntil(2, 100, () => { !isRunning() })
            .then( result => assert.isTrue(result, "Running Motion hasn't stopped") )
        motion.start()
        assert.isTrue(isRunning(), "Motion hasn't started")
    })

    it("Motion stopping", () => {
        testUtils.waitUntil(2, 100, () => { !isRunning() })
            .then( result => assert.isTrue(result, "Running Motion hasn't stopped") )
        motion.start()
        assert.isTrue(isRunning(), "Running Motion hasn't started")
        setTimeout(motion.stop, 8000)
        testUtils.waitUntil(2, 100, () => { !isRunning() })
            .then( result => assert.isTrue(result, "Running Motion hasn't stopped") )
    }).timeout(10000)

    it("Motion re-start", () => {
        testUtils.waitUntil(2, 100, () => { !isRunning() })
            .then( result => assert.isTrue(result, "Running Motion hasn't stopped") )
        motion.start()
        assert.isTrue(isRunning(), "Running Motion hasn't started")
        motion.stop()
        testUtils.waitUntil(2, 100, () => { !isRunning() })
            .then( result => assert.isTrue(result, "Running Motion hasn't stopped") )
        motion.start()
        assert.isTrue(isRunning(), "Running Motion hasn't re-started")
        motion.stop()
        testUtils.waitUntil(2, 100, () => { !isRunning() })
            .then( result => assert.isTrue(result, "Running Motion hasn't stopped") )
    })
})

exports.killMotion = killMotion
exports.isRunning = isRunning