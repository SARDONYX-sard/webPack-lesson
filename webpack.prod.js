const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { merge } = require("webpack-merge");
const commonConf = require("./webpack.common");
// commonファイルに渡す
const outputFile = "[name].[chunkhash]";
const assetFile = "[name].[contenthash]";

module.exports = () =>
    merge(commonConf({ outputFile, assetFile }), {
        mode: "production",

        // ・webpack5系 では、noneを指定なら、devtool自体を指定しない必要あり
        plugins: [
            new HtmlWebpackPlugin({
                template: "./src/index.html",
                inject: "body", //分割
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
    });
