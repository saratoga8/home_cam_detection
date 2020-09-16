const cli = require('./cli')
const tgm = require('./telegram')

const yaml = require('js-yaml');
const fs   = require('fs');

const ios = { CLI: { out: cli.io.out, in: cli.io.in}, TELEGRAM: { out: tgm.io.out, in: tgm.io.in } }

/**
 * Get IO object name should be used from YAML file
 * @access private
 * @param {string} path YAML file's path
 * @returns {string|null} Name of NULL
 */
const getIoNameFrom = (path) => {
    const doc = yaml.safeLoad(fs.readFileSync(path, 'utf8'))
    if(doc !== undefined) {
        for(const prop in doc) {
            const io = doc[prop]
            if(io['use'] === 'yes') {
                return prop
            }
        }
    }
    return null
}

/**
 * Load IO object should be used from YAML file
 * @param{string} path YAML file path
 * @returns {null|ios} IO object or NULL if object hasn't found
 */
exports.loadFrom = (path) => {
    try {
        const ioName = getIoNameFrom(path)
        if(ioName != null) {
            for(const prop in ios)
                if(prop.toLowerCase() === ioName)
                    return ios[prop]
        }
        console.error(`Invalid YAML file ${path}: can't create object`)
    } catch (e) {
        console.error(`Can't load YAML file ${path}: ${e}`)
    }
    return null
}

exports.ios = ios

