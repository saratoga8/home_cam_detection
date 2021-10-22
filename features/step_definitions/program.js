"use strict"

const {spawn} = require('child_process')
const chai = require('chai')
const assert = chai.assert
const expect = chai.expect
chai.use(require('chai-fs'))

const path = require('path')
const utils = require('../support/utils')
const fs = require('fs')


const {When, Then} = require('@cucumber/cucumber');
const { sleepMs } = require('../../test/utils')

const chaiFiles = require('chai-files')
chai.use(chaiFiles);
const file = chaiFiles.file

const yaml = require('js-yaml')

const { waitUntil } = require('async-wait-until')

const { stopEmulator, emulatorOutputFilePath, emulatorPath, chkMotionState } = require('../../test/motion_emulator')

function setMotionEmulator() {
    const configPath = 'resources/detections.yml'
    const conf = yaml.load(fs.readFileSync(configPath, 'utf8'))
    conf.paths.motion = path.resolve('test/resources/motion.sh')
    fs.writeFileSync(configPath, yaml.dump(conf), 'utf8')
}

When(/^User starts program with io (CLI|TELEGRAM)$/, function (io) {
    setMotionEmulator()

    const dirPath = utils.projectPath() + path.sep + 'bin'
    const filePath = dirPath + path.sep + 'start.sh'
    expect(file(filePath)).to.exist

    const ioConfPaths= { CLI: { inSrc: 'resources/io.yml', inTest: 'test/resources/ios/cli.yml'},
        TELEGRAM: { inSrc: 'resources/io.yml', inTest: 'test/resources/ios/telegram.yml'} }
    fs.copyFileSync(ioConfPaths[io].inTest, ioConfPaths[io].inSrc)

    this.program = { outputPath: '/tmp/out.txt', outputFD: fs.openSync('/tmp/out.txt', 'w+') }
    this.childProc = spawn(
        'node',
        [ `${utils.projectPath()}/src/main.js`, `--pid_path=${dirPath}/.pid` ],
        { stdio: [null, this.program.outputFD, process.stderr] }
    ).on(
        'error',
        function( err ) { console.error(err.stack) }
    )
    this.childProc.stdin.pipe(process.stdin)
})

When('Sleep {int}s', async function (seconds) {
    await sleepMs(seconds * 1000)
});


Then(/^The motion has (started|stopped)$/, async function (state) {
    await sleepMs(500)
    chkMotionState(state)
})