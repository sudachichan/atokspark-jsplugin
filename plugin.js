var EventEmitter = require('events').EventEmitter;

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
        var that = this;
        this.reader.on('line', function (line) {
            var args = line.split(' ');
            var command = args.shift();
            var arg = args.join(' ');
            if (command in that) {
                that[command].apply(that, [arg]);
            } else {
                console.log('UNKNOWN');
            }
        });
        return this.emitter;
    },

    // Commands
    CHECK: function (arg) {
        this.emit('check', arg, function (n) {
            return isInteger(n)
                ? 'REPLACE ' + n
                : 'NONE';
        }, function (e) {
            return 'NONE';
        });
    },
    GETTEXT: function (token) {
        this.emit('gettext', token, function (text) {
            return 'TEXT ' + text;
        }, function (e) {
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
            this.emitter.emit(event, arg, function (result) {
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
    var MAX_AWAITINGS = 5;
    var awaitings = [];
    var index = 0;

    var simple = new Plugin().run();
    simple.on('check', function (text, callback) {
        var matches = null;
        var matchedRule = null;
        for (regex of Object.keys(rules)) {
            var matches = new RegExp(regex).exec(text);
            if (matches) {
                var func = rules[regex];
                awaitings[index] = [func, matches];
                callback(index);
                index = index + 1 % MAX_AWAITINGS;
                return;
            }
        }
        callback(null);
    });
    simple.on('gettext', function (token, callback) {
        if (token < 0 || MAX_AWAITINGS < token) {
            throw "無効な token です";
        }
        var pair = awaitings[token];
        var func = pair[0];
        var matches = pair[1];
        if (async) {
            func(callback, matches);
        } else {
            callback(func(matches));
        }
    });
};
// 正規表現にマッチして結果を返すプラグインを定義します。(非同期実行版)
Plugin.byRulesAsync = function (rules) {
    Plugin.byRules(rules, true);
};

module.exports = Plugin;
