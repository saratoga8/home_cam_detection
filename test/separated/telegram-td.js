const { Client } = require('tdl')
const { TDLib } = require('tdl-tdlib-addon')

const { sleepMs } = require('../utils')

const path = '/home/saratoga/Downloads/tdlib/td/build/libtdjson.so'
const CHAT_ID = process.env.TELEGRAM_BOT_CHAT
const imgMsgType = 'messagePhoto'
const txtMsgType = 'formattedText'
const videoMsgType = 'messageAnimation'

let lastMsgs = []

const getClient = () => {
    const client = new Client(new TDLib(path), {
        apiId: process.env.TELEGRAM_API_ID,
        apiHash: process.env.TELEGRAM_API_HASH
    })
    client.on('error', console.error)
    client.on('update', update => {
        if(update.chat_id === CHAT_ID && update.last_message) {
            lastMsgs.push(update.last_message)
        }
    })

    return client
}

const sendTxt = async (client, txt) => {
    return client.invoke({
        _: 'sendMessage',
        chat_id: CHAT_ID,
        input_message_content: {
            _: 'inputMessageText',
            text: {
                _: txtMsgType,
                text: txt
            }
        }
    })
}

const msgInfo = async (client, id) => {
    const info = await client.invoke({
        _: 'getMessages',
        chat_id: CHAT_ID,
        message_ids: [ id ]
    })
    return info.messages[0]
}

const chatHistory = async (client) => {
    const lastMsg = await client.invoke({
        _: 'getChatHistory',
        chat_id: CHAT_ID,
        from_message_id: 0,
        offset: 0,
        limit: 100,
        only_local: true
    })

    return (await client.invoke({
        _: 'getChatHistory',
        chat_id: CHAT_ID,
        from_message_id: lastMsg.id,
        offset: 0,
        limit: 100,
        only_local: true
    })).messages
}

const clrHistory = async (client) => {
    return client.invoke({
        _: 'deleteChatHistory',
        chat_id: CHAT_ID,
        remove_from_chat_list: false,
        revoke: true
    })
}

exports.send = async (txt) => {
    const client = getClient()
    await client.connectAndLogin()

    const result = await sendTxt(client, txt)

    while((await msgInfo(client, result.id)) !== null) { await sleepMs(1000) }

    await client.close()
}

const getTxtMsgs = async (msgs) => {
    return msgs.filter((msg) => msg.content.text)
        .filter((msg) => msg.content.text._ === txtMsgType)
        .map((msg) => msg.content.text.text)
}

const getImgMsgs = async (msgs) => {
    return msgs.filter((msg) => msg.content._ === imgMsgType)
        .map((msg) => msg.content.caption)
}

const getVideoMsgs = async (msgs) => {
    return msgs.map((msg) => msg.content._ === videoMsgType)
}

exports.waitForLastMsgs = async (numMsgs, type) => {
    const client = getClient()
    await client.connectAndLogin()

    const retriesNum = 5
    for(let retryNum = 0; retryNum < retriesNum; ++retryNum) {
        if (lastMsgs.length === numMsgs)
            break
        await sleepMs(500)
    }

    await client.close()

    const msgs = lastMsgs
    lastMsgs = []

    return (type) ? filterMessages(msgs, type) : msgs
}

const filterMessages = async (msgs, type) => {
    switch (type) {
        case imgMsgType: return await getImgMsgs(msgs)
        case txtMsgType: return await getTxtMsgs(msgs)
        case videoMsgType: return await getVideoMsgs(msgs)
        default:
            console.error(`Unknown messages type "${type}". Used types: ${txtMsgType}, ${imgMsgType}, ${videoMsgType}`)
    }
    return []
}

exports.messages = async (msgType) => {
    const client = getClient()
    await client.connectAndLogin()

    const allMsgs = await chatHistory(client)

    await client.close()
    return (msgType) ? filterMessages(allMsgs, msgType) : allMsgs
}

exports.clearHistory = async () => {
    const client = getClient()
    await client.connectAndLogin()

    await clrHistory(client)
    while ((await chatHistory(client)).length !== 0)
        await sleepMs(500)

    await client.close()
}

exports.areLastMessagesOfType = async (type) => {
    let msgs = []
    switch (type) {
        case imgMsgType: msgs = await getImgMsgs(lastMsgs); break
        case txtMsgType: msgs = await getTxtMsgs(lastMsgs); break
        case videoMsgType: msgs = await getVideoMsgs(lastMsgs); break
        default:
            console.error(`Unknown messages type "${type}". Used types: ${txtMsgType}, ${imgMsgType}, ${videoMsgType}`)
    }
    return msgs.length === lastMsgs.length
}

exports.txtMsgType = txtMsgType
exports.imgMsgType = imgMsgType
exports.videoMsgType = videoMsgType
