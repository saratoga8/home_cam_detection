/** @module detections */

const yaml = require('js-yaml')
const fs = require('fs')
const { sep, extname, resolve } = require('path')

const { debug } = require('./logger/logger')

const chokidar = require('chokidar')

const config_path = 'resources/detections.yml'
const conf = yaml.load(fs.readFileSync(config_path, 'utf8'))
const detectionsDirPath = resolve(__dirname, "../motion/detections")
const imgExt = conf.extensions.img
const videoExt = conf.extensions.video
const minTimeBetweenDetectionsSeconds = conf.seconds_between_detections

const finishedVideoNotificationsDirPath = '.tmp'

const sentData = require('./ios/sent_data')

let count = 0

let imgFilesWatcher, tmpDirWather

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
const getNewImgsThreshold = () => {
    const conf = yaml.load(fs.readFileSync(config_path, 'utf8'))
    return (conf === undefined) ? undefined : conf.new_imgs_threshold
}


/**
 * Get absolute paths of files with given extensions in detections dir
 * @param fileExtension File extension
 * @returns {string[]} Paths
 */
function getFilePathsInDetectionsDir(fileExtension) {
    return fs.readdirSync(detectionsDirPath)
        .filter(file => extname(file).slice(1) === fileExtension)
        .map(file => detectionsDirPath.concat(sep, file))
}

/**
 * Emit event with the paths of last images of detections
 * @param {EventEmitter} emitter Event emitter instance
 */
function emitEventWithLastImgsPaths(emitter) {
    debug('Emit event of detection')
    const data = Object.create(sentData.types.IMAGES)
    data.paths = sortPathsByBirthTime(getFilePathsInDetectionsDir(imgExt)).slice(0, count)
    emitter.emit(eventStr, data)
}

/**
 * Processing of a new image of detection
 * @param {EventEmitter} emitter Event emitter instance
 * @param {string} filePath The path of the image
 */
function processImg(emitter, filePath) {
    if (filePath.endsWith(`.${imgExt}`)) {
        debug(`Processing image ${filePath}`)
        if ((toNowSeconds() - lastDetectionDate) > minTimeBetweenDetectionsSeconds) {
            count = 0
            lastDetectionDate = toNowSeconds()
            return
        }
        const threshold = getNewImgsThreshold()
        if (threshold && (count >= threshold)) {
            if(count === threshold) {
                emitEventWithLastImgsPaths(emitter)
                count++
            }
            else {
                count = 0
                cleanDetectionsDir()
            }
        } else count++
    }
}

/**
 * Get path of the video with detection
 * @return {string} Video's path
 */
function getPathOfCreatedVideo() {
    const paths = getFilePathsInDetectionsDir(videoExt)
    const ind = (paths.length > conf.max_saved_videos) ? conf.max_saved_videos - 1 : 0
    return paths[ind]
}

/**
 * Process a video of detection
 * @param {EventEmitter} emitter Event emitter instance
 * @param {string} filePath The video's path
 */
function processVideo(emitter, filePath) {
    if (filePath.endsWith('video.finished')) {
        debug('Processing video')
        const path = getPathOfCreatedVideo()
        const data = Object.create(sentData.types.VIDEO)
        data.path = path
        emitter.emit(eventStr, data)
        cleanDetectionsDir({ exceptFilePath: path })
    }
}

/**
 * Create a directory with the given path
 * @param {string} path Directory's path
 */
const createDir = (path) => {
    if(!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true })
    }
}

/**
 * Starts detecting: watching for directory of motion's detections for new files.
 * The func counts the new files and after a threshold emits event.
 * Counting depends on period between current and the last detection if the period is too long, then counting is zeroed.
 * @param {EventEmitter} emitter Emitter instance for emitting events
 */
function start(emitter) {
    debug(`Start detecting in the directory ${detectionsDirPath}`)
    createDir(detectionsDirPath)
    createDir(finishedVideoNotificationsDirPath)

    const imgsListener = (path) => processImg(emitter, path)
    imgFilesWatcher = chokidar.watch(detectionsDirPath).on('add', imgsListener)
    const videoListener = (path) => processVideo(emitter, path)
    tmpDirWather = chokidar.watch(finishedVideoNotificationsDirPath).on('add', videoListener)
}

/**
 * Stopping detecting
 */
function stop() {
    debug('Stop detecting')
    if (imgFilesWatcher)
        imgFilesWatcher.close()
    if (tmpDirWather)
        tmpDirWather.close()
}

/**
 * Cleaning detections directory
 * @param {{ exceptFilePath: string }} options Options of deleting files: exception to deleting
 */
function cleanDetectionsDir(options) {
    debug('Clean detections directory')
    const exceptFilePath = options?.exceptFilePath
    delFiles({ extension: imgExt, maxSavedFiles: conf.max_saved_imgs, exceptFilePath})
    delFiles({ extension: videoExt, maxSavedFiles: conf.max_saved_videos, exceptFilePath})
}

/**
 * Sort the array of given paths
 * @param {[string]} paths The array
 * @return {[string]} The sorted array
 */
function sortPathsByBirthTime(paths) {
    const cmp = (path1, path2) => fs.statSync(path2).birthtimeMs - fs.statSync(path1).birthtimeMs
    return paths.sort(cmp)
}

/**
 * Deleting files with given extensions
 * @param {{extension: string, maxSavedFiles: number, exceptFilePath: string}} info Information of the being deleted files: file extension, maximal saved files, excepted file path
 */
function delFiles(info) {
    debug(`Deleting files *.${info.extension}`)
    const sorted = sortPathsByBirthTime(getFilePathsInDetectionsDir(info.extension))
    const delElementsNum = sorted.length - info.maxSavedFiles
    if(delElementsNum > 0) {
        sorted
            .slice(sorted.length - delElementsNum)
            .forEach(path => {
                if (path !== info.exceptFilePath) {
                    fs.unlinkSync(path)
                }
            })
    }
}

/** Start detections */
exports.start = start
/** Cleaning directory of detections */
exports.cleanDir = cleanDetectionsDir
/** String of detections event */
exports.eventStr = eventStr
/** Path to the directory containing detections (videos/images) */
exports.dirPath = detectionsDirPath
/** Stop detections */
exports.stop = stop

exports.finishedVideoNotificationsDirPath = finishedVideoNotificationsDirPath