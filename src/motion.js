const yaml = require('js-yaml')
const fs = require('fs')
const { exec } = require('child_process')

const config_path = 'resources/motion.yml'

function start () {
  try {
    const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
    const childProcess = exec(conf.paths.motion, (error, stdout, stderr) => {
      if (error) {
        throw error;
      }
      console.log(stdout);
    })
    childProcess.kill("SIGQUIT")
  } catch (e) {
    console.log(e)
  }
}

exports.start = start
