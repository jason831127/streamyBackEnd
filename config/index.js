
let filename = process.env.PHASE || 'local' ;
let json = require('./' + filename + '.json');
module.exports = json;