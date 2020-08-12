const yaml = require('js-yaml')
const fs = require('fs')
const { spawn, spawnSync } = require('child_process')

const config_path = 'resources/motion.yml'
let childProcess

function hasInstalled() {
  const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
  const proc = spawnSync(conf.paths.motion, ['-h'])
  return (!proc.error)
}

function start () {
  try {
    const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
    childProcess = spawn(conf.paths.motion, ['-b'])
  } catch (e) {
    console.error(e)
  }
}

function stop() {
  if(childProcess)
    childProcess.kill("SIGQUIT")
}

exports.start = start
exports.stop = stop
exports.hasInstalled = hasInstalled