[toc]

# Webpack 手順

### 1.package.json 作成

###### ・Enter や y の入力が面倒…次のコマンドでは問い合わせなしで可能。

```C++
yarn init -y
または
npm init -y
npm init -yes
```

============================================================

### 2.webpack と webpack-cli を追加。

```C++
・ローカルインストールの場合
yarn add webpack webpack-cli --dev

・グローバルインストールの場合
yarn global add webpack webpack-cli
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 3.webpack.config.js の作成

```javascript
module.exports = {
    mode: "development", //--mode developmentと同等

    // ・webpack5系 では、noneを指定なら、devtool自体を指定しない必要あり
    // devtool: "none",

    //　・バンドルの開始ファイルを指定。デフォではsrc/index.js
    // entry: "./src/index.js",

    // ・entryに依存関係がなければ、配列指定が可能（1つに統合）
    entry: ["./src/app.js", "./src/sub.js"],

    // ・プロパティで渡す ⇒ ファイルが分割される
    //　シングルページなら普段不使用。複数ならページごとによく使われる。
    // entry: {
    //     index: "./src/index.js",
    //     sub: "./src/sub.js",
    // },

    // ・出力先指定したい場合。require(path)
    output: {
        path: path.resolve(__dirname, "public"),
        filename: "bundle.js",
        // ・変数も可能。[name] [id] [hash]
        // entry: {index: "./src/index.js"}なら[name]には「index」が入る
        // filename: "[name].bundle.js",
    },
};
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 4. js ファイル以外の変換のため、ローダー追加。

#####　・sass 変換。
sass : css への変換モジュール
sass-loader : webpack 用モジュール
css-loader : css バンドル
style-loader : js 内に読み込まれている css を html へ出力

```C++
yarn add --dev sass sass-loader css-loader style-loader
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 5.webpack.config.js の書き換え

#### ・module について追加

---

<!-- ---------------------------------------------------------------------------------------- -->

### 6.postCSS をインストール (現在依存関係でエラー)

postCSS : CSS に処理を加えたい場合に使用
autoprefixer : 旧ブラウザに対応させるための接頭辞を自動追加

```C++
yarn add postcss-loader autoprefixer --dev
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 7.postcss.config.js の作成

```javascript
module.exports = {
    plugins: [
        // ・autoprefixerをつかってpostCSSをやってもらいたいという記述
        require("autoprefixer"),
    ],
};
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 8.file-loader の追加

##### ・scss 経由で読み込んだ画像を読むために使用

```C++
yarn add file-loader --dev
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 9.webpack.config.js に追記

```javascript
{
    //jpe?gは[e]が0か1文字。|は「または」。
    test: /\.(jpe?g|gif|png|ico|svg|woff2?|tff|eot)$/,
    //複数なら配列[]のなかに{}
    use: [
        {
            // optionsを使うなら loader:を使う
            loader: "file-loader",
            // name, outputPath, publicPathは必須
            options: {
                //[ext]はextension
                name: "[name].[ext]",
                outputPath: "images",
                //　サーバー上のパス情報
                publicPath: "images",
            },
        },
    ],
    }
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 10. MinCssExtractPlugin を webpack.config に追加

####・インストールされているようにみえるが、yarn でインストールしないと見つからずにエラー

```javascript
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 11.babel を追加

・ES5 に ES6 記述を変換
ES5 変換は主に IE11 のため
babel-loader : webpack で babel を使う
@babel/core : babel の核となるモジュール
@babel/preset-env : 設定が楽になるプリセット

```
yarn add babel-loader @babel/core @babel/preset-env --dev
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 12.webpack.config の rules 配下に以下を記述

```javascript
module: {
    rules: [
        // ここから
        {
            test: /\.js$/,
            // ローダーで検査しない例外とするフォルダを指定
            exclude: /node-modules/,

            loader: "babel-loader",
        },
        // ここまで
    ];
}
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 13. .babelrc ファイルを作成し json(js) 形式で記述

##### ・.babelrc の場合

```json
{
    "presets": ["@babel/preset-env"]
}
```

##### ・babel.config.js の場合

