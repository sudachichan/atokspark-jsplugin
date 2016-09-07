var assert = require('assert');
var child_process = require('child_process');

var testSuite = [
    ['HELLO',
        null,
        'HELLO ATOK Spark/0.0',
        '正しいHELLOコマンドが送られてきませんでした。'],
    ['GETERROR(noerror)',
        'GETERROR',
        '',
        'エラーなし状態で、空行を返していません。GETERRORが未実装では？'],
    ['CHECK(not found)',
        'CHECK hoge',
        'NONE',
        '未知のトリガーに対して、NONEを返していません。'],
    ['CHECK(found)',
        'CHECK pluginjs:',
        /REPLACE \d+/,
        '既知のトリガーに対して、"REPLACE 整数"を返していません。'],
    ['GETTEXT(succeeds)',
        'GETTEXT 0',
        'TEXT node.jsサンプルです',
        '既知のトリガーに対して、期待する結果を返していません。'],
    ['GETTEXT(fails)',
        'GETTEXT 1234567890',
        'ERROR',
        '既知のトリガーに対して、ERRORを返していません。'],
    ['UNKNOWN',
        'hoge',
        'UNKNOWN',
        '未知のコマンドに対して、UNKNOWNを返していません。'],
    ['QUIT',
        'QUIT',
        null,
        null],
];

var child = child_process.fork('sample.js', [], {
    silent: true
});
var reader = require('readline').createInterface({
    input: child.stdout,
    output: child.stdin,
});
function childPrint(line) {
    console.log('\tINPUT : ' + line);
    child.stdin.write(line + '\n');
}
var currentTest = testSuite.shift();
var delayedError = null;
console.log('TEST: ' + currentTest[0]);
reader.on('line', function (line) {
    if (testSuite.length) {
        console.log('\tOUTPUT: ' + line);
        if (delayedError) {
            throw delayedError;
        }
        var re = new RegExp(currentTest[2]);
        var found = re.exec(line);
        try {
            assert(found && found[0] === line, currentTest[3]);
        } catch (e) {
            delayedError = e;
            childPrint('GETERROR');
            return;
        }
        console.log('=>OK');

        currentTest = testSuite.shift();
        // console.log(currentTest);
        console.log('TEST: ' + currentTest[0]);
        childPrint(currentTest[1]);
    } else {
        console.log('=>NG');
    }
});
reader.on('close', function () {
    if (!testSuite.length) {
        console.log('=>OK');
    } else {
        console.log('=>CRASHED!!!')
    }
});
