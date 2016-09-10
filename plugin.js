const EventEmitter = require('events').EventEmitter;

function isInteger(s) {
    return parseInt(s) === s;
}

function Plugin() {
    this.emitter = new EventEmitter();
    this.lastError = '';
    this.reader = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
    });
}
Plugin.prototype = {
    run: function () {
        console.log('HELLO ATOK Spark/0.0');
        this.reader.on('line', (line) => {
            const args = line.split(' ');
            const command = args.shift();
            const arg = args.join(' ');
            if (command in this) {
                this[command].apply(this, [arg]);
            } else {
                console.log('UNKNOWN');
            }
        });
        return this.emitter;
    },

    // Commands
    CHECK: function (text) {
        this.emit('check', text, (pair) => {
            return pair instanceof Array
                ? pair.join(' ')
                : 'NONE';
        }, (e) => {
            return 'NONE';
        });
    },
    GETTEXT: function (token) {
        this.emit('gettext', token, (text) => {
            return ['TEXT', text].join(' ');
        }, (e) => {
            return 'ERROR';
        })
    },
    GETERROR: function () {
        console.log(this.lastError);
    },
    QUIT: function () {
        this.reader.close();
        process.exit(0);
    },

    // Utilites
    emit: function (event, arg, onResult, onError) {
        try {
            this.emitter.emit(event, arg, (result) => {
                console.log(onResult(result));
            })
        } catch (e) {
            this.lastError = e.toString();
            if (onError) {
                console.log(onError(e));
            }
        }
    },
}
// 正規表現にマッチして結果を返すプラグインを定義します。
Plugin.byRules = function (rules, async) {
    const MAX_AWAITINGS = 5;
    const awaitings = [];
    var index = 0;

    const simple = new Plugin().run();
    simple.on('check', (text, callback) => {
        for (theRules of [rules.replaces, rules.views]) {
            for (regex of Object.keys(theRules)) {
                var matches = new RegExp(regex).exec(text);
                if (matches && matches[0] === text) {
                    const func = theRules[regex];
                    awaitings[index] = [func, matches];
                    const theType = theRules == rules.replaces
                        ? 'REPLACE'
                        : 'VIEW';
                    callback([theType, index]);
                    index = index + 1 % MAX_AWAITINGS;
                    return;
                }
            }
        }
        callback(null);
    });
    simple.on('gettext', (token, callback) => {
        if (token < 0 || MAX_AWAITINGS < token) {
            throw "無効な token です";
        }
        const pair = awaitings[token];
        const func = pair[0];
        const matches = pair[1];
        if (rules.async) {
            func(callback, matches);
        } else {
            callback(func(matches));
        }
    });
};

module.exports = Plugin;
