/**

  data-store.js

  Abstracts querying of lowdb.

**/


//
//  Dependencies
//

var fs    = require("fs"),
    low   = require("lowdb"),
    Utils = require("./utils"),
    _     = require("lodash/core"),
    pair  = require("lodash/fromPairs");


// Database instance
Database = extendDatabase(low());


/**

  Gives lowdb additional functionality

**/

function extendDatabase(db) {

  // Gets a database key
  db.get = function(key) {
    var val = db.object[key];
    return (Array.isArray(val)) ? db(key) : _(val);
  };

  // Runs a database query
  db.query = function(query, context, next) {
    query.run(db.get(query.query.table).value(), context, next);
  };

  // Executes multiple queries and combines into a single object
  db.queries = function(queries, context, next) {

    var results = {},
        remaining;

    // Ensure that queries is an array
    queries = queries || [];
    if (!Array.isArray(queries)) queries = [queries];

    remaining = queries.length;
    if (!remaining) return next(null, {});

    _.each(queries, function(query) {
      db.query(query.query, context, function(err, result) {

        if ("undefined" !== typeof query.idx) {
          if (!result.length) return next(new Error("Result not found"), null);
          result = result[query.idx];
        }

        results = _.extend(results, (query.key) ? pair([[query.key, result]]) : result);
        if (--remaining === 0) next(err, results);

      });
    });

  };

  return db;

}


module.exports = function(options) {

  var val;

  // Default to "/" route
  if ("string" === typeof options)
    options = { path : options, url : "/" };

  Utils.mapFiles(options.path).forEach(function(file) {

    var json = JSON.parse(fs.readFileSync(file.path, "utf8")),
        slug = Utils.makeRoutes(options.url, { folder : file.folder, name : "" })[0],
        key;

    // If array, use file name as key. Otherwise, parse keys
    if (Array.isArray(json)) {

      key = (slug + "/" + file.name).replace(/\/+/g, "/").replace(/^\/+/, "");
      Database.object[key] = json;

    } else {

      // Create path-like keys using directories (and remove leading "/")
      for (key in json) {

        // Remove leading "/" and make db key-friendly
        val = json[key];
        key = (slug + "/" + key).replace(/\/+/g, "/").replace(/^\/+/, "");
        Database.object[key] = val;

      }
    }

  });

  return Database;

};
