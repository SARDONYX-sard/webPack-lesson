const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const { ProvidePlugin } = require("webpack");
//outputFileはdevまたはprodからわたってきた変数を受け取る
module.exports = ({ outputFile, assetFile }) => ({
    // ・webpack5系 では、noneを指定なら、devtool自体を指定しない必要あり
    // devtool: "none",

    // ・バンドルの開始ファイルを指定。デフォではsrc/index.js
    // entry: "./src/index.js",

    // ・entryに依存関係がなければ、配列指定が可能（1つに統合）
    entry: { app: "./src/js/app.js", sub: "./src/js/sub.js" },

    // ・プロパティで渡す ⇒ ファイルが分割される
    // シングルページなら普段不使用。複数ならページごとによく使われる。
    // entry: {
    //     index: "./src/index.js",
    //     sub: "./src/sub.js",
    // },

    // ・出力先指定したい場合。require(path)
    output: {
        path: path.resolve(__dirname, "public"),
        filename: `${outputFile}.js`,
        // 分割されたファイル名を変えられる(splitChunks使用時有用)
        chunkFilename: `${outputFile}.js`,
        // ・変数も可能。[name] [id] [hash]
        // entry: {index: "./src/index.js"}なら[name]には「index」が入る
        // filename: "[name].bundle.js",
    },

    // sass等のモジュール設定
    module: {
        rules: [
            {
                test: /\.js$/,
                // ローダーで検査しない例外とするフォルダを指定
                exclude: /node-modules/,
                use: "babel-loader",
            },
            {
                // ・対象となる拡張子ファイルを正規表現で記述
                // scssで終わるファイル。「\」でエスケープさせるのを忘れずに。
                test: /\.scss$/,

                // 注：複数のローダーは下から順に実行される
                use: [
                    MiniCssExtractPlugin.loader,
                    // 3.js内にバンドルされたcssをhtmlへ出力させる
                    // styleタグにcss情報をhtmlへ。
                    // "style-loader",
                    // 2.複数のcssを「jsファイル」にバンドル
                    // cssをwebpack内でバンドルする際に使用
                    "css-loader",
                    "postcss-loader",
                    // 1.sass ⇒ cssへ変換(コンパイル)
                    // 注意！使うにはエントリにインポートさせる必要あり
                    // 例：index.js内部でimport "./app.scss";
                    "sass-loader",
                ],
            },
            // file-loaderの設定
            {
                //jpe?gは[e]が0か1文字。|は「または」。
                test: /\.(jpe?g|gif|png|ico|svg|woff2?|tff|eot)$/,
                // 複数なら配列[]のなかに{}
                // use: [
                //     {
                //         // optionsを使うなら loader:を使う
                //         loader: "file-loader",
                //         // name, outputPath, publicPathは必須
                //         options: {
                //             //[ext]はextension
                //             name: "[name].[ext]",
                //             outputPath: "images",
                //             // サーバー上のパス情報
                //             publicPath: "images",
                //         },
                //     },
                // ],

                // 単体ならuseすらいらずに書ける
                loader: "file-loader",
                // name, outputPath, publicPathは必須
                options: {
                    //[ext]はextension(拡張子) [contenthash].[ext]なら英数字few46494.pngのようになる。
                    name: `${assetFile}.[ext]`, // 分割。商用は[contenthash].[ext]に。
                    outputPath: "images",
                    // サーバー上のパス情報
                    // 画像が別サーバーにある場合にurlを指定できる。
                    publicPath: "images",
                },
            },
            {
                // html-loader
                test: /\.html$/,
                use: "html-loader",
            },
        ],
    },
    plugins: [
        // eslint-webpack-plugin
        new ESLintPlugin({
            overrideConfigFile: path.resolve(__dirname, ".eslintrc"),
        }),
        new MiniCssExtractPlugin({
            filename: `${outputFile}.css`,
        }),
        // 複数のファイルでインポートするモジュールを
        // ここで登録して、毎回の同一インポートを防ぐ
        new ProvidePlugin({
            // 関数名: "使用したいモジュール名"
            jQuery: "jquery",
            $: "jquery",
            // ES6の記法でProvideを使いたい場合、
            // 配列で第2引数にdefault(今回はexport defaultのため)
            utils: [path.resolve(__dirname, "src/js/utils"), "default"],
        }),
    ],
    // optimization = 最適化
    optimization: {
        splitChunks: {
            // chunks: "async"の場合ダイナミックインポートの文だけ分割される
            // ダイナミック（非同期）インポート例 : import("./src/app.js");
            // allの場合ダイナミック関係なくどれでも分割
            chunks: "all",
            // 最低限分割されるサイズ。30kB
            minSize: 0,
            cacheGroups: {
                // 例：vendorsというjsファイル名で、node_modules群をまとめたい。
                defaultVendors: {
                    // vendorsという名前でファイルが作成される
                    name: "vendors",
                    //  [\\/]とは、\または/という意味。ディレクトリを表す。
                    test: /[\\/]node_modules[\\/]/,
                    // 優先度。高ければそれが優先されてバンドルされる
                    priority: -10,
                    reuseExistingChunk: true,
                },
                utils: {
                    name: "utils",
                    test: /src[\\/]/,
                    // chunksは個別に設定でき、splitChunks内でのchunks記述はデフォルト設定として残せる。
                    // 非同期インポートでもchunksがallなら動機インポートされてしまうので注意
                    chunks: "initial",
                },
                default: false,
            },
        },
    },
    resolve: {
        alias: {
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
});
