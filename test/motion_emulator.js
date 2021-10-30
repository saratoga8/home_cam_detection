const { EOL } = require('os')

const { execSync, execFileSync  } = require('child_process')

const chai = require('chai')
const assert = chai.assert

const emulatorPath = 'test/resources/motion.sh'

const stopEmulatorPath = 'test/resources/stop_motion.sh'
exports.emulatorOutputFilePath = '/tmp/motion.emulator'

exports.stopEmulator = () => {
    try {
        execFileSync(stopEmulatorPath)
    }
    catch (e) {
        if (e.status !== 2) {
            assert.fail(`Can't stop Motion emulator: ${e.stderr.toString()}`)
        }
    }
}

exports.chkMotionState = (state) => {
    let processesPaths = execSync("ps -fu $USER")
        .toString()
        .split(EOL)
    let found = processesPaths.find(path => path.includes(emulatorPath))
    const expectedCond = state === "started" ? found !== undefined : found === undefined
    assert(expectedCond, `Motion emulator hasn't ${state}`)
}

exports.emulatorPath = emulatorPath