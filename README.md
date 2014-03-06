# Async Walker

This is just a basic async walker that allows you to perform manipulation (read: filter, map) during a file walk. It's fully async and returns a [Q promise](https://github.com/kriskowal/q/).

***Note:***
If you're looking for something to do glob matching, this isn't the implementation you want. Check out [node-glob](https://github.com/isaacs/node-glob), which is a very comprehensive and solid implementation.

## Usage


### Basic usage
**Find all files:** Passing a path to `async-walker` results in a promise w/ an array of files qualified to the base path.
```js
var walker = require('async-walker');
walker('./path/').then(function(files) {
  console.log(files); // => Files array: ['./path/to/file.js']
});
```

**With callback:** The callback approach passes an object for each item that contains the `path` and two `fs.stat` properties: `isDirectory` and `isFile`. These are boolean values (not functions).

You're required to return a statObject or something falsey. Returning falsey values means the object's path will not be included in the result or be walked further).

*Note: This is a synchronous operation. It could be made async later.*
```js
walker('./path', function(statObject) {
  var filePath = statObject.path;

  if (statObject.isFile && filePath.substr(-3) == '.js') {
    var file = fs.readFile(filePath, function(err, contents) {
      // Do something w/ javascript file contents
    });
  }

  return statObject;
});
```

### Methods

#### `Walker.filter(path<string>, callback<fn>, [matchDirectories<boolean: false>])`
Takes a `path` to walk, and a callback, the boolean results of which will determine whether the item will be included. Optionally, a `matchDirectories` param can be added to specify whether to apply the filter callback to directories (defaults to `false`).

```js
walker.filter('./node_modules', function(item) {
  return /readme\.{2,3}/i.test(item);
}).then(function(readmes) {
  // => Do something w/ all readme files in `node_modules`
});
```

#### `Walker.map(path<string>, callback<fn>)`
Applies a the result of a map function to each file. This does not deal w/ directories at all.  I'm not sure why you'd use this, but I added to test the implementation.

```js
walker.map('./path', function(item) {
  return item.toUpperCase();
}).then(function(files) {
  console.log(files); // => [./PATH/TO/FILE.JS...]
});
```
