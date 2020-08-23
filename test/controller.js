const motion = require('../src/motion')
const assert = require('chai').assert
const controller = require('../src/controller')
const EventEmitter = require("events")
const {execSync, exec} = require('child_process')

const isRunning = () => {
    return execSync('ps -e').toString().split('\n').find(str => str.includes("motion"))
}

const killMotion = async () => {
    await exec('killall motion', (err) => {
        if (err) return
    })
}


describe('Controller', async () => {
   after(killMotion)
   beforeEach(killMotion)

    it('Controller stops motion', async () => {
        motion.start()
        assert.notEqual(isRunning(), undefined, "Running Motion hasn't found")
        const emitter = new EventEmitter()
        controller.run(emitter)
        emitter.emit("command", { name: controller.stopMotionCmdName} )
        setTimeout(assert.equal(isRunning(), undefined, "Running Motion hasn't stopped"), 3000)
    })
})