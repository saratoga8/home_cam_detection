const yaml = require('js-yaml')
const config_path = 'resources/motion.yml'
const fs = require('fs')
const motion = require('../src/motion')
const {execSync} = require('child_process')
const assert = require('chai').assert

describe('Motion use', () => {
    it("Motion hasn't installed", async () => {
        const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
        const motionPath = conf.paths.motion
        conf.paths.motion = "/bla/bla"
        fs.writeFileSync(config_path, yaml.safeDump(conf), 'utf8')
        const result = motion.hasInstalled()
        conf.paths.motion = motionPath
        fs.writeFileSync(config_path, yaml.safeDump(conf), 'utf8')
        assert(result == false, "Motion HAS installed")
    })

    it("Motion starting", async () => {
        let found = execSync('ps -e').toString().split('\n').find(str => str.includes("motion"))
        assert.equal(found, undefined, "Shouldn't be running any instance of Motion before testing")
        motion.start()
        found = execSync('ps -e').toString().split('\n').find(str => str.includes("motion"))
        !assert.equal(found, undefined, "Running Motion hasn't found")
    })
})