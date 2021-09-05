const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-react");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const projectName = "navbar";

function isProd(argv) {
  const { mode } = argv;
  return mode === "production";
}

module.exports = (webpackConfigEnv, argv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: "test",
    projectName,
    webpackConfigEnv,
    argv,
  });

  return merge(defaultConfig, {
    // modify the webpack config however you'd like to by adding to this object
    optimization: {
      splitChunks: {
        cacheGroups: {
          styles: {
            name: projectName, // 指定文件名
            type: "css/mini-extract",
            // For webpack@4
            // test: /\.css$/,
            chunks: "all",
            enforce: true,
          },
        },
      },
    },
    module: {
      rules: [
        // SCSS ALL EXCEPT MODULES
        {
          test: /\.s?css$/,
          exclude: /\.module\.scss$/,
          use: [
            isProd(argv) ? MiniCssExtractPlugin.loader : "style-loader",
            {
              loader: "css-loader",
              options: {
                importLoaders: 1,
                modules: {
                  mode: "icss",
                },
              },
            },
            "fast-sass-loader",
          ],
        },
        // --------
        // SCSS MODULES
        {
          test: /\.module\.scss$/,
          use: [
            isProd(argv) ? MiniCssExtractPlugin.loader : "style-loader",
            {
              loader: "css-loader",
              options: {
                importLoaders: 1,
                modules: {
                  mode: "local",
                  localIdentName: `${projectName}-[path][name]__[local]--[hash:base64:5]`,
                  localIdentContext: path.resolve(__dirname, "src"),
                },
              },
            },
            "fast-sass-loader",
          ],
        },
        // --------
      ],
    },
    plugins: [].concat(isProd(argv) ? [new MiniCssExtractPlugin()] : []),
  });
};
