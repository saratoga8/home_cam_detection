const chai = require('chai')
    , chaiHttp = require('chai-http')
chai.use(chaiHttp)
const chaiExec = require('chai-exec')
const telegramCliPath = 'telegram-cli'
const assert = chai.assert
const {execSync} = require('child_process')

const botName = 'home_cam'
exports.botName = botName

exports.dialogList = () => chaiExec(`${telegramCliPath} -e "dialog_list"`)
exports.path = () => chaiExec(`which ${telegramCliPath}`)
exports.sendMsg = (msg) => {
    // chai.request("https://api.telegram.org")
    //     .post("/bot1453920552:AAFH08aBvY6hyF8UYVI4iunsoeAxZUQ3jy0/sendMessage")
    //     .send({'chat_id': '1320889499', 'text': "hello"})
    //     .end((err, resp) => {
    //         assert.equal(resp.status, 200)
    //     })
    //execSync(`(echo "dialog_list"; sleep 1; echo "msg ${botName} ${msg}") | telegram-cli > /dev/null`)
    execSync(`telegram-cli -DRWC -e "msg ${botName} ${msg}" > /dev/null`)
}