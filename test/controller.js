const motion = require('../src/motion')
const assert = require('chai').assert
const controller = require('../src/controller')
const EventEmitter = require("events")
const testUtils = require('./utils')
const { isRunning, killMotion } = require('./motion')

describe('Controller', () => {
    after(() => { killMotion() })
    beforeEach('Kill motion', () => { killMotion() })

    it('Controller stops motion', () => {
        motion.start()
        assert.notEqual(isRunning(), undefined, "Running Motion hasn't found")
        const emitter = new EventEmitter()
        controller.run(emitter)
        emitter.emit("command", { name: controller.stopMotionCmdName} )
        testUtils.waitUntil(1, 100, isRunning()).then ( success => assert.isTrue(success, "Running Motion hasn't stopped") )
    })
})