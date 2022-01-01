const chai = require('chai')
    , chaiHttp = require('chai-http')
chai.use(chaiHttp)
const spies = require('chai-spies')
const expect = chai.expect


const { copyFileSync } = require('fs')

chai.use(spies)
const controller = require('../src/controller')
const EventEmitter = require("events")
const commands = require('../src/commands')
const io = require('../src/ios/io')
const { storeResources, restoreResources } = require('./utils')

const setBotTokenEnvVar = (val) => {
    copyFileSync('test/resources/ios/telegram.yml', 'resources/io.yml')
    process.env.TELEGRAM_BOT_TOKEN = val
}

describe('IO', () => {
    let storedResourcesPath
    beforeEach(() => {
        storedResourcesPath = storeResources()
        chai.spy.on(io.ios.CLI.out, ['send'])
        chai.spy.on(io.ios.TELEGRAM.out, ['send'])
    })

    afterEach(() => {
        chai.spy.restore(io.ios.TELEGRAM.out)
        chai.spy.restore(io.ios.CLI.out)
        restoreResources(storedResourcesPath)
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
            expect(
                () => io.loadFrom('test/resources/bla-bla.poo'),
                "Function should throw an error").to.throw(Error)
        })

        it("There is no used IO in configure", () => {
            expect(
                () => io.loadFrom('test/resources/ios/invalid.yml'),
                "Function should throw an error").to.throw(Error)
        })
    })

    context('Telegram', () => {
        it("There is no Bot token in config file nor env. variable", () => {
            expect(() => {
                setBotTokenEnvVar('')
                const emitter = new EventEmitter()
                controller.run(emitter, io.ios.TELEGRAM)
                emitter.emit("command", {name: commands.stopMotion.command_name})
            }, 'Should throw an error').to.throw(Error,/There is no Telegram bot API token found/)
        })

        it("There is no Bot token in config file but it is in env. variable", () => {
            setBotTokenEnvVar('bla-bla')
            const emitter = new EventEmitter()
            controller.run(emitter, io.ios.TELEGRAM)
            emitter.emit("command", {name: commands.stopMotion.command_name})
            expect(io.ios.TELEGRAM.out.send).to.have.been.called(1)
        })

        it('Output work', () => {
            const emitter = new EventEmitter()
            controller.run(emitter, io.ios.TELEGRAM)
            emitter.emit("command", {name: commands.stopMotion.command_name})
            expect(io.ios.TELEGRAM.out.send).to.have.been.called(1)
        })
    })

})