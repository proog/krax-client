'use strict';

let krax = require('./krax.js')
  , query = process.argv[2]
  , limit = parseInt(process.argv[3]) || 0;

krax.search(query, limit).then(results => {
  console.error('%s results', results.length);
  console.log(results);
});
