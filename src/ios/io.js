const cli = require('./cli')
const tgm = require('./telegram')

const yaml = require('js-yaml');
const fs   = require('fs');

const { debug } = require('../logger/logger')

const ios = {
    CLI: {
        out: cli.io.out,
        in: cli.io.in
    },
    TELEGRAM: {
        out: tgm.io.out,
        in: tgm.io.in
    }
}


/**
 * Get IO object name should be used from YAML file
 * @access private
 * @param {string} path YAML file's path
 * @returns {string} Name of NULL
 */
const getIoNameFrom = (path) => {
    try {
        const doc = yaml.load(fs.readFileSync(path, 'utf8'))
        if (doc) {
            for (const prop in doc) {
                const io = doc[prop]
                if (io['use'] === 'yes') {
                    return prop
                }
            }
            throw new Error(`Can't find configure of the used IO from the file '${path}'`)
        }
        throw new Error(`Invalid YAML file ${path}: can't create object`)
    } catch (e) {
        throw new Error(`Can't get IO object name from YAML ${path}: ${e}`)
    }
}

/**
 * Load IO object should be used from YAML file
 * @param{string} path YAML file path
 * @returns {ios} IO object
 * @throws {Error} If the object can't be created via the YAML file
 */
exports.loadFrom = (path) => {
    debug(`Get IO object name from ${path}`)
    const ioName = getIoNameFrom(path)
    for(const prop in ios) {
        if (prop.toLowerCase() === ioName)
            return ios[prop]
    }
    throw new Error(`Unknown IO name '${ioName}' from the file '${path}'`)
}

exports.ios = ios
exports.eventMsgSent = "sent"
