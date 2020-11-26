const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpack = require('webpack');

module.exports = {
    entry: {
        main: path.resolve(__dirname, './src/index.ts'),
        alerts: path.resolve(__dirname, './src/alerts/index.ts'),
    },
    mode: 'development',
    devtool: 'eval-source-map',
    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        compress: true,
        port: 443,
        historyApiFallback: true,
        noInfo: true,
    },
    performance: {
        hints: false,
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {appendTsSuffixTo: [/\.vue$/]},
            },
            {
                test: /\.html$/i,
                loader: 'file-loader',
                exclude: /node_modules/,
                options: {
                    name: '[name].[ext]',
                },
            },
            {
                test: /\.css$/,
                use: ['vue-style-loader', 'css-loader'],
            },
            {
                test: /\.scss$/i,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].css',
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                ],
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    esModule: true,
                },
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline-loader',
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            API_SERVER: JSON.stringify(process.env.API_SERVER || 'https://api.localhost'), // Api server; In production, this would be something like api.binaryfissiongames.com (maybe)
            WEBSOCKET_SERVER: JSON.stringify(process.env.WEBSOCKET_SERVER || 'wss://api.localhost'), // Websocket server; likely the same as API_SERVER.
        }),
        new VueLoaderPlugin(),
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.html', '.vue', '.scss'],
        alias: {
            vue$: 'vue/dist/vue.esm.js',
        },
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
};
