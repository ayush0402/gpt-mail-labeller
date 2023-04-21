"use strict";

const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    content: "./src/content.js",
    popup: "./src/popup.js",
    pageWorld: "@inboxsdk/core/pageWorld.js",
    background: "@inboxsdk/core/background.js",
  },
  module: {
    rules: [
      {
        test: /\.m?jsx?$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: "static" }],
    }),
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ["popup"],
      template: "./src/popup.html",
      filename: "popup.html",
    }),
  ],
};
