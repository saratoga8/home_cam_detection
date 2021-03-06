const chai = require('chai')
const spies = require('chai-spies')
const expect = chai.expect
const assert = chai.assert

chai.use(spies)
const controller = require('../src/controller')
const EventEmitter = require("events")
const commands = require('../src/commands')
const io = require('../src/ios/io')


describe('IO', () => {
    beforeEach(function () {
        chai.spy.on(io.ios.CLI.out, ['send'])
        chai.spy.on(io.ios.TELEGRAM.out, ['send'])
        chai.spy.on(console, ['error'])
    })

    afterEach(function () {
        chai.spy.restore(io.ios.TELEGRAM.out)
        chai.spy.restore(io.ios.CLI.out)
        chai.spy.restore(console)
    })

    context('CLI', () => {
        it('Output', () => {
            const emitter = new EventEmitter()
            controller.run(emitter, io.ios.CLI)
            emitter.emit("command", {name: commands.stopMotion.command_name})
            expect(io.ios.CLI.out.send).to.have.been.called(1)
        })
    })

    context('Configuration', () => {
        it('Load YAML', () => {
            const loadedIO = io.loadFrom('test/resources/ios/cli.yml')
            const emitter = new EventEmitter()
            controller.run(emitter, loadedIO)
            emitter.emit("command", {name: commands.stopMotion.command_name})
            expect(io.ios.CLI.out.send).to.have.been.called(1)
        })

        it("File doesn't exist", () => {
            assert.isNull(io.loadFrom('test/resources/bla-bla.poo'), "Function should return NULL")
            expect(console.error).to.have.been.called(1)
        })

        it("There is no used IO in configure", () => {
            assert.isNull(io.loadFrom('test/resources/ios/invalid.yml'), "Function should return NULL")
            expect(console.error).to.have.been.called(1)
        })
    })

    context('Telegram', () => {
        it('Output', () => {
            const emitter = new EventEmitter()
            controller.run(emitter, io.ios.TELEGRAM)
            emitter.emit("command", {name: commands.stopMotion.command_name})
            expect(io.ios.TELEGRAM.out.send).to.have.been.called(1)
        })
    })
})