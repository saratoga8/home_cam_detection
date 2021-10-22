const yaml = require('js-yaml')
const config_path = 'resources/detections.yml'
const fs = require('fs')

const chai = require('chai')
const assert = chai.assert


const motion = require('../src/motion')



const conf = yaml.load(fs.readFileSync(config_path, 'utf8'))
const motionPath = conf.paths.motion

const { setMotionPath, sleepMs} = require('./utils')
const { stopEmulator, emulatorOutputFilePath, emulatorPath, chkMotionState } = require("./motion_emulator");




describe('Motion use', () => {
    after(() => {
        setMotionPath(motionPath)
        stopEmulator()
    })
    beforeEach(function ()  {
        fs.rmSync(emulatorOutputFilePath, { force: true })
        setMotionPath(emulatorPath)
        stopEmulator()
    })

    it("Motion hasn't installed", async () => {
        conf.paths.motion = "/bla/bla"
        fs.writeFileSync(config_path, yaml.dump(conf), 'utf8')
        const result = motion.hasInstalled()
        conf.paths.motion = motionPath
        fs.writeFileSync(config_path, yaml.dump(conf), 'utf8')
        assert.isFalse(result, "Motion HAS installed")
    })

    it("Motion starting and stopping", async () => {
        motion.start()
        chkMotionState("started")
        await sleepMs(500)
        motion.stop()
        chkMotionState("stopped")
    })

    it("Motion re-start", async () => {
        motion.start()
        chkMotionState("started")
        await sleepMs(500)
        motion.stop()
        chkMotionState("stopped")
        motion.start()
        chkMotionState("started")
        await sleepMs(500)
        motion.stop()
        chkMotionState("stopped")
    })

    it("Motion repeated starting", async () => {
        motion.start()
        await sleepMs(500)
        motion.start()
        chkMotionState("started")
        await sleepMs(500)
        motion.stop()
        motion.stop()
        chkMotionState("stopped")
    })

    it("Motion repeated stopping", async () => {
        motion.start()
        await sleepMs(500)
        motion.stop()
        motion.stop()
        chkMotionState("stopped")
    })
})
