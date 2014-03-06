var walker = require('./src/walker');
var colors = require('colors');

walker.map('./node_modules', function(item) {
  return item.toUpperCase();
}).then(function(items) {
  console.log("Results from map:\n".green, items);
});

walker.filter('./node_modules', function(item){
  return (/\.txt$/gi).test(item);
}).then(function(items) {
  console.log("Results from filter:\n".green, items);
});

walker.filter('./node_modules', function(item){
  return (/\.txt$/gi).test(item);
}, true).then(function(items) {
  console.log("Results from filter:\n".green, items);
});