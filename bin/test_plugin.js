#!/usr/bin/env node

var fs = require('fs')
var assert = require('assert');
var child_process = require('child_process');

if (process.argv.length < 3) {
    error('引数にテスト定義JSONファイルを指定してください。');
}
function error(errorMessage) {
    console.log(errorMessage);
    printUsage();
    process.exit(1);
}
function printUsage() {
    var scriptName = process.argv[1]
    scriptName = '.' + scriptName.split(__dirname)[1];
    console.log('Usage: node ' + scriptName + ' TestDefinition.json\n');
}
var testSuite = JSON.parse(fs.readFileSync(process.argv[2]));

var commandLine = testSuite.plugin.split(' ');
var child = child_process.spawn(commandLine.shift(), commandLine, {
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
var tests = testSuite.tests;
var currentTest = tests.shift();
var delayedError = null;
console.log('TEST: ' + currentTest.test);
reader.on('line', function (line) {
    if (tests.length) {
        console.log('\tOUTPUT: ' + line);
        if (delayedError) {
            throw delayedError;
        }
        var re = new RegExp(currentTest.shouldOutput);
        var found = re.exec(line);
        try {
            assert(found && found[0] === line, currentTest.ifFailed);
        } catch (e) {
            delayedError = e;
            childPrint('GETERROR');
            return;
        }
        console.log('=>OK');

        currentTest = tests.shift();
        // console.log(currentTest);
        console.log('TEST: ' + currentTest.test);
        childPrint(currentTest.input);
    } else {
        assert(false, currentTest.ifFailed);
        console.log('=>NG');
    }
});
reader.on('close', function () {
    if (!tests.length) {
        console.log('=>OK');
    } else {
        console.log('=>CRASHED!!!')
    }
});
