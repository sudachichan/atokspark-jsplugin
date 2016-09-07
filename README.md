# atok-spark-plugin.js
node.js で [ATOK Spark](https://github.com/JustSystems/ATOK_Spark) のプラグインを簡単に記述できるフレームワークです。

(※現状の名前は npm モジュール名として扱いにくいため、近い将来 repo 名は変更するかもしれません。)

## サンプル
このフレームワークを使っているサンプルコードは以下です。

https://github.com/sudachichan/atok-spark-plugin.js-sample

## 使い方

node.js のパッケージマネージャである `npm` を使うことを前提にしています。ディレクトリを作成し、 `npm init` してください。
```
$ mkdir your-plugin
$ cd your-plugin
$ npm init
```

`npm` でこのリポジトリをインストールします。(npm repository には未登録です。)
```
$ npm install --save git+https://github.com/sudachichan/atok-spark-plugin.js.git
```

以下のように `check` イベントと `gettext` に応答するスクリプトを記述するだけで、ATOK Sparkプラグインとして動作するようになります。
```javascript
var Plugin = require('atok-spark-plugin.js');

var yourPlugin = new Plugin().run();
yourPlugin.on('check', function (text, callback) {
  // 指定されたテキストに応答する場合は、整数をcallbackします。
  callback(0);
  // 指定されたテキストに応答しない場合はnullをcallbackします。
  // callback(null);
});
yourPlugin.on('gettext', function (token, callback) {
  // 'check' の問い合わせ時に返した整数値(トークン)に対する文字列を返します。
  return "text";
  // エラー時は例外を throw してください。
});
```

なお、 ATOK Spark の plugin.lst には以下のように指定してください。(Mac, nodebrew で node.js をインストールしている場合の例)
```
/Users/YOUR_ACCOUNT/.nodebrew/current/bin/node PATH/TO/YOUR_PLUGIN.js
```
- `YOUR_ACCOUNT`: あなたのユーザ名
- `PATH/TO/YOUR_PLUGIN.js`: あなたのプラグインjsファイルパス
