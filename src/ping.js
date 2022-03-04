const { pathExistsSync } = require('fs-extra')
const { readFileSync } = require('fs')
const ping_lib = require('ping')
const { setInterval } = require('timers')
const yaml = require('js-yaml')
const { isIP } = require('net')

const { error, warn, debug } = require('../src/logger/logger')

const eventStr = "host_state"


/**
 * Running state
 * @type {boolean}
 */
let running = false

/**
 * Get the state of the service
 * @return {boolean} Is the service running
 */
function isRunning() {
    return running
}

/**
 * Select valid IPs from the given IPs array
 * @param ips {string[]} IPs array
 * @return {string[]} the array of valid IPs
 */
function selectValidIps(ips) {
    const condition = (ip) => {
        if (!isIP(ip)) {
            warn(`The IP ${ip} is not valid`)
            return  false
        }
        return true
    }
    return ips.filter(condition)
}

/**
 * Get IPs from the file with the given path
 * @param path {string} The path of the file with IPs
 * @return {string[]} The array of IPs
 */
function getIpsFromFile(path) {
    let ips = []
    if (pathExistsSync(path)) {
        const delimiter = '\n'
        const txt = readFileSync(path, { encoding: "utf-8" })
        if (txt.includes(delimiter)) {
            ips = txt.split(delimiter).filter(element => element.lends > 0)
        } else {
            ips = txt.length > 0 ?  [ txt ] : []
        }
        debug(`IPs from ${path}: ${ips}`)
    } else {
        error(`The file ${path} doesn't exist`)
    }
    return Object.freeze(selectValidIps(ips))
}

/**
 * Get ping configuration from a file
 * @param path The path of the file with the configuration
 * @return {Readonly<Object>} The object of the configuration from file or default configuration
 */
function getPingConf(path) {
    const conf = {
        timeout: 1,
        min_reply: 5
    }
    if (pathExistsSync(path)) {
        const yamlConf = yaml.load(readFileSync(path, { encoding: 'utf8' }))
        if (yamlConf.configuration) {
            Object.keys(yamlConf.configuration).forEach(key => {
                if (yamlConf.configuration[key] === undefined) {
                    error(`The item ${key} is Undefined in the file ${path}`)
                    return conf
                }
            })
            conf.timeout = parseInt(yamlConf.configuration.timeout_s)
            conf.min_reply = parseInt(yamlConf.configuration.min_reply)
        } else {
            error(`There is no item 'configuration' in the file ${path}`)
        }
    }
    else {
        error(`The ping configuration file has not found. Default values are being used`)
    }
    return conf
}

/**
 * Monitor the reachability of the given IPs
 * @param ips {string[]} IPs array
 * @param confPath {string} path of the configuration file of ping
 * @param emitter {EventEmitter} Event emitter instance
 */
async function monitorIps(ips, confPath, emitter) {
    debug(`Monitoring ips: ${ips}`)
    const pingConfig = getPingConf(confPath)
    const intervalMs = (pingConfig.timeout * pingConfig.min_reply * 1000) * ips.length
    const intervalProc = setInterval(async () => {
        if (running) {
            const reachableIp = await getFirstReachableIp(ips, pingConfig)
            const state = reachableIp !== undefined
            debug(`Reachable: ${state}`)
            emitter.emit(eventStr, { reachable: state })
        } else {
            clearInterval(intervalProc)
        }
    }, intervalMs)
}

/**
 * Get the first IP reachable via ping
 * @param ips {string[]} IPs
 * @param pingConfig Ping configuration
 * @return {Promise<string|undefined>} IP or undefined
 */
async function getFirstReachableIp(ips, pingConfig) {
    const sendRequest = async (ip) => await ping_lib.promise.probe(ip, pingConfig)
    const results = await Promise.all(ips.map(sendRequest))
    return results
        .find(result => result.alive)
        ?.numeric_host
}

/**
 * Start the service
 * @param paths { Object<string, string> } Paths of the file with IPs and file with the configuration of ping
 * @param emitter {EventEmitter} Event emitter instance
 */
async function start(paths, emitter) {
    debug('Starting ping')
    if (pathExistsSync(paths.ips)) {
        const ips = getIpsFromFile(paths.ips)
        if (ips.length !== 0) {
            running = true
            await monitorIps(ips, paths.conf, emitter)
        } else {
            running = false
            warn(`The file ${paths.ips} has no IPs`)
        }
    } else {
        running = false
        error(`The given file with IPs ${paths.ips} doesn't exist`)
    }
}

function stop() {
    debug('Stopping the ping')
    running = false
}

exports.start = start
exports.stop = stop
exports.isRunning = isRunning
exports.eventHostStateStr = eventStr