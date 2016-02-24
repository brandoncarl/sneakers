
/**

  config-editor.js

  Helper functions to edit the sneakers.json file.

**/


//
//  Dependencies
//

var _ = require("lodash"),
    fs = require("fs"),
    path = require("path");


var editor = module.exports = {

  config: null,

  defaults: require("../server/defaults.js"),

  filename: path.join(process.cwd(), "sneakers.json"),


  /**

    Loads and caches the config file

  **/

  load: function() {

    if (editor.config) return editor.config;

    try {
      editor.config = JSON.parse(fs.readFileSync(editor.filename, "utf8"));
    } catch (err) {
      editor.config = {};
    }

  },


  /**

    Get a key from the config file.

    @param {String} key The key to lookup (supports dot-notation)
    @returns {*} The value of the key

  **/

  get: function(key) {
    return _.get(editor.load(), key);
  },


  /**

    Sets a key in the config file.

    @param {String} key The path of the property to set (supports dot-notation)
    @param {*} val The value to set

  **/

  set: function(key, val) {
    _.set(editor.load(), key, val);
  },


  /**

    Removes the property in the config.

    @param {String} key The path of the property to unset (supports dot-notation)

  **/

  unset: function(key) {
    _.unset(editor.load(), key);
  },


  /**

    Saves the config.

  **/

  save: function() {
    fs.writeFileSync(filename, JSON.stringify(editor.load(), null, 2), "utf8");
  }

};
