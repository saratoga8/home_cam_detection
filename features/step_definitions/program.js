"use strict"

const {spawn} = require('child_process')
const chai = require('chai')
const assert = chai.assert
const expect = chai.expect
chai.use(require('chai-fs'))

const path = require('path')
const utils = require('../support/utils')
const fs = require('fs')
const {waitUntil} = require('../../test/utils')

const {When} = require('cucumber');
const {sleep} = require('sleep')

const chaiFiles = require('chai-files')
chai.use(chaiFiles);
const file = chaiFiles.file

When(/^User starts program with io (CLI|TELEGRAM)$/, function (io) {
    const dirPath = utils.projectPath() + path.sep + 'bin'
    const filePath = dirPath + path.sep + 'start.sh'
    expect(file(filePath)).to.exist

    const ioConfPaths= { CLI: { inSrc: 'resources/io.yml', inTest: 'test/resources/ios/cli.yml'}}
    fs.copyFileSync(ioConfPaths[io].inTest, ioConfPaths[io].inSrc)

    this.program = { outputPath: '/tmp/out.txt', outputFD: fs.openSync('/tmp/out.txt', 'w+') }
    this.childProc = spawn('node', [`${utils.projectPath()}/src/main.js`, `--pid_path=${dirPath}/.pid`], {stdio: [null, this.program.outputFD, process.stderr]})
    this.childProc.stdin.pipe(process.stdin)
    sleep(1)
    expect(file(this.program.outputPath)).to.contain("Starting motion")
})

