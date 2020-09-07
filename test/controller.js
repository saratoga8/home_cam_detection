const motion = require('../src/motion')
const assert = require('chai').assert
const controller = require('../src/controller')
const commands = require('../src/commands')
const EventEmitter = require("events")
const testUtils = require('./utils')
const { isRunning, killMotion, isStopped } = require('./motion')

describe('Controller', () => {
    after(() => { killMotion() })
    beforeEach('Kill motion', () => { killMotion() })

    it('Controller stops motion', () => {
        motion.start()
        assert.isTrue(isRunning(), "Running Motion isn't running")
        const emitter = new EventEmitter()
        controller.run(emitter)
        emitter.emit("command", { name: commands.stopMotion.command_name} )
        assert.isFulfilled(testUtils.waitUntil(2, 100, isStopped), "Running Motion hasn't stopped")
    })

    it('Controller start motion', () => {
        assert.isFulfilled(testUtils.waitUntil(2, 100, isStopped), "Running Motion hasn't stopped")
        const emitter = new EventEmitter()
        controller.run(emitter)
        emitter.emit("command", { name: commands.startMotion.command_name} )
        assert.isFulfilled(testUtils.waitUntil(2, 100, isRunning), "Running Motion hasn't started")
    })
})