const yaml = require('js-yaml')
const config_path = 'resources/detections.yml'
const fs = require('fs')
const motion = require('../src/motion')
const chai = require('chai')
const assert = chai.assert
const expect = chai.expect
const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
const motionPath = conf.paths.motion
chai.use(require("chai-events"));
chai.use(require('chai-as-promised'))

const spies = require('chai-spies')
chai.use(spies)

const {setMotionEmulator} = require('./utils')

describe('Motion use', () => {
    before(() => { setMotionEmulator('test/resources/motion.sh') })
    after(() => { setMotionEmulator(motionPath) })
    afterEach(() => { chai.spy.restore(console) })
    beforeEach(() => { chai.spy.on(console, ['error', 'log', 'warn']) })

    it("Motion hasn't installed", async () => {
        conf.paths.motion = "/bla/bla"
        fs.writeFileSync(config_path, yaml.safeDump(conf), 'utf8')
        const result = motion.hasInstalled()
        conf.paths.motion = motionPath
        fs.writeFileSync(config_path, yaml.safeDump(conf), 'utf8')
        assert.isFalse(result, "Motion HAS installed")
    })

    it("Motion starting and stopping", () => {
        motion.start()
        expect(console.log).to.have.been.called.once.with("Starting motion")
        motion.stop()
        expect(console.log).to.have.been.called(2).with("Stopping motion")
        expect(console.error).to.have.not.been.called
    })

    it("Motion re-start", () => {
        motion.start()
        expect(console.log).to.have.been.called.once.with("Starting motion")
        motion.stop()
        expect(console.log).to.have.been.called(2).with("Stopping motion")
        motion.start()
        expect(console.log).to.have.been.called(3).with("Starting motion")
        motion.stop()
        expect(console.log).to.have.been.called(4).with("Stopping motion")
        expect(console.error).to.have.not.been.called
    })

    it("Motion repeated starting", () => {
        motion.start()
        motion.start()
        expect(console.log).to.have.been.called(3).with("Starting motion")
        expect(console.log).to.have.been.called(3).with("Stopping motion")
        expect(console.warn).to.have.been.called(1).with("Killing previous instance of motion")
        motion.stop()
        motion.stop()
        expect(console.log).to.have.been.called(4)
        expect(console.error).to.have.not.been.called
    })

    it("Motion repeated stopping", () => {
        motion.start()
        motion.stop()
        motion.stop()
        expect(console.log).to.have.been.called(2).with("Stopping motion")
        expect(console.error).to.have.not.been.called
    })
})
