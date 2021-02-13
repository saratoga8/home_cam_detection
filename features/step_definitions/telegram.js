const {Given, Then} = require('cucumber')

const chai = require('chai')
    , chaiHttp = require('chai-http')
chai.use(chaiHttp)
const assert = chai.assert
const expect = chai.expect

const telegram = require('../support/telegram-cli')
const {execSync} = require('child_process')

const yaml = require('js-yaml')
const config_path = 'resources/io.yml'
const fs = require('fs')
const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
const {sleep} = require('sleep')

const path = require('path')
var {When} = require('cucumber');

require('dotenv').config()


const notifications = [ { type: 'TXT', needle: 'OK' }, { type: 'VIDEO', needle: 'video' }, { type: 'IMAGE', needle: 'photo' } ]

Given(/^User has telegram bot$/, async () => {
    const resp = await chai.request("https://api.telegram.org").get(`/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates`)
    assert.equal(resp.status, 200)
})

Then(/^User gets (TXT|IMAGE|VIDEO) notification of (starting|stopping|detection)$/, async (type, action) => {
    const found = notifications.find(notification => notification.type === type )
    expect(found, `There is no such type of notification ${type}`).not.undefined

    const result = execSync(`telegram-cli -DRCW -e "history home_cam 2" | grep home_cam`)

    assert.include(result.toString(), found.needle, `There is no notification of ${action} in Telegram: ${result.toString()}`)
})

Given(/^There are no notifications in TELEGRAM$/, function () {
    const scriptPath = path.resolve('test/resources/clr_telegram.sh')
    assert.pathExists(scriptPath, `The path of clearing Telegram bot script hasn't found`)
    execSync(`${scriptPath} telegram-cli home_cam`)
})
When(/^User connects to Telegram bot$/, function () {
    telegram.sendMsg('hello', telegram.botName)
})

Then(/^User connected to Telegram bot$/, function () {
    const result = execSync(`telegram-cli -DRCW -e "history home_cam 2" | grep home_cam`)
    const found = result.toString().trim().match(/hello/g)
    assert.equal(found.length, 2, `There is no notification of starting in Telegram: ${result.toString()}`)
})

Given(/^User sets message type (IMAGE|VIDEO)$/, function (type) {
    conf.telegram.msg_type = `${type.toLowerCase()}`
    fs.writeFileSync(config_path, yaml.safeDump(conf), 'utf8')
})