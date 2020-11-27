const devConfig = require('./webpack.config.js');

let productionConfig = Object.assign(
    {
        mode: 'production',
        devtool: false,
        performance: {
            hints: 'warning',
        },
        devServer: undefined,
        optimization: {
            minimize: true,
        },
    },
    devConfig
);

module.exports = productionConfig;
