const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, './src/pushupaws.js'),
    output: {
        path: __dirname,
        filename: 'index.js',
        library: 'Pushupaws',
        libraryTarget: 'umd'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    babelrc: false,
                    presets: ['env'],
                    plugins: [
                        'syntax-flow',
                        'transform-flow-strip-types',
                        ['transform-class-properties', { 'spec': true }],
                    ]
                }
            }
        }]
    },
    node: {
        fs: 'empty',
        tls: 'empty'
    }
};
