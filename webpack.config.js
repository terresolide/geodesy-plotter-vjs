var path = require('path')
var webpack = require('webpack')
var PACKAGE = require('./package.json');
// var config = require('./config');
var buildVersion = PACKAGE.version;
var buildName = PACKAGE.name;
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
// var UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const TerserPlugin = require("terser-webpack-plugin");
const VueLoaderPlugin = require('vue-loader/lib/plugin')

// var preUrl = PACKAGE.preproduction.url + "/webcomponents/";
var prodUrl = PACKAGE.production.url + '/' + buildName + '@' + buildVersion +  '/dist/' ;
// var FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');


var pathsToClean = [
  'dist/*.*'
]

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: buildName+'.js'
  },
  ignoreWarnings: [
    {
      module: /\.vue/,
      message: /export 'default' \(imported as 'style0'\) was not found/,
    },
  ],
  module: {
    // parser: {
    //   'css/auto': {
    //     namedExports: false
    //   }
    // },
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
//        options: {
//          loaders:  {
//            i18n: '@kazupon/vue-i18n-loader',
//            scss: 'style!css!sass'
//          }
          // other vue-loader options go here
//        }
      },
       // NOUVELLE RÈGLE À AJOUTER ICI :
      {
        test: /\.vue$/,
        resourceQuery: /type=style/,
        sideEffects: true
      },
      {
        resourceQuery: /blockType=i18n/,
        type: 'javascript/auto',
        loader: '@intlify/vue-i18n-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              esModule: false
            },
          }
        ]
      },
      
//      {
//        test: /\.s[a|c]ss$/,
//        loader: 'style!css!sass'
//      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader' /*,
          options: {
            limit: 10000,
            name: 'assets/fonts/[name].[hash:7].[ext]'
          }*/
        }]
      },
      {
        test: /\.(png|jpeg|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'assets/img/[name].[hash:7].[ext]'
        }
      }
//      {
//        test: /\.(png|jpg|gif|svg)$/,
//        loader: 'file-loader'
 // remove options remove warning https://github.com/webpack/loader-utils/issues/56
 //       options: {
 //         name: '/assets/images/[name].[ext]?[hash]'
 //       }
 //     }
    ]
  },
  resolve: {
    extensions: ['.js', '.vue', '.json', '.jsx'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': path.resolve(__dirname, './src'),
    }
  },
  devServer: {
    // https: true,
    historyApiFallback: true,
   // noInfo: true,
    liveReload: true,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:8080",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  },
  performance: {
    hints: false
  },
  devtool: 'eval-source-map'
}

if (process.env.NODE_ENV === 'development') {
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"'
    }),
    new VueLoaderPlugin()
  ])
  module.exports.mode = 'development'
	module.exports.output.filename='build.js'
//	  module.exports.plugins = (module.exports.plugins || []).concat([
//
//	    new FriendlyErrorsWebpackPlugin()
//	  ])


}
if (process.env.NODE_ENV === 'production') {
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new VueLoaderPlugin()
  ])
  module.exports.mode = 'production'
  module.exports.devtool = 'source-map';
  module.exports.output.publicPath = prodUrl;
  module.exports.optimization =  {
        minimize: true,
        minimizer: [
            new TerserPlugin(),
        ]
    }
  var indexPath = path.resolve(__dirname, '/dist/index.html')
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
   
    new CleanWebpackPlugin({cleanAfterEveryBuildPatterns: ['dist']}),
//    new UglifyJsPlugin({
//        sourceMap: true,
//        uglifyOptions: {
//          compress: {
//            collapse_vars: false
//          }
//        }
//    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      options: {
        assetsSubDirectory: 'assets/'
      }
    }),
//    new HtmlWebpackPlugin({
//      filename: indexPath,
//      template: 'div-prod.html',
//      assets: prodUrl,
//      inject: false,
//      minify: {
//        removeComments: true,
//        collapseWhitespace: false,
//        removeAttributeQuotes: false
//        // more options:
//        // https://github.com/kangax/html-minifier#options-quick-reference
//      },
//      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
//      chunksSortMode: 'dependency'
//    }),
  ])
}

//if (process.env.NODE_ENV === 'preproduction') {
////  var indexPath = path.resolve(__dirname, '/webcomponents/index.html')
//  module.exports.plugins = (module.exports.plugins || []).concat([
//    new webpack.DefinePlugin({
//      'process.env': '"production"'
//    }),
//    new VueLoaderPlugin(),
//
//  ])
//    module.exports.mode = 'production'
//    module.exports.devtool = '#source-map';
//    module.exports.output.path =  path.resolve(__dirname, './webcomponents'),
//    module.exports.output.publicPath = preUrl;
//    module.exports.output.filename =   buildName+'.'+buildVersion+'.js'
//    //module.exports.output.publicPath= PACKAGE.url+ buildName +'/master/dist/';
//
//    // http://vue-loader.vuejs.org/en/workflow/production.html
//    module.exports.plugins = (module.exports.plugins || []).concat([
//    //  new CleanWebpackPlugin(["webcomponents/*.*"]),
//      new UglifyJsPlugin({
//          sourceMap: true
//        }),
//      new webpack.LoaderOptionsPlugin({
//        minimize: true,
//        options: {
//          assetsSubDirectory: 'assets/'
//        }
//      })
//    ])
//  }
