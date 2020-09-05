const spies = require('chai-spies')
const chai = require('chai')
const assert = chai.assert
const expect = chai.expect

var child = require('child_process');



chai.use(spies)
const controller = require('../src/controller')
const EventEmitter = require("events")
const commands = require('../src/commands')
const io = require('../src/ios/io')

chai.spy.on(io.ios.CLI.out, ['send'])


describe('IO', () => {
    context('CLI', () => {
        it('Output', () => {
            const emitter = new EventEmitter()
            controller.run(emitter, io.ios.CLI)
            emitter.emit("command", {name: commands.stopMotion.command_name})
            expect(io.ios.CLI.out.send).to.have.been.called(1)
            expect(io.ios.CLI.out.send).to.have.been.called.with("OK")
        })
    })
})