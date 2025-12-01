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
    const browser = env.browser || 'chrome';

    const createConfig = (targetBrowser) => {
        const isFirefox = targetBrowser === 'firefox';
        const manifestFile = isFirefox ? 'src/manifest.firefox.json' : 'src/manifest.json';
        const outputPath = path.resolve(__dirname, `dist/${targetBrowser}`);

        return {
            name: targetBrowser,
            mode,
            entry: './src/extension/popup/popup.js',
            target: 'web',

            output: {
                path: outputPath,
                filename: isDev ? 'popup.js' : 'popup.[contenthash].js',
                clean: true
            },
        
            resolve: {
                fallback: {
                    'assert': require.resolve('assert/'),
                    'buffer': require.resolve('buffer/'),
                    'crypto': require.resolve('crypto-browserify'),
                    'process': require.resolve('process/browser'),
                    'stream': require.resolve('stream-browserify'),
                    'vm': false,
                },
            },

            devtool: isDev ? 'source-map' : false,

            plugins: [

                new webpack.ProvidePlugin({
                    Buffer: ['buffer', 'Buffer'],
                    process: 'process/browser',
                }),

                new HtmlWebpackPlugin({
                    template: './src/extension/popup/popup.html',
                    filename: 'popup.html',
                    inject: 'body'
                }),

                new MiniCssExtractPlugin({
                    filename: isDev ? 'popup.css' : 'popup.[contenthash].css',
                }),

                new CopyWebpackPlugin({
                    patterns: [
                        {
                            from: manifestFile,
                            to: 'manifest.json', transform: (content) => {
                                const manifest = JSON.parse(content);
                                manifest.version = version;
                                return JSON.stringify(manifest, null, 2);
                            }
                        },
                        {
                            from: 'assets',
                            to: 'assets',
                            noErrorOnMissing: true,
                            globOptions: {
                                ignore: [
                                    '**/card-ICP-01.svg',
                                    '**/.git/**',
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
                    'process.env.TEST_MODE': JSON.stringify(process.env.TEST_MODE || ''),
                    'process.env.DEV_MODE': JSON.stringify(process.env.DEV_MODE || ''),
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

    // If browser is 'all', return configs for both browsers
    if (browser === 'all') {
        return [createConfig('chrome'), createConfig('firefox')];
    }

    // Otherwise, return config for the specified browser
    return createConfig(browser);
};
