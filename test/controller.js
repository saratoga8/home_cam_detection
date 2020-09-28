const motion = require('../src/motion')
const chai = require('chai')
const controller = require('../src/controller')
const commands = require('../src/commands')

const EventEmitter = require("events")


const {setMotionPath} = require('./utils')
const detections = require('../src/detections')

const spies = require('chai-spies')
const expect = chai.expect

const fs = require('fs')
const motionPath = require('js-yaml').safeLoad(fs.readFileSync('resources/detections.yml', 'utf8')).paths.motion


chai.use(spies)
const io = require('../src/ios/io')

let emitter = null

describe('Controller', () => {
    before(function ()  { setMotionPath('test/resources/motion.sh') })
    after(function ()  { setMotionPath(motionPath) })
    afterEach(function ()  {
        chai.spy.restore(console)
        chai.spy.restore(io.ios.CLI.out)
    })
    beforeEach(function ()  {
        emitter = new EventEmitter()
        chai.spy.on(io.ios.CLI.out, ['send'])
        chai.spy.on(console, ['error', 'log', 'warn'])
    })

    it('Controller stops motion', () => {
        motion.start()
        controller.run(emitter)
        emitter.emit("command", { name: commands.stopMotion.command_name} )
        expect(console.log).to.have.been.called(3).with("Stopping motion").with("OK")
        expect(console.error).to.have.not.been.called
    })

    it('Controller starts motion', () => {
        controller.run(emitter)
        emitter.emit("command", { name: commands.startMotion.command_name} )
        expect(console.log).to.have.been.called(1).with("Starting motion")
        expect(console.error).to.have.not.been.called
    })

    it('Controller detected motion', () => {
        detections.start(emitter)
        controller.run(emitter, io.ios.CLI)
        emitter.emit("detected_motion", 'bla')
        expect(io.ios.CLI.out.send).to.have.been.called(1)
    })
})