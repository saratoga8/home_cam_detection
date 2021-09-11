const log4js = require('log4js')



const getCategory = () => {
    if (process.env.DEBUG_LOG)
        return 'debug'
    if (process.env.TEST_LOG)
        return 'test'
    return 'production'
}

const logger = log4js.getLogger(getCategory())

log4js.configure('src/logger/log4js.conf')

/**
 * Show an error message
 * @param txt {string} Text of the error message
 */
const error = (txt) => logger.error(txt)

/**
 * Show an warning message
 * @param txt {string} Text of the warning message
 */
const warn = (txt) => logger.warn(txt)

/**
 * Show an debug message
 * @param txt {string} Text of the debug message
 */
const debug = (txt) => logger.debug(txt)

module.exports = { error, warn, debug }