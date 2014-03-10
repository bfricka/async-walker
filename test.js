var walker = require('./src/walker');
var chalk = require('chalk');

walker.map('./node_modules', function(item) {
  return item.toUpperCase();
}).then(function(items) {
  console.log(chalk.green("Results from map:\n"), items);
});

walker.filter('./node_modules', function(item){
  return (/\.txt$/gi).test(item);
}).then(function(items) {
  console.log(chalk.green("Results from filter:\n"), items);
});

walker.filter('./node_modules', function(item){
  return (/\.txt$/gi).test(item);
}, true).then(function(items) {
  console.log(chalk.green("Results from filter:\n"), items);
});

walker('./node_modules', {
  maxDepth: 1, directoryMode: true
}).then(function(folders) {
  console.log(chalk.green("Directories:\n"), folders);
});