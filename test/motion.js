const yaml = require('js-yaml')
const config_path = 'resources/motion.yml'
const fs = require('fs')
const motion = require('../src/motion')
const {execSync, exec} = require('child_process')
const assert = require('chai').assert
const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
const motionPath = conf.paths.motion

describe('Motion use', () => {
    beforeEach(async () => {
        await exec('killall motion', (err) => {
            if (err) return
        })
    })

    after(async () => {
        await exec('killall motion', (err) => {
            if (err) return
        })
    })

    it("Motion hasn't installed", async () => {
        conf.paths.motion = "/bla/bla"
        fs.writeFileSync(config_path, yaml.safeDump(conf), 'utf8')
        const result = motion.hasInstalled()
        conf.paths.motion = motionPath
        fs.writeFileSync(config_path, yaml.safeDump(conf), 'utf8')
        assert.isFalse(result, "Motion HAS installed")
    })

    it("Motion starting", async () => {
        let found = execSync('ps -e').toString().split('\n').find(str => str.includes("motion"))
        assert.equal(found, undefined, "Shouldn't be running any instance of Motion before testing")
        motion.start()
        found = execSync('ps -e').toString().split('\n').find(str => str.includes("motion"))
        assert.notEqual(found, undefined, "Running Motion hasn't found")
    })

    it("Motion stopping", () => {
        motion.start()
        let found = execSync('ps -e').toString().split('\n').find(str => str.includes("motion"))
        assert.notEqual(found, undefined, "Running Motion hasn't found")
        motion.stop()
        setTimeout(() => {
            found = execSync('ps -e').toString().split('\n').find(str => str.includes("motion"))
            assert.equal(found, undefined, "Motion is still running")
        }, 3)
    })
})