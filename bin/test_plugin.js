#!/usr/bin/env node

const fs = require('fs')
const assert = require('assert');
const child_process = require('child_process');

function PluginTester(testSuite) {
    this.testSuite = testSuite;
}
PluginTester.prototype = {
    run: function () {
        this.tests = this.testSuite.tests;
        this.currentTest = this.tests.shift();
        console.log(`TEST: ${this.currentTest.test}`);
        this.delayedError = null;

        this.startPlugin();
        this.connect();
    },
    startPlugin: function () {
        const commandLine = this.testSuite.plugin.split(' ');
        this.child = child_process.spawn(commandLine.shift(), commandLine, {
            silent: true
        });
    },
    connect: function () {
        this.stdout = '';
        this.child.stdout.on('data', (data) => {
            this.stdout += data;
            const newLines = this.stdout.split('\n');
            if (newLines.length > 1) {
                this.stdout = newLines.pop();
                this.onLine(newLines.join('\n'));
            }
        });
        this.child.stdout.on('close', () => {
            if (this.stdout.length) {
                this.onLine(this.stdout);
                this.stdout = '';
            }
            this.onClose();
        });
    },
    onLine: function (line) {
        if (this.tests.length) {
            console.log(`\tOUTPUT: ${line}`);
            if (this.delayedError) {
                throw this.delayedError;
            }
            const re = new RegExp(this.currentTest.shouldOutput);
            const found = re.exec(line);
            try {
                assert(found && found[0] === line, this.currentTest.ifFailed);
            } catch (e) {
                this.delayedError = e;
                this.childPrint('GETERROR');
                return;
            }
            console.log('=>OK');

            this.currentTest = this.tests.shift();
            // console.log(currentTest);
            console.log(`TEST: ${this.currentTest.test}`);
            this.childPrint(this.currentTest.input);
        } else {
            assert(false, this.currentTest.ifFailed);
            console.log('=>NG');
        }
    },
    onClose: function () {
        if (!this.tests.length) {
            console.log('=>OK');
        } else {
            console.log('=>CRASHED!!!')
        }
    },
    childPrint: function (line) {
        console.log(`\tINPUT : ${line}`);
        this.child.stdin.write(line + '\n');
    },
};

function main(args) {
    if (process.argv.length < 3) {
        error('引数にテスト定義JSONファイルを指定してください。');
    }
    const testSuite = JSON.parse(fs.readFileSync(process.argv[2]));
    const tester = new PluginTester(testSuite);
    tester.run();
}
function error(errorMessage) {
    console.log(errorMessage);
    printUsage();
    process.exit(1);
}
function printUsage() {
    const scriptName = process.argv[1]
    scriptName = '.' + scriptName.split(__dirname)[1];
    console.log(`Usage: node ${scriptName} TestDefinition.json\n`);
}
main(process.argv);
