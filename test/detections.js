const detections = require('../src/detections')
const {execSync} = require('child_process')
const fs = require('fs')
const yaml = require('js-yaml')

const config_path = 'resources/motion.yml'
const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))

describe('Detections use', () => {
    it('start detecting', async () => {
        detections.start()
        const path = `${conf.paths.detections_dir}/test.jpg`
        execSync(`touch ${path}`)
        execSync(`rm ${conf.paths.detections_dir}/*.jpg`)
        detections.stop()
        execSync(`touch ${path}`)
        execSync(`rm ${conf.paths.detections_dir}/*.jpg`)
    })

    it('clean old images', () => {
        execSync("for i in `seq 10`; do sleep 0.1 && touch \"" + conf.paths.detections_dir + "/file$i.jpg\"; done")
        detections.cleanDir()
        execSync(`rm ${conf.paths.detections_dir}/*.jpg`)
      })
})