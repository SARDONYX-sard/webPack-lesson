const HtmlWebpackPlugin = require("html-webpack-plugin");
const { merge } = require("webpack-merge");
const commonConf = require("./webpack.common");
// commonファイルに渡す
const outputFile = "[name]";
const assetFile = "[name]";

module.exports = () =>
    //commonConfに開発用ファイル名を引数として渡す
    merge(commonConf({ outputFile, assetFile }), {
        mode: "development", //--mode developmentと同等   //分割

        // ・webpack5系 では、noneを指定なら、devtool自体を指定しない必要あり
        devtool: "source-map",
        devServer: {
            // 自動で開く
            open: true,
            contentBase: "./public",
            // 監視して差分があった場合リロードしてくれる。
            watchOptions: {
                // node_modulesが変更されても再読み込みしないよう設定。
                ignored: /node_modules/,
            },
            proxy: {
                "/api": "http://localhost:3000",
            },
        },
        plugins: [
            // scriptタグをhtmlへ入れるときの設定
            new HtmlWebpackPlugin({
                // デフォルトファイル名がindex.htmlのためこちらに名前設定は不要。
                template: "./src/index.html",
                inject: "body",
                // entryで { app: "./src/js/app.js", sub: "./src/js/sub.js" }
                // から、appを指定できる。
                chunks: ["app"],
            }),
            // 複数のhtmlならファイル名が必要
            new HtmlWebpackPlugin({
                template: "./src/other.html",
                // bodyへscriptタグを入れる
                inject: "body",
                chunks: ["sub"],
            }),
        ],
    });
