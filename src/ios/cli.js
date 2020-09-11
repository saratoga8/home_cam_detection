const commands = require('../commands')

exports.io = {
    out: {
        send: (str) => {
            console.log(str)
        }
    },
    in: {
        receive: (emitter) => {
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });

//            rl.prompt();

            rl.on('line', (line) => {
                switch (line.trim()) {
                    case 'stop':
                        emitter.emit("command", { name: commands.stopMotion.command_name} )
                        break;
                    case 'start':
                        emitter.emit("command", { name: commands.startMotion.command_name} )
                        break;
                }
//                rl.prompt();
            }).on('close', () => {
                process.exit(0);
            });
        }
    }
}