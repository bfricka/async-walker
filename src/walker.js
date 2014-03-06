var _ = require('lodash');
var q = require('q');
var fs = require('fs');
var path = require('path');
var colors = require('colors');

function asyncWalker(dir, callback) {
  var max = 2000;

  if (!this instanceof asyncWalker) {
    return new asyncWalker(dir, callback);
  }

  /**
   * Main asyncEntry
   * @param  {string} dir qualified directory to search
   * @return {object}     Promise
   */
  function walkAsync(dir) {
    var deferred = q.defer();

    readdir(dir)
      .then(statItems)
      .then(getFiles)
      .then(function(a) {
        deferred.resolve(a);
      }, function(b) {
        deferred.reject("Error " + b);
      });

    return deferred.promise;
  }

  /**
   * Async readdir that makes sure iterations doesn't get out of hand
   * maps directory contents to the qualified base, and returns
   * a promise intead of using callback style
   * @param  {string} dir Directory to read
   * @return {object}     fs.readdir wrapped in a promise
   */
  function readdir(dir) {
    if (max <= 0) {
      console.error('Too much directory reading!'.red);
      process.abort();
    }

    max--;

    return q.nfapply(fs.readdir, [dir])
      .then(function(list) {
        return mapPaths(dir, list);
      });
  }

  /**
   * Gets the fs.stat object from each item in the list and
   * sends back an object w/ the relevant values set
   * @param  {array} list List of paths to get fs.stat info for
   * @return {object}     Promise that resolves to the array of normalized
   * objects when all fs.stat promises resolve
   */
  function statItems(list) {
    var statPromises = [];

    _.forEach(list, function(item) {
      if (!item) return;

      var qStatPromise = q.nfapply(fs.stat, [item]).then(function(stat) {
        var itemStat = {
          path: item,
          isFile: stat.isFile(),
          isDirectory: stat.isDirectory()
        };

        if (callback) {
          itemStat = callback(itemStat);
          // For filter
          if (!itemStat) return;
        }

        return itemStat;
      }, function(err) {
        if (err) console.warn(err.message.orange);
      });

      statPromises.push(qStatPromise);
    });

    return q.all(statPromises);
  }

  /**
   * Takes in a stat list and collects the files, while creating new
   * promises on any directories. When all promises resolve down the chain
   * this eventually has the list of all files.
   * @param  {array} list - List of stat objects
   * @return {object}     - q.all promise that resolves w/ the full
   * list of files when all promises have been resolved
   */
  function getFiles(list) {
    var files = [];
    var promises = [];

    _.forEach(list, function(item) {
      if (!item) return;

      if (item.isDirectory) {
        promises.push(walkAsync(item.path));
      } else if (item.isFile) {
        files.push(item.path);
      }
    });

    var allPromises = q.all(promises).then(function(list) {
      return _.flatten(files.concat(list));
    });

    return allPromises;
  }

  /**
   * Simply takes a list of items and joins the provided base to each item.
   * @param  {string} base - The base path to use
   * @param  {array} list - List of items to use
   * @return {array}      - Mapped list of items
   */
  function mapPaths(base, list) {
    return _.map(list, function(item) {
      return path.join(base, item);
    });
  }

  return walkAsync(dir);
}

(function(aw) {
  function _createFilterFn(callback, matchDirectories) {
    return function(itemStat) {
      var toAdd = (itemStat.isDirectory && !matchDirectories) ? true : !!callback(itemStat.path);
      return toAdd ? itemStat : void 0;
    };
  }

  function _createMapFn(callback) {
    return function(itemStat) {
      if (itemStat.isDirectory) return itemStat;
      itemStat.path = callback(itemStat.path);
      return itemStat;
    };
  }

  _.extend(aw, {
    filter: function(dir, callback, matchDirectories) {
      var filterFn = _createFilterFn(callback, matchDirectories);
      return aw(dir, filterFn);
    },
    map: function(dir, callback) {
      var mapFn = _createMapFn(callback);
      return aw(dir, mapFn);
    }
  });
}(asyncWalker));

module.exports = asyncWalker;