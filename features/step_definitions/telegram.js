const {Given, Then, When} = require('@cucumber/cucumber')

const chai = require('chai')
    , chaiHttp = require('chai-http')
chai.use(chaiHttp)
const assert = chai.assert
const expect = chai.expect
chai.use(require('chai-as-promised'))

const telegram = require('../../test/separated/telegram-td')


const yaml = require('js-yaml')
const config_path = 'resources/io.yml'
const fs = require('fs')

const { sleepMs } = require('../../test/utils')

require('dotenv').config()


const invalidMsgTxt = 'bla-bla'

//const notifications = [ { type: 'TXT', needle: 'OK' }, { type: 'VIDEO', needle: 'video' }, { type: 'IMAGE', needle: 'photo' } ]

const getMsgsByType = async (type) => {
    if (type) {
        if (type === 'TXT')
            return await telegram.messages(telegram.txtMsgType)
        if (type === 'IMAGE')
            return await telegram.messages(telegram.imgMsgType)
        if (type === 'VIDEO')
            return await telegram.messages(telegram.videoMsgType)
        assert.fail(`Unknown message type: ${type}`)
    }
    else
        return await telegram.waitForLastMsgs()
}

Given(/^User has telegram bot$/, async () => {
    const resp = await chai.request("https://api.telegram.org").get(`/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates`)
    assert.equal(resp.status, 200)
})

const chkConversation = async (expectedSentMsg, expectedReceivedMsg, type) => {
    let msgs = []
    const expectedCondition = async () => {
        msgs = await getMsgsByType(type)
        if(msgs.length >= 2) {
            if(msgs.shift() === expectedReceivedMsg)
                return msgs.shift() === expectedSentMsg
        }
        return false
    }
    // try {
    //     await waitUntil(expectedCondition, {timeout: 8000, intervalBetweenAttempts: 1000})
    // }
    // catch (e) {
    //     assert.fail(`The sent and received messages are not '${expectedSentMsg}' and '${expectedReceivedMsg}'`)
    // }
    await sleepMs(5000)
    const result = await expectedCondition()
    assert(result,`The sent and received messages are not '${expectedSentMsg}' and '${expectedReceivedMsg}'`)
}

Then(/^User gets (TXT|IMAGE|VIDEO) notification of (starting|stopping|detection|error)$/, {timeout: 20000}, async function (type, action) {
    if(type === 'TXT') {
        if(action === 'error') {
            const expectedReceivedMsg = `Unknown command ${invalidMsgTxt}`
            await chkConversation(invalidMsgTxt, expectedReceivedMsg, type)
        }
        if(action === 'starting' || action === 'stopping') {
            const expectedMsg = 'OK'
            const expectedCondition = async () => {
                const msgs = await getMsgsByType(type)
                return msgs.shift() === expectedMsg
            }
            await sleepMs(5000)
            const result = await expectedCondition()
            assert(result, `Hasn't received the message '${expectedMsg}' of type ${type}`)
        }
    }
    else if(type === 'IMAGE') {
        const expectedCondition = async () => {
            const msgs = await getMsgsByType(type)
            return msgs.length !== 0
        }
        await sleepMs(15000)
        const result = await expectedCondition()
        assert(result, `No messages with ${type} have been received`)
    }
    else if(type === 'VIDEO') {
        const expectedCondition = async () => {
            const msgs = await getMsgsByType(type)
            return msgs.length !== 0
        }
        await sleepMs(15000)
        const result = await expectedCondition()
        assert(result, `No messages with ${type} have been received`)
    }
})

When(/^User (connects|connected) to Telegram bot$/, async function (state) {
    const msgTxt = 'hello'
    if(state === 'connected') {
        const msgs = await telegram.messages(telegram.txtMsgType)
        expect(msgs.length, "The number of the last messages is invalid").at.least(2)
        assert.equal(msgs.shift(), msgTxt, "The last message isn't valid")
        assert.equal(msgs.shift(), msgTxt, "The message before the last isn't valid")
    }
    else
        await telegram.send(msgTxt)
})

Given(/^User sets message type (IMAGE|VIDEO)$/, function (type) {
    const conf = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'))
    conf.telegram.msg_type = `${type.toLowerCase()}`
    fs.writeFileSync(config_path, yaml.safeDump(conf), 'utf8')
})


Given(/^User sends invalid command by telegram$/, async function () {
    await telegram.send(invalidMsgTxt)
})

Given(/^there is no messages in telegram bot$/, {timeout: 10000}, async function () {
    await telegram.clearHistory()
    await sleepMs(3000)
    let msgs = await getMsgsByType()
    if(msgs.length !== 0) {
        await telegram.clearHistory()
        await sleepMs(3000)
        msgs = await getMsgsByType()
        assert.equal(msgs.length, 0, 'Not all messages have been deleted')
    }
})
