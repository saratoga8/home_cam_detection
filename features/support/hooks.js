const chai = require('chai')
chai.use(require('chai-fs'))
const assert = chai.assert
const utils = require('./utils')
const {sep} = require('path')
const chaiExec = require('chai-exec')
chai.use(chaiExec);
const { execSync } = require('child_process')

const {After, Before} = require('cucumber');

const fs = require('fs')


const motionConf = { path: 'resources/motion.yml', copyPath:  '/tmp/motion.yml'}
const ioConf = { path: 'resources/io.yml', copyPath:  '/tmp/io.yml'}


Before(async function () {
    fs.copyFileSync(motionConf.path, motionConf.copyPath)
    fs.copyFileSync(ioConf.path, ioConf.copyPath)
})

After(async function () {
    fs.copyFileSync(motionConf.copyPath, motionConf.path)
    fs.copyFileSync(ioConf.copyPath, ioConf.path)
    if(this.childProc != null) {
        this.childProc.kill('SIGTERM')
    }
    if(this.program !== undefined)
        fs.closeSync(this.program.outputFD)
    // execSync(`killall node`)
    // execSync(`killall motion`)
    // const dirPath = utils.projectPath() + sep + 'bin'
    // const filePath = dirPath + sep + 'stop.sh'
    // const pidPath = dirPath + sep + '.pid'
    // assert.pathExists(pidPath, "File with PID hasn't found")
    // const cli = chaiExec(filePath, [], {cwd: dirPath})
    // assert.exitCode(cli, 0);
    // assert.stderr(cli, "");
    // assert.notPathExists(pidPath, "File with PID hasn't deleted")
})