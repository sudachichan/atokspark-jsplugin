var Plugin = require('./plugin');

var commands = [
    ['pluginjs:', 'node.jsサンプルです'],
    ['pluginjs2:', '=============\n  ATOK Spark + node.js Plugin\n============='],
];

var sample = new Plugin().run();
sample.on('check', function (text, callback) {
    var found = -1;
    commands.forEach(function (command, i) {
        if (command[0] === text) {
            found = i;
        }
    });
    callback(found > -1 ? found : null);
});
sample.on('gettext', function (token, callback) {
    callback(commands[token][1]);
});
