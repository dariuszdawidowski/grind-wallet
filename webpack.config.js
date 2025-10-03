const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { version } = require('./package.json');

module.exports = (env = {}, argv = {}) => {
    const mode = argv.mode || 'production';
    const isDev = mode === 'development';

    return {
        mode,
        entry: {
            popup: './src/App.js',
            content: './src/chrome-extension/content/Content.js',
            inject: './src/chrome-extension/api/Inject.js',
            background: './src/chrome-extension/background/Background.js',
        },
        target: 'web',

        output: {
            path: path.resolve(__dirname, 'dist/chrome'),
            filename: (pathData) => {
                if (!isDev && pathData.chunk.name === 'popup') {
                    return 'popup.[contenthash].js';
                }
                return `${pathData.chunk.name}.js`;
            },
            clean: true
        },
    
        resolve: {
            fallback: {
                'assert': require.resolve('assert/'),
                'buffer': require.resolve('buffer/'),
                'crypto': require.resolve('crypto-browserify'),
                'process': require.resolve('process/browser'),
                'stream': require.resolve('stream-browserify'),
                'vm': require.resolve('vm-browserify'),
            },
        },

        devtool: isDev ? 'source-map' : false,

        plugins: [

            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
                process: 'process/browser',
            }),

            new HtmlWebpackPlugin({
                template: './src/popup.html',
                filename: 'popup.html',
                inject: 'body',
                chunks: ['popup'],
            }),

            new MiniCssExtractPlugin({
                filename: isDev ? 'popup.css' : 'popup.[contenthash].css',
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
                    {
                        from: 'assets',
                        to: 'assets',
                        globOptions: {
                            ignore: [
                                '**/card-ICP-01.svg',
                            ]
                        }
                    },
                    {
                        from: 'src/libs',
                        to: 'libs',
                    },
                ],
            }),

            new webpack.DefinePlugin({
                'process.env.TEST_MODE': JSON.stringify(process.env.TEST_MODE || '')
            })

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
            minimize: !isDev,
            splitChunks: false,
            runtimeChunk: false,
            minimizer: isDev ? [] : [
                new TerserPlugin({
                    terserOptions: {
                        ecma: 2022,
                        compress: false,
                        mangle: true,
                        output: {
                            comments: false,
                        },
                    },
                    parallel: true,
                }),
                new CssMinimizerPlugin(),
            ],
        },

    };
};
