//  模块外面不用包一层define，dev和build时工具会自动加上，遵循CommonJS规范，像node一样写就可以了，如下

'use strict';
require('./index.css');
var tmpl = require('./m-banner.tmpl');
require('fecomponent/mobi-jswebview/0.0.17');



