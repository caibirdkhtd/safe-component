'use strict';

var fs = require('fs');
var path = require('path');
var outputPath = path.resolve(__dirname, `../lib/index.js`);
var content = fs.readFileSync(outputPath, 'utf8');

content = `if (typeof window === 'undefined') {
  window = undefined;
}
` + content

fs.writeFileSync(outputPath, content);
