const chai = require('chai')
    , chaiHttp = require('chai-http')
chai.use(chaiHttp)
const spies = require('chai-spies')
const expect = chai.expect
const assert = chai.assert

const { copyFileSync } = require('fs')

chai.use(spies)
const controller = require('../src/controller')
const EventEmitter = require("events")
const commands = require('../src/commands')
const io = require('../src/ios/io')
const { storeResources, restoreResources } = require('./utils')


describe('IO', () => {
    let storedResourcesPath
    beforeEach(function () {
        storedResourcesPath = storeResources()
        chai.spy.on(io.ios.CLI.out, ['send'])
        chai.spy.on(io.ios.TELEGRAM.out, ['send'])
        chai.spy.on(console, ['error'])
    })

    afterEach(function () {
        chai.spy.restore(io.ios.TELEGRAM.out)
        chai.spy.restore(io.ios.CLI.out)
        chai.spy.restore(console)
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
            assert.isNull(io.loadFrom('test/resources/bla-bla.poo'), "Function should return NULL")
            expect(console.error).to.have.been.called(1)
        })

        it("There is no used IO in configure", () => {
            assert.isNull(io.loadFrom('test/resources/ios/invalid.yml'), "Function should return NULL")
            expect(console.error).to.have.been.called(1)
        })
    })

    context('Telegram', () => {
        it("There is no Bot token in config file or env. variable", () => {
            copyFileSync('test/resources/ios/telegram.yml', 'resources/io.yml')
            if (process.env.TELEGRAM_BOT_TOKEN)
                process.env.TELEGRAM_BOT_TOKEN = ''
            const emitter = new EventEmitter()
            controller.run(emitter, io.ios.TELEGRAM)
            emitter.emit("command", {name: commands.stopMotion.command_name})

            expect(console.error).to.have.been.called(2)
            expect(console.error).to.have.been.called.with("There is no Telegram bot API token found")
        })

        it("There is no Bot token in config file but it is in env. variable", () => {
            copyFileSync('test/resources/ios/telegram.yml', 'resources/io.yml')
            if (process.env.TELEGRAM_BOT_TOKEN)
                process.env.TELEGRAM_BOT_TOKEN = 'bla-bla'
            const emitter = new EventEmitter()
            controller.run(emitter, io.ios.TELEGRAM)
            emitter.emit("command", {name: commands.stopMotion.command_name})

            expect(console.error).not.have.been.called
        })

        it('Output work', () => {
            const emitter = new EventEmitter()
            controller.run(emitter, io.ios.TELEGRAM)
            emitter.emit("command", {name: commands.stopMotion.command_name})
            expect(io.ios.TELEGRAM.out.send).to.have.been.called(1)
        })
    })
})