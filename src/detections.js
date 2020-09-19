/** @module detections */

const yaml = require('js-yaml')
const fs = require('fs')
const { sep, extname } = require('path')

const config_path = 'resources/motion.yml'
const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
const dirPath = conf.paths.detections_dir
const imgExt = conf.extensions.img
const videoExt = conf.extensions.video
const minTimeBetweenDetectionsSeconds = conf.seconds_between_detections

const sentData = require('./sent_data')

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
    return fs.readdirSync(dirPath).filter(file => extname(file).slice(1) === fileExtension)
        .map(file => dirPath.concat(sep, file))
}

/**
 * Starts detecting: watching for directory of motion's detections for new files.
 * The func counts the new files and after a threshold emits event.
 * Counting depends on period between current and the last detection if the period is too long, then counting is zeroed.
 * @param {EventEmitter} emitter Emitter instance for emitting events
 * @fires Detection event
 */
function start(emitter) {
    fs.watch(dirPath, {persistent: false}, (event, file) => {
        if (file.endsWith(`.${imgExt}`)) {
            if((toNowSeconds() - lastDetectionDate) > minTimeBetweenDetectionsSeconds) {
                count = 0
                lastDetectionDate = toNowSeconds()
            }
            const threshold = newImgsThreshold()
            if ((threshold !== undefined) && (count > threshold)) {
                const data = Object.create(sentData.types.IMAGES)
                data.paths = sortPaths(paths(imgExt))
                emitter.emit(eventStr, data)
                count = 0
                cleanDir()
            } else count++
        }
    })
}

/**
 * Cleaning detections directory
 */
function cleanDir() {
    delFiles(imgExt, conf.max_saved_imgs)
    delFiles(videoExt, conf.max_saved_videos)
}

function sortPaths(paths) {
    const cmp = (path1, path2) => fs.statSync(path1).birthtimeMs - fs.statSync(path2).birthtimeMs
    return paths.sort(cmp)
}

/**
 * Deleting files with given extensions
 * @param fileExtension File extension
 * @param maxSavedFiles Number of latest files should be saved
 */
function delFiles(fileExtension, maxSavedFiles) {
    const sorted = sortPaths(paths(fileExtension))
    const del_elements_num = sorted.length - maxSavedFiles
    if(del_elements_num > 0)
        sorted.slice(sorted.length - del_elements_num).forEach(fs.unlinkSync)
}

/** Start detections */
exports.start = start
/** Cleaning directory of detections */
exports.cleanDir = cleanDir
/** String of detections event */
exports.eventStr = eventStr