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
    execSync(`telegram-cli -DRWC -e "msg ${botName} ${msg}" > /dev/null`)
}