const {Given, Then} = require('cucumber')

const chai = require('chai')
    , chaiHttp = require('chai-http')
chai.use(chaiHttp)
const assert = chai.assert

const telegram = require('../support/telegram-cli')
const {sleep} = require('sleep')
const {execSync} = require('child_process')

Given(/^User has telegram bot$/, async () => {
    const resp = await chai.request("https://api.telegram.org").get("/bot1453920552:AAFH08aBvY6hyF8UYVI4iunsoeAxZUQ3jy0/getUpdates")
    assert.equal(resp.status, 200)



    // const result = telegram.dialogList()
    // assert.equal(telegram.path().exitCode, 0, `Telegram-cli hasn't found: ${result.output}`)
    // assert.equal(result.exitCode, 0, `Cant get dialog list in telegram-cli: ${result.output}`)
    // assert.include(result.output, telegram.botName, `Bot '${telegram.botName}' hasn't found in dialog list in telegram-cli: ${result.output}`)
})
Then(/^User GETS notification of starting$/, async () => {
    const result = execSync(`telegram-cli -DRCW -e "history home_cam 2" | grep home_cam`)
    console.log(result.toString())
})