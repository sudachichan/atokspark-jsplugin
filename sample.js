var commands = [
    ['pluginjs:', 'node.jsサンプルです'],
    ['pluginjs2:', '=============\n  ATOK Spark + node.js Plugin\n============='],
];

function debug(text) {
    // console.log(text)
}

console.log('HELLO ATOK Spark/0.0');
var reader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});
var lastError = '';
reader.on('line', function (line) {
    debug(line);
    var args = line.split(' ');
    debug(args);
    var command = args.shift();
    var arg = args.join(' ');
    switch (command) {
    case 'CHECK':
        var found = -1;
        commands.forEach(function (command, i) {
            if (command[0] === arg) {
                found = i;
            }
        });
        console.log(found > -1 
            ? 'REPLACE ' + found
            : 'NONE');
        break;
    case 'GETTEXT':
        try {
            var token = parseInt(arg);
            console.log('TEXT ' + commands[token][1]);
        } catch (e) {
            lastError = e.toString();
            console.log('ERROR');
        }
        break;
    case 'GETERROR':
        console.log(lastError);
        break;
    case 'QUIT':
        reader.close();
        process.exit(0);
        break;
    default:
        console.log('UNKNOWN');
    }
});
