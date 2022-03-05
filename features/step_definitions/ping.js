const { Given } = require('@cucumber/cucumber')
const { writeFileSync } = require('fs')

const chai = require('chai')
const { setDeviceState } = require("../../test/utils")
const assert = chai.assert

const ips = ['192.168.0.13', '192.168.0.14', '192.168.0.15']
const ip = ips[1]
const ipsPath = 'resources/ips.data'

Given('user has one defined device', function () {
    try {
        writeFileSync(ipsPath, ip, 'utf-8')
    } catch (err) {
        assert.fail(`The step failed: ${err}`)
    }
})

Given(/^(some |)user's device is (reachable|unreachable)$/, function (some, state) {
    if(!some) {
        if (state === 'reachable')
            setDeviceState({ reachable: true }, ip)
        else {
            setDeviceState({ reachable: false })
        }
    }
})

Given(/^user has multiple defined devices$/, function () {
    try {
        ips.forEach(ip => writeFileSync(ipsPath, ip, { encoding: 'utf-8', flag: 'ax'}))
    } catch (err) {
        assert.fail(`The step failed: ${err}`)
    }
})

Given(/^all user's devices are (unreachable|reachable)$/, function (state) {
    if (state === 'reachable')
        ips.forEach(curIP => setDeviceState({ reachable: true }, curIP))
    else {
        setDeviceState({ reachable: false })
    }
})