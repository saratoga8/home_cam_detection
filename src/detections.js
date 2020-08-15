const yaml = require('js-yaml')
const fs = require('fs')
const { sep } = require('path')


const config_path = 'resources/motion.yml'
const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
const dirPath = conf.paths.detections_dir
const imgExt = conf.extensions.img
const maxSavedImgs = conf.max_saved_imgs
const newImgsTrashHold = conf.new_imgs_threshold


let count = 0

function start() {
    fs.watch(dirPath, {persistent: false}, (event, files) => {
        if ((event === 'change') && (file.endsWith(`.${imgExt}`))) {
            if (count > newImgsTrashHold) {
                count = 0
            }
                count++
        }
    })
}

function cleanDir() {
    const paths = fs.readdirSync(dirPath).map(file => dirPath.concat(sep, file))
    const sorted = paths.sort((path1, path2) => {
        return fs.statSync(path1).birthtimeMs - fs.statSync(path2).birthtimeMs
    })
    const del_elements_num = sorted.length - maxSavedImgs
    if(del_elements_num > 0)
        sorted.slice(sorted.length - del_elements_num).forEach(path => fs.unlinkSync(path))
}

exports.start = start
exports.cleanDir = cleanDir