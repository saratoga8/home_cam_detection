const chai = require('chai')
const spies = require('chai-spies')
const expect = chai.expect


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
            expect(io.ios.CLI.out.send).to.have.been.called.with("OK")
        })
    })

    it('Load YAML', () => {
        const loadedIO = io.loadFrom('test/resources/io.yml')
        const emitter = new EventEmitter()
        controller.run(emitter, loadedIO)
        emitter.emit("command", {name: commands.stopMotion.command_name})
        expect(io.ios.CLI.out.send).to.have.been.called.with("OK")
    })

    it('test', () => {
        let bla = null
        bla ??= 'cock'
        console.log(bla)
    })
})