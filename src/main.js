const motion = require('./motion')
const process = require('process');
const fs = require('fs')

const args = require('yargs').argv
const pid_path = args.pid_path

process.on('SIGTERM', () => {
    motion.stop()
    process.exit()
})

if(motion.hasInstalled()) {
    fs.writeFile(pid_path, process.pid.toString(), err => {
        if(err) {
            console.error(`Can't write PID to the file ${pid_path}: ${err.message}`)
            process.exit(9)
        }
    })
    motion.start()
    setInterval(() => {}, 100)
}
else
    process.exit(9)
