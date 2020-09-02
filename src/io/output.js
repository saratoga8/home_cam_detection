const cli = require('./cli')
const yaml = require('js-yaml')
const fs = require('fs')

const config_path = 'resources/io.yml'
const outputTypes = { CLI: cli.output }

function getOutput() {
    const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
    conf
}