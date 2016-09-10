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

以下のように `Plugin.byRules()` に、`{正規表現: 関数}` の連想配列を指定することでプラグインを定義できます。

```javascript
var Plugin = require('atokspark-jsplugin');

Plugin.byRules({
    'foo:': function () {
        return 'foo: がこの文字列に置換されます。';
    },
    'bar:(.*):': function (matches) {
        return 'bar:ほにゃらら: にマッチして「' + matches[1] + '」を使った文字列に置換されます。';
    },
});
```

### 簡易記法(非同期版)

以下のように `Plugin.byRulesAsync()` に、`{正規表現: 関数}` の連想配列を指定することでプラグインを定義できます。

```javascript
var Plugin = require('atokspark-jsplugin');

Plugin.byRulesAsync({
    'foo:': function (callback) {
        callback('foo: がこの文字列に置換されます。');
    },
    'bar:(.*):': function (callback, matches) {
        callback('bar:ほにゃらら: にマッチして「' + matches[1] + '」を使った文字列に置換されます。');
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
  // 指定されたテキストに応答する場合は、整数をcallbackします。
  callback(0);
  // 指定されたテキストに応答しない場合はnullをcallbackします。
  // callback(null);
});
yourPlugin.on('gettext', function (token, callback) {
  // 'check' の問い合わせ時に返した整数値(トークン)に対する文字列を返します。
  callback("text");
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
