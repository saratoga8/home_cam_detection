const chai = require('chai')
const assert = chai.assert
chai.use(require('chai-fs'))
const chaiExec = require('chai-exec')
chai.use(chaiExec);

const {After, Before} = require('@cucumber/cucumber');

const fs = require('fs')


const backUpPaths = [
    { from: 'resources/detections.yml', to:  '/tmp/detections.yml' },
    { from: 'resources/io.yml', to:  '/tmp/io.yml' },
    { from: 'resources/ips.data', to:  '/tmp/ips.data' }
]

const { stopEmulator } = require('../../test/motion_emulator')

Before(async function () {
    try {
        backUpPaths.forEach(cur => fs.copyFileSync(cur.from, cur.to))
    }
    catch (e) {
        assert.fail(`Stopped because of error: ${e.stack}`)
    }
})

After(async function () {
    try {
        backUpPaths.forEach(cur => fs.copyFileSync(cur.to, cur.from))
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