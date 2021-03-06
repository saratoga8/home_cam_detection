const chai = require('chai')
chai.use(require('chai-fs'))
const chaiExec = require('chai-exec')
chai.use(chaiExec);

const {After, Before} = require('cucumber');

const fs = require('fs')


const detectionsConf = { path: 'resources/detections.yml', copyPath:  '/tmp/detections.yml'}
const ioConf = { path: 'resources/io.yml', copyPath:  '/tmp/io.yml'}


Before(async function () {
    fs.copyFileSync(detectionsConf.path, detectionsConf.copyPath)
    fs.copyFileSync(ioConf.path, ioConf.copyPath)
})

After(async function () {
    fs.copyFileSync(detectionsConf.copyPath, detectionsConf.path)
    fs.copyFileSync(ioConf.copyPath, ioConf.path)
    if(this.childProc != null) {
        this.childProc.kill('SIGTERM')
    }
    if(this.program !== undefined)
        fs.closeSync(this.program.outputFD)
})