```javascript
module.exports = (api) => {
    api.cache(true);

    return {
        presets: [
            ["@babel/preset-env"],
            {
                //追加のオプション
                targets: [
                    //絶対値(IE: "11"など)にするとアップデートのたびに修正がいる。
                    //相対記述へ

                    // 絶対に動いてほしいブラウザを指定
                    //最新のブラウザバージョン
                    "last 1 version",
                    //1%以上のシェアを持つブラウザ
                    "> 1%",
                    "maintained node versions",
                    "not dead",
                ],
            },
        ],
    };
};
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 14.core-js@3 を追加

#####・babel 変換時に、古いブラウザが持っていない機能を補足してくれるモジュール

regenerator-runtime : ES7(async/await など)の機能を古いブラウザでも動かすためのモジュール
core-js@3 : ES6 の機能を古いブラウザでも動かすためのモジュール

```c++
// version指定していることに注意 @3なのでversion 3
yarn add core-js@3 regenerator-runtime
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 15.core-js と regenerator-runtime の必要分を自動インポート

### babel.config.js に追記

###### ・target と同じ列に記述

```javascript
module.exports = (api) => {
    api.cache(true);

    return {
        presets: [
            ["@babel/preset-env"],
            {
                //追加のオプション
                targets: [
                    //絶対値(IE: "11"など)にするとアップデートのたびに修正がいる。
                    //相対記述へ

                    // 絶対に動いてほしいブラウザを指定
                    //最新のブラウザバージョン
                    "last 1 version",
                    //1%以上のシェアを持つブラウザ
                    "> 1%",
                    "maintained node versions",
                    "not dead",
                ],

                //ここから
                // 必要な機能だけを自動でとってきてくれる（import文不要）
                useBuiltIns: "usage",
                // ↑を使うにはヴァージョンを決める
                corejs: 3,

                //　ここまで
            },
        ],
    };
};
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 16.Eslint を追加

###### ・Eslint の連携をして文法チェックをする

eslint : 文法チェック
eslint-webpack-plugin: : webpack を eslint で使うのに使用
@babel-eslint-parser : Babel で変換されたコードを、ESLint を実行可能に。

＊以下はビルド時の高速化と、名称変更のため非推奨となりました。2020/9\
~~eslint-loader~~: eslint-webpack-plugin と同じ説明
~~babel-eslint~~ : @babel-eslint-parser と同じだが名称変更。アップデート停止

```c++
yarn add eslint eslint-webpack-plugin @babel/eslint-parser --dev
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 17. .eslintrc.js ファイルを作成。

#### eslintrc.js と webpack.config.js に記述

・.eslintrc.js

```javascript
{
    "env": {
        // これがないとconsole.logをeslintがはじく
        // ブラウザ上でのjavaScriptだと宣言
        // それぞれの時代のグローバルオブジェクトがある前提での文法チェック
        // es2017(es8)ならwindow
        "browser": true,
        "es2017": true,
        // requireでエラーが出なくなる
        "node": true
    },
    "extends": "eslint:recommended",
    "parser": "@babel/eslint-parser",
    "globals": {
        // webpackで設定してもここでエラー判定が出てしまうので、
        // ここでも定義
        "jQuery": "readonly",
        "$": "readonly",
        "utils": "readonly"
    },
    "rules": {
        // 未定義変数はエラーという判定
        "no-undef": "error",
        "semi": ["error", "always"]
    }
}
```

・webpack.config.js

```javascript
const ESLintPlugin = require("eslint-webpack-plugin");

module.exports = {
    // ...
    plugins: [new ESLintPlugin()],
    // ...
};
```

