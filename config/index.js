
var filename = !process.env.NODE_ENV || process.env.NODE_ENV == 'development' ? 'development' : process.env.NODE_ENV;
var json = require('./' + filename + '.json');
module.exports = json;