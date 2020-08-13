const yaml = require('js-yaml')
const config_path = 'resources/motion.yml'
const fs = require('fs')
const motion = require('../src/motion')
const {execSync, exec} = require('child_process')
const assert = require('chai').assert
const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
const motionPath = conf.paths.motion

const isRunning = () => {
    return execSync('ps -e').toString().split('\n').find(str => str.includes("motion"))
}

const killMotion = async () => {
    await exec('killall motion', (err) => {
        if (err) return
    })
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
        assert.equal(isRunning(), undefined, "Shouldn't be running any instance of Motion before testing")
        motion.start()
        assert.notEqual(isRunning(), undefined, "Running Motion hasn't found")
    })

    it("Motion stopping", () => {
        motion.start()
        assert.notEqual(isRunning(), undefined, "Running Motion hasn't found")
        motion.stop()
        setTimeout(() => {
            assert.equal(isRunning(), undefined, "Motion is still running")
        }, 3)
    })
})