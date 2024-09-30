const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { version } = require('./package.json');

module.exports = {
    mode: 'production',
    entry: './src/App.js',

    output: {
        path: path.resolve(__dirname, 'dist/chrome'),
        filename: 'popup.[contenthash].js',
        clean: true
    },
  
    plugins: [

        new HtmlWebpackPlugin({
            template: './src/popup.html',
            filename: 'popup.html',
            inject: 'body'
        }),

        new MiniCssExtractPlugin({
            filename: 'popup.[contenthash].css',
        }),

        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'src/manifest.json',
                    to: 'manifest.json', transform: (content) => {
                        const manifest = JSON.parse(content);
                        manifest.version = version;
                        return JSON.stringify(manifest, null, 2);
                    }
                },
                { from: 'src/assets', to: 'assets' },
            ],
        }),

    ],

    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
        ],
    },

    optimization: {
        minimize: true,
        minimizer: [
          `...`,
          new CssMinimizerPlugin(),
        ],
    },

};