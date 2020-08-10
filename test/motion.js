const yaml = require('js-yaml')
const config_path = 'resources/motion.yml'
const assert = require('assert')
const fs = require('fs')
const motion = require('../src/motion')

describe('Motion use', function() {
    it("Motion hasn't installed", async function () {
        const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
        const motionPath = conf.paths.motion
        conf.paths.motion = "/bla/bla"
        fs.writeFileSync(config_path, yaml.safeDump(conf), 'utf8')
        const result = motion.hasInstalled()
        conf.paths.motion = motionPath
        fs.writeFileSync(config_path, yaml.safeDump(conf), 'utf8')
        assert(result == false, "Motion HAS installed")
    })
})