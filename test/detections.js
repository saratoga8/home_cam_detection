const detections = require('../src/detections')
const {execSync, exec} = require('child_process')
const fs = require('fs')
const yaml = require('js-yaml')
const assert = require('chai').assert

const config_path = 'resources/motion.yml'
const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
const maxSavedImgs = conf.max_saved_imgs


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
        const newFiles = maxSavedImgs + 5
        execSync("for i in `seq " + newFiles + "`; do touch \"" + conf.paths.detections_dir + "/file$i.jpg\"; done")
        detections.cleanDir()
        exec(`ls ${conf.paths.detections_dir}/*.jpg | wc -l`, (err, stdout) => {
            execSync(`rm ${conf.paths.detections_dir}/*.jpg`)
            if(stdout) assert.equal(stdout, maxSavedImgs, "Invalid number of saved detection images")
            if(err) assert.fail(`Test aborted: ${err.message}`)
        })
      })
})