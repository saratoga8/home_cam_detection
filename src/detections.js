/** @module detections */

const yaml = require('js-yaml')
const fs = require('fs')
const { sep, extname, resolve } = require('path')

const chokidar = require('chokidar')

const config_path = 'resources/detections.yml'
const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
const dirPath = resolve(__dirname, "../motion/detections")
const imgExt = conf.extensions.img
const videoExt = conf.extensions.video
const minTimeBetweenDetectionsSeconds = conf.seconds_between_detections

const sentData = require('./ios/sent_data')

let count = 0

/**
 * String of detection event
 * @type {string}
 */
const eventStr = 'detected_motion'

/**
 * Seconds to current moment
 * @returns {number} Seconds
 */
const toNowSeconds = () => new Date(Date.now()).getSeconds()
let lastDetectionDate = toNowSeconds()

/**
 * Get threshold of new images of detections from configuration file
 * @returns {undefined|int} Threshold number or undefined
 */
const newImgsThreshold = () => {
    const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
    return (conf === undefined) ? undefined : conf.new_imgs_threshold
}


/**
 * Get absolute paths of files with given extensions in detections dir
 * @param fileExtension File extension
 * @returns {string[]} Paths
 */
function paths(fileExtension) {
    return fs.readdirSync(dirPath)
        .filter(file => extname(file).slice(1) === fileExtension)
        .map(file => dirPath.concat(sep, file))
}

function emitEventWithLastImgsPaths(emitter) {
    const data = Object.create(sentData.types.IMAGES)
    data.paths = sortPaths(paths(imgExt)).slice(0, count)
    emitter.emit(eventStr, data)
}

function processImg(emitter, filePath) {
    if (filePath.endsWith(`.${imgExt}`)) {
        if ((toNowSeconds() - lastDetectionDate) > minTimeBetweenDetectionsSeconds) {
            count = 0
            lastDetectionDate = toNowSeconds()
            return
        }
        const threshold = newImgsThreshold()
        if ((threshold !== undefined) && (count >= threshold)) {
            if(count === threshold) {
                emitEventWithLastImgsPaths(emitter)
                count++
            }
            else {
                count = 0
                cleanDir()
            }
        } else count++
    }
}

function processVideo(emitter, filePath) {
    if (filePath.endsWith('video.finished')) {
        const path = sortPaths(paths(videoExt))[0]
        const data = Object.create(sentData.types.VIDEO)
        data.path = path
        emitter.emit(eventStr, data)
        cleanDir()
    }
}

/**
 * Starts detecting: watching for directory of motion's detections for new files.
 * The func counts the new files and after a threshold emits event.
 * Counting depends on period between current and the last detection if the period is too long, then counting is zeroed.
 * @param {EventEmitter} emitter Emitter instance for emitting events
 */
function start(emitter) {
    if(!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {recursive: true})
    }

    const imgsListener = (path) => processImg(emitter, path)
    chokidar.watch(dirPath).on('add', imgsListener)
    const videoListener = (path) => processVideo(emitter, path)
    chokidar.watch('/tmp').on('add', videoListener)
}



/**
 * Cleaning detections directory
 */
function cleanDir() {
    delFiles(imgExt, conf.max_saved_imgs)
    delFiles(videoExt, conf.max_saved_videos)
}

function sortPaths(paths) {
    const cmp = (path1, path2) => fs.statSync(path2).birthtimeMs - fs.statSync(path1).birthtimeMs
    return paths.sort(cmp)
}

/**
 * Deleting files with given extensions
 * @param fileExtension File extension
 * @param maxSavedFiles Number of latest files should be saved
 */
function delFiles(fileExtension, maxSavedFiles) {
    const sorted = sortPaths(paths(fileExtension))
    const delElementsNum = sorted.length - maxSavedFiles
    if(delElementsNum > 0)
        sorted.slice(sorted.length - delElementsNum).forEach(fs.unlinkSync)
}

/** Start detections */
exports.start = start
/** Cleaning directory of detections */
exports.cleanDir = cleanDir
/** String of detections event */
exports.eventStr = eventStr
/** Path to the directory containing detections (videos/images) */
exports.dirPath = dirPath