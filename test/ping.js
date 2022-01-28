const { statSync, mkdirSync, writeFileSync } = require('fs')
const { tmpdir } = require('os')
const { join } = require('path')
const { pathExistsSync } = require("fs-extra");

const chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert
chai.use(require('chai-fs'))

const ping = require('../src/ping')

const {chkMotionState} = require("./motion_emulator");
const {sleepMs} = require("./utils");

const { waitUntil } = require('async-wait-until')



function runReachableDevice() {

}

function stopReachableDevice() {

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
 * @return {Promise<void>}
 */
const startPingWithIp = async (ip, tmpFileName) => {
    const ipsFilePath = createTmpFile(tmpFileName, ip)

    const paths = {ips: ipsFilePath, conf: 'test/resources/ping.yml'}
    await ping.start(paths)
}

describe('Stop/Start detecting using ping of known devices', () => {
    afterEach(() => ping.stop())

    context('At the start', () => {
        it('Ping service does not start when there is only one IP and it is invalid', async () => {
            const path = createTmpFile('invalid_ip.data', "192.168.sdf.34")
            expect(path, `Temp file ${path} hasn't created`).exist

            const paths = {ips: path, conf: 'resources/ping.yml'}
            await ping.start(paths)

            expect(ping.isRunning(), 'Ping service HAS started').is.false
        })

        it('Ping service does not start when IPs file is empty with delimiters', async () => {
            const emptyFilePath = createTmpFile('empty_with_delimiters.data', "\n\n\n")
            expect(emptyFilePath, `There is no an empty file`).exist
            expect(statSync(emptyFilePath).size, `The file ${emptyFilePath} is not empty`).equals(3)

            const paths = {ips: emptyFilePath, conf: 'resources/ping.yml'}
            await ping.start(paths)

            expect(ping.isRunning(), 'Ping service HAS started').is.false
        })

        it('Ping service does not start when IPs file is empty without delimiters', async () => {
            const emptyFilePath = createTmpFile('empty.data')
            expect(emptyFilePath, `There is no an empty file`).exist
            expect(statSync(emptyFilePath).size, `The file ${emptyFilePath} is not empty`).equals(0)

            const paths = { ips: emptyFilePath, conf: 'resources/ping.yml' }
            await ping.start(paths)

            expect(ping.isRunning(), 'Ping service HAS started').is.false
        })

        it('Ping service does not start when the IPs file has not found', async () => {
            const path = 'bla/bla/poo.foo'
            expect(pathExistsSync(path)).false

            const paths = { ips: path, conf: 'resources/ping.yml' }
            await ping.start(paths)

            expect(ping.isRunning(), 'Ping service HAS started').is.false
        })

        it('Start detection if a known device is un-reachable', async () => {
            await startPingWithIp('192.168.1.13', 'unreachable.data')

            await sleepMs(4000)
            expect(ping.isRunning(), 'Ping service has NOT started')
        }).timeout(5000)

        it('Stop detection if a known device is reachable', async () => {
            await startPingWithIp('127.0.0.1', 'reachable.data')

            try {
                const expectedCond = () => ping.isRunning() === false
                await waitUntil(expectedCond, { timeout: 4000 })
            }
            catch (e) {
                assert.fail('Ping service HAS started')
            }
        }).timeout(5000)
     })

    context('Switching states', () => {
        it('UnReachable -> Reachable', () => {
            const confFilePath = 'test/resources/unreachable.data'
            ping.start(confFilePath)
            expect(ping.isRunning(), 'Ping service has NOT started')
            chkMotionState('started')
            runReachableDevice()
            chkMotionState('stopped')
        })

        it('Reachable -> UnReachable', () => {
            runReachableDevice()
            const confFilePath = 'test/resources/unreachable.data'
            ping.start(confFilePath)
            expect(ping.isRunning(), 'Ping service has NOT started')
            chkMotionState('stopped')
            stopReachableDevice()
            chkMotionState('started')
        })
    })

    context('Stopping ping service', () => {
        runReachableDevice()
        const confFilePath = 'test/resources/unreachable.data'
        ping.start(confFilePath)
        expect(ping.isRunning(), 'Ping service HAS started')
        ping.stop()
        stopReachableDevice()
        chkMotionState('stopped')
    })
})