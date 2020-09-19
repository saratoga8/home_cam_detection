const motion = require('../src/motion')
const chai = require('chai')
const assert = chai.assert
const controller = require('../src/controller')
const commands = require('../src/commands')
const testUtils = require('./utils')
const { isRunning, killMotion, isStopped } = require('./motion')

const EventEmitter = require("events")
const emitter = new EventEmitter()

const {add_files, detectionsDirPath, newImgsTrashHold} = require('./utils')
const detections = require('../src/detections')

const spies = require('chai-spies')
const expect = chai.expect


chai.use(spies)
const io = require('../src/ios/io')

const {sleep} = require('sleep')


describe('Controller', () => {
    after(() => { motion.stop() })
    afterEach( function() { chai.spy.restore(io.ios.CLI.out) })
    beforeEach('Kill motion', function() {
        chai.spy.on(io.ios.CLI.out, ['send'])
        motion.stop()
    })

    it('Controller stops motion', () => {
        motion.start()
        assert.isTrue(isRunning(), "Running Motion isn't running")
        controller.run(emitter)
        emitter.emit("command", { name: commands.stopMotion.command_name} )
        assert.isFulfilled(testUtils.waitUntil(2, 100, isStopped), "Running Motion hasn't stopped")
    })

    it('Controller starts motion', () => {
        assert.isFulfilled(testUtils.waitUntil(2, 100, isStopped), "Running Motion hasn't stopped")
        controller.run(emitter)
        emitter.emit("command", { name: commands.startMotion.command_name} )
        assert.isFulfilled(testUtils.waitUntil(2, 100, isRunning), "Running Motion hasn't started")
    })

    it('Controller detected motion', () => {
        detections.start(emitter)
        controller.run(emitter, io.ios.CLI)
        const imgsNum = newImgsTrashHold() + 2
        add_files(detectionsDirPath, imgsNum)
        expect(io.ios.CLI.out.send).to.have.been.called(1)
    })
})