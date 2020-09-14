const yaml = require('js-yaml')
const fs = require('fs')
const { sep, extname } = require('path')

const config_path = 'resources/motion.yml'
const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
const dirPath = conf.paths.detections_dir
const imgExt = conf.extensions.img
const videoExt = conf.extensions.video
const minTimeBetweenDetectionsSeconds = conf.seconds_between_detections
const eventStr = 'detected_motion'


const newImgsThreshold = () => {
    const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
    return (conf === undefined) ? undefined : conf.new_imgs_threshold
}

let count = 0
const toNowSeconds = () => new Date(Date.now()).getSeconds()
let lastDetectionDate = toNowSeconds()

function paths(fileExtension) {
    return fs.readdirSync(dirPath).filter(file => extname(file).slice(1) == fileExtension).map(file => dirPath.concat(sep, file))
}

function start(emitter) {
    fs.watch(dirPath, {persistent: false}, (event, file) => {
        if (file.endsWith(`.${imgExt}`)) {
            if((toNowSeconds() - lastDetectionDate) > minTimeBetweenDetectionsSeconds) {
                count = 0
                lastDetectionDate = toNowSeconds()
            }
            const threshold = newImgsThreshold()
            if ((threshold !== undefined) && (count > threshold)) {
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