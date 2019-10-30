const util = require('util');

// Can declare multi sprites with array
module.exports = {
  src: 'src/img/_sprites/*.{png,gif,jpg}',
  destImage: 'src/img/sprite.png',
  destCSS: 'src/scss/utils/_sprite.scss',
  imgPath: '../img/sprite.png'
};