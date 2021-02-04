[toc]

## WebPack 講座で詰まったところ。メモ書き

### ・パスが通っていないローカルモジュールの実行

実行コマンド [yarn run] または、[npx]　をつけて実行

```C++
yarn run webpack

npx webpack
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### ・モード指定で bundle(一つに纏める)

```C++
・開発環境用（圧縮無しeval内に記述される）
yarn run webpack --mode development

・--devtoolオプション使用。開発環境用（関数内に記述される）
yarn run webpack --mode development --devtool none

・--config [ファイルパス]　オプション使用で、webpack設定ファイルを指定して実行
（このオプションはwebpack.config.jsの名前を変えたときに有用）
yarn run webpack --mode development --devtool none --config .\webpack.dev.js
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### ・ハッシュについて

ハッシュは、「英数字の羅列」で、プロジェクト内のコードが変わり、再ビルドするたびに値が変化する。このため、一度読み込んだデータであればブラウザのキャッシュが働いて、画像が更新されたり、データの変更があったとき以外は再キャッシュされないので、パフォーマンス向上が期待できる。
ただし英数字羅列では開発しにくいため、主に商用時に用いられる。

[hash] = ビルドごとにハッシュ値が変化する

・差分だけ更新（こちらをお勧め）
[contenthash] = 精製ごとにハッシュ値が変化(恐らく画像サイズで変化)
[chunkhash] = グループごとにハッシュ値が同じになる

##### Production モードの中の TerserPlugin がミニファイを行ってくれる。

---

<!-- ---------------------------------------------------------------------------------------- -->

エラーに遭遇。
useBuiltIns: "entry"に変更で、エラーが消えた。
しかし全てのポリフィル(後方互換ライブラリ)を読み込むため、パフォーマンスは悪い。

```C++
ERROR in ./src/app.scss
Module build failed (from ./node_modules/mini-css-extract-plugin/dist/loader.js):
```

---

<!-- ---------------------------------------------------------------------------------------- -->

core-js とregenerator-runtime@0.13.4に設定で解決。

```c++
ERROR in ./node_modules/regenerator-runtime/runtime.js 18:0-57
Module not found: Error: Can't resolve 'core-js/modules/web.dom-collections.iterator.js' in 'D:\ドキュメント\Programing\JavaScript\webpack-lesson\node_modules\regenerator-runtime'
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### md の html 化の際について

1.ul タグの toc を `<ul class="toc-menu">`にする。 2.その下のメインコンテンツを`<div class="container">`で包む。

3.以下を追加

```css
.mume {
    display: flex;
    flex-direction: row-reverse;
}

.toc-menu {
    right: 0;
    display: flex;
}
```

4.-713 行目の「calc()」の部分を削除

\*検索用

```css
@media screen and (min-width: 914px) {
    html
        body[for="html-export"]:not([data-presentation-mode])
        .markdown-preview {
        padding: 2em calc(); /* ここのcalc */
    }
}
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### dev-server 設定で`Cannot find module`のエラー

```c++
Cannot find module 'webpack-cli/bin/config-yargs'
```

原因 :
webpack-cli 4.1.0 は webpack-dev-server3.11.0 に非対応。
bin に昔はあったファイルが消えている。

対処 : webpack-cli を"^3.1.0"にダウングレードさせる。

```c++
yarn upgrade webpack-cli@3.1.0
```

＊npm の場合は、アンインストールしてから再インストールしなければダウングレードできない。

その後、webpack を４に、terser-webpack-plugin も 4 にダウングレードさせられた。そしてようやく起動可能に。

---

<!-- ---------------------------------------------------------------------------------------- -->

### webpack.common.js 最後尾の chunks の非同期・同期読み込みの話

-   chunks は個別に設定可能、
-   splitChunks 内での chunks 記述はデフォルト設定として残せる。親階層
-   注：非同期インポートを使用していても chunks:"all" なら同期インポートされてしまう。
-   chunks: "initial"で非同期インポートのものは非同期で読み込み、同期インポートは同期で読み込むことができる。

テスト用

```javascript
import "js/sub";
setTimeout(() => {
    import("@scss/app");
}, 2000);
```

-   このとき 0.js や 0.css が作成される。0 は、webpack.common.js の

```javascript
const outputFile = [name];
output: {
    chunkFilename: `${outputFile}.js`;
}
```

となっており、chunkFilename に[name]が渡されたら ID を返す仕様となっている。

[webpack のバージョンの違いと注意点](https://webpack.js.org/migrate/4/)
