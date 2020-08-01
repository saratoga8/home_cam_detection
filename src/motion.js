const yaml = require('js-yaml')
const fs = require('fs')

const config_path = 'resources/motion.yml'

function start () {
  try {
    const doc = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
    console.log(doc.paths.motion)
  } catch (e) {
    console.log(e)
  }
}

exports.start = start
