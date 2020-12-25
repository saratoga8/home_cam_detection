const {Given} = require('cucumber')

const chai = require('chai')
const assert = chai.assert

const telegram = require('../support/telegram-cli')
const botName = 'home_cam'

Given(/^User has telegram bot$/, function () {
    assert.equal(telegram.path().exitCode, 0, `Telegram-cli hasn't found: ${result.output}`)
    const result = telegram.dialogList()
    assert.equal(result.exitCode, 0, `Cant get dialog list in telegram-cli: ${result.output}`)
    assert.include(result.output, botName, `Bot '${botName}' hasn't found in dialog list in telegram-cli: ${result.output}`)
})