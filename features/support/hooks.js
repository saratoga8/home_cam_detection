const chai = require('chai')
const assert = chai.assert
chai.use(require('chai-fs'))
const chaiExec = require('chai-exec')
chai.use(chaiExec);

const {After, Before} = require('@cucumber/cucumber');

const fs = require('fs')


const detectionsConf = { path: 'resources/detections.yml', copyPath:  '/tmp/detections.yml'}
const ioConf = { path: 'resources/io.yml', copyPath:  '/tmp/io.yml'}

const { stopEmulator, emulatorOutputFilePath, emulatorPath, chkMotionState } = require('../../test/motion_emulator')

Before(async function () {
    try {
        fs.copyFileSync(detectionsConf.path, detectionsConf.copyPath)
        fs.copyFileSync(ioConf.path, ioConf.copyPath)
    }
    catch (e) {
        assert.fail(`Stopped because of error: ${e.stack}`)
    }
})

After(async function () {
    try {
        fs.copyFileSync(detectionsConf.copyPath, detectionsConf.path)
        fs.copyFileSync(ioConf.copyPath, ioConf.path)
        if (this.childProc ) {
            this.childProc.kill('SIGTERM')
        }
        if (this.program)
            fs.closeSync(this.program.outputFD)
        stopEmulator()
    }
    catch (e) {
        assert.fail(`Stopped because of error: ${e.stack}`)
    }
})