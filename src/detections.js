const yaml = require('js-yaml')
const fs = require('fs')
const { sep, extname } = require('path')

const config_path = 'resources/motion.yml'
const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
const dirPath = conf.paths.detections_dir
const newImgsTrashHold = conf.new_imgs_threshold
const imgExt = conf.extensions.img
const videoExt = conf.extensions.video
const eventStr = 'detected_motion'



let count = 0

function start(emitter) {
    fs.watch(dirPath, {persistent: false}, (event, file) => {
        if ((event === 'change') && (file.endsWith(`.${imgExt}`))) {
            if (count > newImgsTrashHold) {
                emitter.emit(eventStr)
                count = 0
            } else count++
        }
    })
}

function cleanDir() {
    delFiles(imgExt, conf.max_saved_imgs)
    delFiles(videoExt, conf.max_saved_videos)
}

function delFiles(fileExtension, maxSavedFiles) {
    const paths = fs.readdirSync(dirPath).filter(file => extname(file).slice(1) == fileExtension).map(file => dirPath.concat(sep, file))
    const sorted = paths.sort((path1, path2) => {
        return fs.statSync(path1).birthtimeMs - fs.statSync(path2).birthtimeMs
    })
    const del_elements_num = sorted.length - maxSavedFiles
    if(del_elements_num > 0)
        sorted.slice(sorted.length - del_elements_num).forEach(fs.unlinkSync)
}

exports.start = start
exports.cleanDir = cleanDir
exports.eventStr = eventStr