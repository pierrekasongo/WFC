var path = require('path');

var HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

const config = {

    entry: "./app/App.jsx",

    output: {

        filename: "app.js",

        path: path.join(__dirname, "public")
    },
    resolve: {

        extensions: [".js", ".jsx", ".json"]
    },
    module: {

        rules: [

            { test: /\.jsx?$/, loader: ["babel-loader"] },
            { test: /\.css$/, loader: "style-loader!css-loader" },
            /*{
                test: /\.css$/,
                include: /node_modules/,
                loaders: ['style-loader', 'css-loader',],
            },*/
            {
                test: /\.scss$/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    "css-loader", // translates CSS into CommonJS
                    "sass-loader" // compiles Sass to CSS, using Node Sass by default
                ]
            }           
        ]
    }, 
};
module.exports = {
  plugins: [
    new HardSourceWebpackPlugin()
  ]
};
module.exports = config;