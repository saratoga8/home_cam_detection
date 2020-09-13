const yaml = require('js-yaml')
const fs = require('fs')
const { sep, extname } = require('path')

const config_path = 'resources/motion.yml'
const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
const dirPath = conf.paths.detections_dir
const imgExt = conf.extensions.img
const videoExt = conf.extensions.video
const eventStr = 'detected_motion'


const newImgsTrashHold = () => {
    const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
    return conf.new_imgs_threshold
}

let count = 0
const toNowMinutes = () => new Date(Date.now()).getMinutes()
let lastDetectionDate = toNowMinutes()
const minTimeBetweenDetectionsMinutes = 1

function paths(fileExtension) {
    return fs.readdirSync(dirPath).filter(file => extname(file).slice(1) == fileExtension).map(file => dirPath.concat(sep, file))
}

function start(emitter) {
    fs.watch(dirPath, {persistent: false}, (event, file) => {
        if ((event === 'change') && (file.endsWith(`.${imgExt}`))) {
            if((toNowMinutes() - lastDetectionDate) > minTimeBetweenDetectionsMinutes) {
                count = 0
                lastDetectionDate = toNowMinutes()
            }
            if (count > newImgsTrashHold()) {
                emitter.emit(eventStr, paths(imgExt))
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
    const sorted = paths(fileExtension).sort((path1, path2) => {
        return fs.statSync(path1).birthtimeMs - fs.statSync(path2).birthtimeMs
    })
    const del_elements_num = sorted.length - maxSavedFiles
    if(del_elements_num > 0)
        sorted.slice(sorted.length - del_elements_num).forEach(fs.unlinkSync)
}

exports.start = start
exports.cleanDir = cleanDir
exports.eventStr = eventStr