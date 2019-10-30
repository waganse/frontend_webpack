const path = require('path')
const glob = require('glob')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// const PurgecssPlugin = require('purgecss-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin')
const StyleLintPlugin = require('stylelint-webpack-plugin')
const {VueLoaderPlugin} = require('vue-loader')
const CopyWebpackPlugin = require('copy-webpack-plugin')
// const CriticalPlugin = require('webpack-plugin-critical').CriticalPlugin;

// Custom hash
const hash = Date.now();

// Entry points
let entries = {};
glob.sync("./src/js/**/[^_]*.js").map(function(file) {
  return entries[file.match(/src(\/js\/|\/)([a-zA-Z0-9_\/]*\/?[a-zA-Z0-9_]+)\.js/i)[2]] = file;
});

const webpackConfig = {
  entry: entries,
  output: {
    filename: 'js/[name]-bundle-'+ hash + '.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@JS': path.resolve(__dirname, 'src/js'),
      '@SCSS': path.resolve(__dirname, 'src/scss'),
      '@COMMON' : path.resolve(__dirname, '../common/src')
    },
    extensions: ['*', '.js', '.vue', '.json', 'scss']
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader'
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'eslint-loader',
            options: {
              configFile: '.eslintrc_es6'
            }
          }
          // {
          //   loader: "babel-loader"
          // },
        ]
      },
      {
        test: /\.ect$/,
        use: [
          // {
          //   loader: 'htmllint-loader',
          //   query: {
          //     config: '.htmllintrc',
          //     failOnError: true,
          //     failOnWarning: false,
          //   }
          // },
          {
            loader: 'html-loader',
            options: {
              // minimize: true
            }
          },
          {
            loader: 'webpack-ect-loader',
            options: {
              root: path.resolve(__dirname, 'src/ect'),
              gzip: true
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '/'
            }
          },
          // { loader: 'vue-style-loader' },
          { loader: 'css-loader' },
          { loader: 'postcss-loader' },
          {
            loader: 'clean-css-loader',
            options: {
              level: 2
            }
          },
          {
            loader: 'sass-loader',
            options: {
              includePaths: []
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 102400,
              outputPath: 'img/'
            }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              pngquant: {
                quality: '80'
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlReplaceWebpackPlugin([
      {
        pattern: /(<!--\s*|@@)(css|js):([\w-\/]+)(\s*-->)?/g,
        replacement: function(match, $1, type, file, $4, index, input) {
          const tpl = {
            css: '<link rel="stylesheet" href="/css/%s">',
            js: '<script src="/js/%s"></script>'
          };

          const url = file + '-bundle-' + hash + '.' + type;

          // $1==='@@' <--EQ--> $4===undefined
          return $4 == undefined ? url : tpl[type].replace('%s', url)
        }
      }
    ]),
    new MiniCssExtractPlugin({
      filename: 'css/[name]-bundle-' + hash + '.css',
      publicPath: '/'
    }),
    // new PurgecssPlugin({
    //   paths: glob.sync(path.resolve(__dirname, 'src/**/*'),  { nodir: true }),
    // }),
    // new StyleLintPlugin({
    //   configFile: '.stylelintrc'
    // }),
    new CopyWebpackPlugin(
      [
        {
          from: path.resolve(__dirname, 'src/img/*.svg'),
          to: 'img',
          flatten: true
        }
      ]
    ),
    // new CriticalPlugin({
    //   src: 'index.html',
    //   inline: true,
    //   minify: true,
    //   dest: 'index.html'
    // })
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          name: 'vendor',
          chunks: 'initial',
          enforce: true
        }
      }
    }
  }
};

// Multiple ect entries
glob.sync("./src/ect/**/[^_]*.ect").map(function(file) {
  let filename = file.match(/src(\/ect\/|\/)([a-zA-Z0-9_\/]*\/?[a-zA-Z0-9_]+)\.ect/i)[2];

  webpackConfig.plugins.unshift(
    new HTMLWebpackPlugin({
      filename: filename + '.html',
      template: file,
      publicPath: '/',
      inject: false
    })
  );
});

module.exports = webpackConfig;