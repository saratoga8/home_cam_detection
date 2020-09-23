const yaml = require('js-yaml')
const fs = require('fs')
const { spawn, spawnSync } = require('child_process')

const config_path = 'resources/motion.yml'
let childProcess = null


/**
 * Has motion installed
 * @returns {boolean} true If it has
 */
function hasInstalled() {
  const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
  const proc = spawnSync(conf.paths.motion, ['-h'])
  return (!proc.error)
}

/**
 * Start motions detection
 */
function start () {
  try {
    if (childProcess != null) {
      console.warn("Killing previous instance of motion")
      stop()
    }
    if(childProcess == null) {
      const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
      childProcess = spawn(conf.paths.motion, [])
      console.log("Starting motion")  // TODO Should be added checking of stopping
    }
  } catch (e) {
    console.error(e)
  }
}

/**
 * Stop motions detection
 */
function stop() {
  if(childProcess) {
    childProcess.kill("SIGTERM")
    childProcess = null
    console.log("Stopping motion") // TODO Should be added checking of stopping
  }
}

exports.start = start
exports.stop = stop
exports.hasInstalled = hasInstalled