[ESLint のオススメ設定の詳細](https://eslint.org/docs/rules/)
[env 設定値一覧](https://eslint.org/docs/user-guide/configuring#specifying-environments)

---

<!-- ---------------------------------------------------------------------------------------- -->

### 18. html-webpack-plugin を追加

html-webpack-plugin : html に script タグを自動で挿入。hash 値も挿入してくれる。
minify も可能。

```c++
yarn add html-webpack-plugin --dev
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 18. Webpack.config.js に追記

```javascript
const HtmlWebpackPlugin = require("html-webpack-plugin");

plugins: [
    // ...
    new HtmlWebpackPlugin({
        template: "./src/index.html",
        inject: "body",
    }),
    // ...
];
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 18. html-loader を追加、webpack.config.js に追記

html-loader : html に読み込んでいる画像も連動して出力してくれる。
(通常は html 内に画像があっても出力エラー)

＊HtmlWebpackPlugin の読み込みと設定が済んでいないとエラー。
HtmlWebpackPlugin を読み込んでいない場合は、
entry(つまりは index.js(app.js))に import './index.html'を記載＊

```c++
yarn add html-loader --dev
```

・webpack.config.js

```javascript
rules[
//...
{
    // html-loader
    test: /\.html$/,
    use: ["html-loader"],
},
//...
]
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 19.webpack.config を開発用と商用に分ける。

開発・商用共通 : webpack.config.common.js
開発用 : webpack.dev.js
商用 : webpack.config.prod.js

###### ・コメントで//分割等で目印を付けてから分けていく。

common のコピー (webpack.dev.js) に以下を追記

```javascript
// 統合するために必要な関数と、共通ファイルをインポート
const { merge } = require("webpack-merge");
const commonConf = require("./webpack.common");

module.exports =
    // ...
    // ここを記述
    () =>
        merge(
            commonConf,
            // ここまで
            {
                //...
            }
            //...
            // かっこも記述
        );
```

##### dev と common を選別したら、webpack.prod.js として、dev をコピー

・選別後の webpack.dev.js

```javascript
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const { merge } = require("webpack-merge");
const commonConf = require("./webpack.common");
// commonファイルに渡す
const outputFile = "[name]";
const assetFile = "[name]";

module.exports = () =>
    merge(commonConf({ outputFile, assetFile }), {
        mode: "development", //--mode developmentと同等   //分割

        // ・source-mapを指定でデバッグをしやすく
        devtool: "source-map",
        plugins: [
            // minify処理は開発用ではしない。
            new HtmlWebpackPlugin({
                template: "./src/index.html",
                inject: "body", //分割
            }),
        ],
    });
```

・common.js の[name]を${outputFile}と書き換えていく

```javascript
//outputFileはdevまたはprodからわたってきた変数を受け取る
module.exports = ({ outputFile, assetFile }) => ({
    //...
});
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 18. package.json に追記

・script の中にコマンドを記述。
(--config で使用するのがめんどうなため。)
・汎用性のため yarn run ではなく npx と記述している

```json
  "license": "MIT",
  // ここから
  "scripts": {

    "dev": "npx webpack --config ./webpack.dev.js",
    "build": "npx webpack --config ./webpack.prod.js"
  },
  // ここまで
  "devDependencies": {
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 19. public ファイルを毎回削除してからビルドするのが面倒なため、rimraf を追加

rimraf : remove コマンドを使用可能にする

```C++
yarn add rimraf --dev
```

・以下を追記

```
"cleanup": "npx rimraf ./public",
npm run cleanup &&
//scripts 内のコマンドを利用するには npmだということに注意
```

package.json

```json
  "scripts": {
    "cleanup": "npx rimraf ./public",
    "dev": "npm run cleanup && npx webpack --config ./webpack.dev.js",
    "build": "npm run cleanup && npx webpack --config ./webpack.prod.js"
  },
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 20.webpack-merge も忘れずに追加。

common.js と、dev、prod を統合するのに使用

```c++
yarn add webpack-merge --dev
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 21. css と html ファイルの minify 用プラグインを追加

optimize-css-assets-webpack-plugin は webpack5 では使用できないため、
css-minimizer-webpack-plugin を使う。

```c++
yarn add css-minimizer-webpack-plugin terser-webpack-plugin --dev
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 22. webpack.prod.js に追記

```javascript
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
//...

//...
plugins: [
    new HtmlWebpackPlugin({
        template: "./src/index.html",
        inject: "body",
        //ここから
        minify: {
            collapseWhitespace: true,
            keepClosingSlash: true,
            removeComments: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            useShortDoctype: true,
        },
    }),
],
optimization: {
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
},
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 23.開発サーバーを設定するために webpack-dev-server を追加

```c++
yarn add webpack-dev-server --dev
```

・upgrade を要求されたらしておく

```c++
yarn upgrade fsevents2 chokidar3
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 23.webpack.dev 、package.json に追記

・webpack.dev

```javaScript
    //...

    devtool: "source-map",
    // ここから
    devServer: {
        // url設定
        // host: 'localhost',
        // port: 8080,
        // 自動で開く
        open: true,
        contentBase: "./public",
        // 監視して差分があった場合リロードしてくれる。
        watchOptions: {
            // node_modulesが変更されても再読み込みしないよう設定。
            ignored: /node_modules/,
        },
        proxy: {
            // 8080の内容を3000に転送する。URLに変化はなし。
            "/api": "http://localhost:3000",
        },
    },
    // ここまで
    plugins: [
    ]
```

・package.json

```json
"scripts"{
    // ...
    // ココのdevを修正し、残り2行を以下のように追加
    "dev": "npm run webpack:dev && npm run webpack:server",
    "webpack:dev": "npm run cleanup && npx webpack --config ./webpack.dev.js",
    "webpack:server": "npx webpack-dev-server --config ./webpack.dev.js",
    //...
}
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 24.複数ファイルで使う共通モジュールを webpack に登録して自動インポートさせる

-   例:jQuery をローカル環境全体で使えるように自動インポートさせる。
-   これで、ファイル毎に import 文の必要がない。

```javascript
//webpack内モジュールを分割代入
const {ProvidePlugin} = require("webpack);
//...
plugin: [
    //...
    // ここから
    new ProvidePlugin({
        // 関数名: "使用したいモジュール名"
        jQuery: "jquery",
        $: "jquery",
    }),
    // ここまで
]
//...
```

jquery をインストールして dev コマンドで確認

```c++
yarn add jquery
yarn dev
```

\*15:1 error 'jQuery' is not defined no-undef でエラーのときは、
.eslintrc に以下加筆

```json
    //...
    "parser": "@babel/eslint-parser",
    // ここから
    "globals": {
        "jQuery": "readonly",
        "$": "readonly"
    }
    // ここまで
    //...

```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 25.optimization の項目で、二重インポートを防ぎ、パフォーマンスを上げる。

-   共通モジュールを別ファイルとして出力させる
-   webpack.common.js に optimization で splitChunks を記述
    splitChunks : [オプション詳細](https://webpack.js.org/plugins/split-chunks-plugin/#optimizationsplitchunks)

```javascript
plugins:[

],
optimization: {
    splitChunks: {
        // chunks: "async"の場合ダイナミックインポートの文だけ分割される
        // ダイナミック（非同期）インポート例 : import("./src/app.js");
        // allの場合ダイナミック関係なくどれでも分割
        chunks: "all",
        // 最低0分割されるサイズ。30000=30kB
        minSize: 0,
    cacheGroups: {
        // とあるフォルダの出力をまとめたい場合、
        // このような記載方法でファイルの分断が可能。
        // ProvidePluginへの記載を合わせると、
        // どこでも使える分断されたファイルが出来上がる。
        // 例：vendorsというjsファイル名で、node_modules群をまとめたい。
        defaultVendors: {
            // vendorsという名前でファイルが作成される
            name: "vendors",
            //  [\\/]とは、\または/という意味。ディレクトリを表す。
            test: /[\\/]node_modules[\\/]/,
            // 優先度。高ければそれが優先されてバンドルされる
            priority: -10,
            reuseExistingChunk: true
        },
    },

    default: false,
//     default: {
//     minChunks: 2,
//     priority: -20,
//     reuseExistingChunk: true
// }
},
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 26. utils として共通の独自モジュールのみをグループ化してバンドル

-   独自共通モジュールを src/js/util/index.js と作成
-   js フォルダに app.js、sub.js
-   scss フォルダに app.scss を入れる

```javascript
export default {
    log: function (str) {
        console.log("utils index.js" + str);
    },
};
```

これを app.js と sub.js で import 文無しで読むために次を記述。

1.ProvidePlugin 内にパスとモジュール名として登録
2.splitChunks に追加記述
3.eslintrc の globals に`"utils": "readonly"`と追記

・webpack.common.js

```javaScript
new ProvidePlugin({
    // 関数名: "使用したいモジュール名"
    jQuery: "jquery",
    $: "jquery",
    // ES6の記法でProvideを使いたい場合、
    // 配列で第2引数にdefault(今回はexport defaultのため)

    // ここを記述
    utils: [path.resolve(__dirname, "src/utils"), "default"],

}),
    splitChunks: {
        //...
        minSize: 0,
        cacheGroups: {
            defaultVendors:{
            //...
        },
        // ここから
        utils: {
            name: "utils",
            // srcディレクトリ内のutilsという意味
            test: /src[\\/]js[\\/]utils/,
            // chunksは個別に設定でき、splitChunks内でのchunks記述はデフォルト設定として残せる。
            // 非同期インポートでもchunksがallなら動機インポートされてしまうので注意
            // chunks: "async",
        },
        // ここまで
        default:false,
        }
    }
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 27.フォルダ移動でエラーが出るので、エラー個所を探りながら、パスを正しく切り替える

-   だいたいのエラーはコマンド後のターミナルログの始まりに記載されている。

・entry, scss の image,scss の import app.js

---

<!-- ---------------------------------------------------------------------------------------- -->

### 28. 27 といったフォルダわけした場合の手動パス切り替えは面倒なので、resolve オプション使用

resolve オプション : パスを指定するのに使う省略記法を有効にするための情報登録の記述

webpack.common.js 最後尾

```javascript
    optimization: {
        //...
    },
    // ここから
    resolve: {
        alias: {
            // scssというパスを見つけたら、ここのフォルダを参照してくれる。
            // 例： import "scss/app.scss"     ⇒ import "絶対パス"/src/scss/app.scss"と認識して
            //バンドルしてくれるようになる。
            //エイリアスということが分かるように、@を接頭辞として使う。
            "@scss": path.resolve(__dirname, "src/scss"),
            "@imgs": path.resolve(__dirname, "src/images"),
        },
        // インポート時の拡張子を省いて書くことができる
        // デフォルトで[".js"]は存在する
        extensions: [".js", ".scss"],
        // インポート時にフルパスの記述を省ける
        // 例: import "node_modules/jquery" ⇒ import "query"
        // デフォルトで["node_modules"]が存在。
        modules: [path.resolve(__dirname, "src"), "node_modules"],
    },
    // ここまで
    },
```

-   scss での画像読み込みにエイリアスを使う場合、
    エイリアスとモジュールの記載ほうが 2 種存在。

```scss
// scss内でエイリアスを使うにはチルダ(~)を接頭辞として置く。
// background-image: url("~@imgs/favicon.ico");

// modulesオプションを利用した記述
background-image: url("~images/favicon.ico");
```

---

<!-- ---------------------------------------------------------------------------------------- -->

### 29. パス指定インポートを楽にするため、jsconfig.json を作成

-   jsconfig で VS code に独自の自動補完を追加する。

jsconfig.json に以下を記述

```json
{
    "compilerOptions": {
        // jsconfig.jsonからメインフォルダへの相対パス
        "baseUrl": "./src",
        "paths": {
            // srcパスからの記述src/scssなのでscssのみ記述
            "@scss": ["scss"],
            "scss": ["scss"],
            "js": ["js"],
            "images": ["images"]
        }
    }
}
```

注意!: ローカルサーバー起動中は自動補完登録しても補完が出てこない模様。
一度サーバーを切って、VS code を再起動する。

---

<!-- ---------------------------------------------------------------------------------------- -->

### 30.複数 html が存在するときの、スクリプトの自動生成を設定する。

other.html を作成。
index.html と other.html それぞれに js を読み込ませたい。

・webpack.dev.js

```javascript
        plugins: [
            // scriptタグをhtmlへ入れるときの設定
            new HtmlWebpackPlugin({
                // デフォルトがindex.htmlのためこちらに名前はいらない。
                template: "./src/index.html",
                inject: "body",

                // ここから

                // webpack.common.jsのentryで、
                // { app: "./src/js/app.js", sub: "./src/js/sub.js" }と、
                // 設定していれば、appを指定できる。
                chunks: ["app"],
            }),
            // 複数のhtmlならファイル名が必要
            new HtmlWebpackPlugin({
                template: "./src/index.html",
                // bodyへscriptタグを入れる
                inject: "body",
                chunks: ["sub"],
            }),
            // ここまで
        ],
```

・sub.js

```javascript
console.log("this is a sub js file.");

jQuery(); // 追記

utils.log("sub");
```

モジュールの参照先まで HtmlWebpackPlugin は読み込まない。2021/1

```c++
yarn upgrade html-webpack-plugin@4

// nextだと最新版だが、webpack5からの対応
yarn upgrade html-webpack-plugin@next
```


[webpack のバージョンの違いと注意点](https://webpack.js.org/migrate/4/)
