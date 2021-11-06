const yaml = require('js-yaml')
const fs = require('fs')
const { spawn, spawnSync } = require('child_process')

const motionConfPath = 'resources/motion.conf'
const config_path = 'resources/detections.yml'
let childProcess = null

const { error, debug, warn } = require('../src/logger/logger')

/**
 * Has motion installed
 * @returns {boolean} true If it has
 */
function hasInstalled() {
  const conf = yaml.load(fs.readFileSync(config_path, 'utf8'))
  const proc = spawnSync(conf.paths.motion, ['-h'])
  return (!proc.error)
}

/**
 * Start motions detection
 */
function start () {
  try {
    if (childProcess != null) {
      warn("Killing previous instance of motion")
      stop()
    }
    if(childProcess == null) {
      const conf = yaml.load(fs.readFileSync(config_path, 'utf8'))
      childProcess = spawn(conf.paths.motion, ['-c', motionConfPath])
      debug("Starting motion")  // TODO Should be added checking of stopping
    }
  } catch (e) {
    error(e)
  }
}

/**
 * Stop motions detection
 */
function stop() {
  if(childProcess) {
    childProcess.kill("SIGTERM")
    childProcess = null
    debug("Stopping motion") // TODO Should be added checking of stopping
  }
}

exports.start = start
exports.stop = stop
exports.hasInstalled = hasInstalled