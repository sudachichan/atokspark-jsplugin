# atokspark-jsplugin
node.js で [ATOK Spark](https://github.com/JustSystems/ATOK_Spark) のプラグインを簡単に記述できるフレームワークです。

## サンプル
このフレームワークを使っているサンプルコードは以下です。

https://github.com/sudachichan/atokspark-jsplugin-sample

## 使い方

node.js のパッケージマネージャである `npm` を使うことを前提にしています。ディレクトリを作成し、 `npm init` してください。
```
$ mkdir your-plugin
$ cd your-plugin
$ npm init
```

`npm` でこのリポジトリをインストールします。(npm repository には未登録です。)
```
$ npm install --save git+https://github.com/sudachichan/atokspark-jsplugin.git
```

### 簡易記法

以下のように `Plugin.byRules()` に、以下の内容の連想配列を指定することでプラグインを定義できます。

|属性名  |値 |
|--------|---|
|replaces|文字列置換ルールを表現する`{正規表現: 関数}`の連想配列|
|views   |ヘルプ表示ルールを表現する`{正規表現: 関数}`の連想配列|

```javascript
var Plugin = require('atokspark-jsplugin');

Plugin.byRules({
    replaces: {
        'foo:': function () {
            return 'foo: がこの文字列に置換されます。';
        },
        'bar:(.*):': function (matches) {
            return 'bar:ほにゃらら: にマッチして「' + matches[1] + '」を使った文字列に置換されます。';
        },
    },
    views: {
        'help:': function (callback) {
            callback('<div>help</div>');
        },
    },
});
```

### 簡易記法(非同期版)

以下のように `Plugin.byRules()` に、以下の内容の連想配列を指定することでプラグインを定義できます。

|属性名  |値|
|--------|---|
|async   |true|
|replaces|文字列置換ルールを表現する`{正規表現: 関数}`の連想配列|
|views   |ヘルプ表示ルールを表現する`{正規表現: 関数}`の連想配列|

```javascript
var Plugin = require('atokspark-jsplugin');

Plugin.byRules({
    async: true,
    replaces: {
        'foo:': function (callback) {
            callback('foo: がこの文字列に置換されます。');
        },
        'bar:(.*):': function (callback, matches) {
            callback('bar:ほにゃらら: にマッチして「' + matches[1] + '」を使った文字列に置換されます。');
        },
    },
    views: {
        'help:': function (callback) {
            callback('<div>help</div>');
        },
    },
});
```

### イベント処理記法

以下のように `check` イベントと `gettext` に応答するスクリプトを記述するだけで、ATOK Sparkプラグインとして動作するようになります。

簡易記法では行えないような特殊なマッチ処理に使ってください。

```javascript
var Plugin = require('atokspark-jsplugin');

var yourPlugin = new Plugin().run();
yourPlugin.on('check', function (text, callback) {
  // 指定されたテキストに対して文字列置換する場合は ['REPLACE', 整数] をcallbackします。
  callback(['REPLACE', 0]);
  // 指定されたテキストに対して HTML ビューを表示する場合は、['VIEW', 整数]をcallbackします。
  // callback(['VIEW', 0]);
  // 指定されたテキストに応答しない場合はnullをcallbackします。
  // callback(null);
});
yourPlugin.on('gettext', function (token, callback) {
  // 'check' の問い合わせ時に返した整数値(トークン)に対する文字列を返します。
  callback('text');
  // 'VIEW'を返した場合はXHTML文字列を返します。
  // callback('<strong>text</strong>');
  // エラー時は例外を throw してください。
});
```

## ATOK Spark にプラグインを登録する

なお、 ATOK Spark の plugin.lst には以下のように指定してください。(Mac, nodebrew で node.js をインストールしている場合の例)
```
/Users/YOUR_ACCOUNT/.nodebrew/current/bin/node PATH/TO/YOUR_PLUGIN.js
```
- `YOUR_ACCOUNT`: あなたのユーザ名
- `PATH/TO/YOUR_PLUGIN.js`: あなたのプラグインjsファイルパス
