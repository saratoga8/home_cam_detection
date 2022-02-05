const { rmSync, readFileSync, statSync, mkdirSync, writeFileSync } = require('fs')
const { tmpdir } = require('os')
const { join } = require('path')
const { pathExistsSync } = require("fs-extra");
const EventEmitter = require("events")
const controller = require('../src/controller')

const spies = require('chai-spies')
const chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert
chai.should()
chai.use(require("chai-events"));
chai.use(require('chai-fs'))
chai.use(spies)

const ping = require('../src/ping')

const { execSync } = require('child_process')

const { setMotionPath, sleepMs} = require('./utils')
const { stopEmulator, emulatorOutputFilePath, emulatorPath, chkMotionState } = require("./motion_emulator");
const yaml = require('js-yaml')
const config_path = 'resources/detections.yml'
const conf = yaml.load(readFileSync(config_path, 'utf8'))
const motionPath = conf.paths.motion



function runReachableDevice(ip) {
    try {
        execSync(`test/resources/dummy_ip.sh create ${ip}`)
    }
    catch (error) {
        assert.fail(`Cant create a dummy interface for ${ip}: ${error.stderr}`)
    }
}

function stopReachableDevice() {
    try {
        execSync('test/resources/dummy_ip.sh delete')
    }
    catch (error) {
        assert.fail(`Cant delete a dummy interface: ${error.stderr}`)
    }
}

/**
 * Create temporary file with text or empty
 * @param name {string} - File name
 * @param txt {string|''} - Text
 * @return {string} - File's path
 */
function createTmpFile(name, txt = '') {
    const dirPath = join(tmpdir(), "ping")
    if (!pathExistsSync(dirPath)) {
        mkdirSync(dirPath)
    }
    const filePath = join(dirPath, name)
    writeFileSync(filePath, txt, "utf8")
    return filePath
}

/**
 * Start ping monitoring an IP
 * @param ip {string} IP
 * @param tmpFileName {string} the name of a file being created in temp directory
 * @param emitter {EventEmitter} Event emitter instance
 * @return {Promise<void>}
 */
const startPingWithIp = async (ip, tmpFileName, emitter) => {
    const ipsFilePath = createTmpFile(tmpFileName, ip)

    const paths = { ips: ipsFilePath, conf: 'test/resources/ping.yml' }
    await ping.start(paths, emitter)
}

describe('Stop/Start detecting using ping of known devices', () => {
    let emitter = null
    const ip = '192.168.1.13'

    beforeEach(() => emitter = new EventEmitter())

    afterEach(() => {
        ping.stop()
        emitter.removeAllListeners()
    })

    context('At the start', () => {
        it('Ping service does not start when there is only one IP and it is invalid', async () => {
            const path = createTmpFile('invalid_ip.data', "192.168.sdf.34")
            expect(path, `Temp file ${path} hasn't created`).exist

            const paths = {ips: path, conf: 'resources/ping.yml'}
            await ping.start(paths, emitter)

            expect(ping.isRunning(), 'Ping service HAS started').is.false
        })

        it('Ping service starts when there is invalid IP among valid ones', async () => {
            const path = createTmpFile('invalid_ip.data', "\n192.168.1.5\n192.168.sdf.34\n192.168.1.4")
            expect(path, `Temp file ${path} hasn't created`).exist

            const paths = {ips: path, conf: 'resources/ping.yml'}
            await ping.start(paths, emitter)

            expect(ping.isRunning(), 'Ping service HAS NOT started')
        })

        it('Ping service does not start when IPs file is empty with delimiters', async () => {
            const emptyFilePath = createTmpFile('empty_with_delimiters.data', "\n\n\n")
            expect(emptyFilePath, `There is no an empty file`).exist
            expect(statSync(emptyFilePath).size, `The file ${emptyFilePath} is not empty`).equals(3)

            const paths = { ips: emptyFilePath, conf: 'resources/ping.yml' }
            await ping.start(paths, emitter)

            expect(ping.isRunning(), 'Ping service HAS started').is.false
        })

        it('Ping service does not start when IPs file is empty without delimiters', async () => {
            const emptyFilePath = createTmpFile('empty.data')
            expect(emptyFilePath, `There is no an empty file`).exist
            expect(statSync(emptyFilePath).size, `The file ${emptyFilePath} is not empty`).equals(0)

            const paths = { ips: emptyFilePath, conf: 'resources/ping.yml' }
            await ping.start(paths, emitter)

            expect(ping.isRunning(), 'Ping service HAS started').is.false
        })

        it('Ping service does not start when the IPs file has not found', async () => {
            const path = 'bla/bla/poo.foo'
            expect(pathExistsSync(path)).false

            const paths = { ips: path, conf: 'resources/ping.yml' }
            await ping.start(paths, emitter)

            expect(ping.isRunning(), 'Ping service HAS started').is.false
        })

        it('Ping an unreachable host', function () {
            const p = emitter.should.emit(ping.eventHostStateStr, { timeout: 6000 })
            startPingWithIp(ip, 'unreachable.data', emitter)
            return p
        }).timeout(8000)

        it('Stop detection if a known device is reachable', async () => {
            const p = emitter.should.emit(ping.eventHostStateStr, { timeout: 4000 })
            startPingWithIp('127.0.0.1', 'reachable.data', emitter)
            return p
        }).timeout(5000)
     })

    context('Switching states', () => {
        after(() => {
            setMotionPath(motionPath)
            stopEmulator()
        })
        beforeEach(function ()  {
            rmSync(emulatorOutputFilePath, { force: true })
            setMotionPath(emulatorPath)
            stopEmulator()
        })

        afterEach(() => {
            controller.stop(emitter)
        })

        it('UnReachable -> Reachable', async () => {
            try {
                stopReachableDevice()
                controller.run(emitter)
                startPingWithIp(ip, 'unreachable.data', emitter)
                expect(ping.isRunning(), 'Ping service has NOT started')
                await sleepMs(5000)
                chkMotionState('started')
                runReachableDevice(ip)
                await sleepMs(3000)
                chkMotionState('stopped')
            } catch (e) {
                assert.fail(`Test stopped: ${e}`)
            }
        }).timeout(10000)

        it('Reachable -> UnReachable', async () => {
            try {
                stopReachableDevice()
                runReachableDevice(ip)
                controller.run(emitter)
                startPingWithIp(ip, 'reachable.data', emitter)
                expect(ping.isRunning(), 'Ping service has NOT started')
                await sleepMs(1000)
                chkMotionState('stopped')
                stopReachableDevice()
                await sleepMs(5000)
                chkMotionState('started')
            } catch (e) {
                assert.fail(`Test stopped: ${e}`)
            }
        }).timeout(10000)

        it ('Stopping ping service', async () => {
            runReachableDevice(ip)
            controller.run(emitter)
            startPingWithIp(ip, 'reachable.data', emitter)
            expect(ping.isRunning(), 'Ping service has NOT started')
            await sleepMs(1000)
            chkMotionState('stopped')
            ping.stop()
            stopReachableDevice()
            await sleepMs(5000)
            chkMotionState('stopped')
        }).timeout(8000)
    })
})