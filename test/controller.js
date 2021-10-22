const motion = require('../src/motion')
const chai = require('chai')
const controller = require('../src/controller')
const commands = require('../src/commands')

const EventEmitter = require("events")


const {setMotionPath, sleepMs} = require('./utils')
const detections = require('../src/detections')

const spies = require('chai-spies')
const expect = chai.expect

const fs = require('fs')
const motionPath = require('js-yaml').load(fs.readFileSync('resources/detections.yml', 'utf8')).paths.motion


chai.use(spies)
const io = require('../src/ios/io')
const {chkMotionState, stopEmulator} = require("./motion_emulator");

let emitter = null


describe('Controller', () => {
    before(function ()  { setMotionPath('test/resources/motion.sh') })
    after(async function ()  {
        setMotionPath(motionPath)
        stopEmulator()
    })
    afterEach(function ()  {
        controller.stop(emitter)
        chai.spy.restore(io.ios.CLI.out)
    })
    beforeEach(function ()  {
        stopEmulator()
        emitter = new EventEmitter()
        chai.spy.on(io.ios.CLI.out, ['send'])
    })

    it('Controller stops motion', async () => {
        motion.start()
        await sleepMs(500)
        chkMotionState("started")
        controller.run(emitter)
        emitter.emit("command", {name: commands.stopMotion.command_name})
        chkMotionState("stopped")
    })

    it('Controller starts motion', () => {
        controller.run(emitter)
        emitter.emit("command", { name: commands.startMotion.command_name} )
        chkMotionState("started")
    })

    it('Controller detected motion', () => {
        detections.start(emitter)
        controller.run(emitter)
        emitter.emit("detected_motion", 'bla')
        expect(io.ios.CLI.out.send).to.have.been.called(1)
    })
})