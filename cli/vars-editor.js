/**

  locals-editor.js

**/


//
//  Dependencies
//

var chalk = require("chalk"),
    utils = require("./cli-utils");



//
//  Exports
//

var Vars = module.exports = {

  addEnv: function(key, val) {
    Vars.add("env", key.toUpperCase(), val);
  },

  addFavicon: function(val) {
    Vars.add(null, "favicon", val);
  },

  addLocal: function(key, val) {

    // Unix won't process arguments with $ in them. Provide a warning if this may have happened
    if ("" === val) {
      var msg =  "If you're trying to add a local variable linked to environment, make sure to escape it: ";
      console.log("\n" + chalk.magenta("   Warning!"), msg);
      console.log("            e.g. " + chalk.yellow("shipp local:add siteName \"\$SITE_NAME\""));
    }

    Vars.add("locals", key, val);
  },

  listEnvs: function() {
    Vars.list("env", "Environment Variables");
  },

  listFavicon: function() {
    Vars.list("favicon", "Favicon");
  },

  listLocals: function() {
    Vars.list("locals", "Locals");
  },

  removeEnv: function(key, val) {
    Vars.remove("env", key.toUpperCase());
  },

  removeFavicon: function() {
    Vars.remove(null, "favicon");
  },

  removeLocal: function(key, val) {
    Vars.remove("locals", key);
  },


  /**

    Outputs a list of local variables.

    @param key The key to lookup
    @param title The title to output

  **/

  list: function(key, title) {

    var editor = require("./config-editor"),
        val    = editor.get(key) || {},
        str;

    console.log("");
    console.log(chalk.cyan(" " + title + ":"));
    console.log("");

    if (!Object.keys(val).length)
      console.log("   There are no " + key + " variables in your project");
    else {
      if ("string" === typeof val)
        str = "   Your " + chalk.yellow(key) + " is set to " + chalk.yellow(val);
      else
        str = JSON.stringify(val, null, 2).split("\n").map(function(line) { return "   " + line; }).join("\n");
      console.log(str);
    }

    console.log("");

  },


  /**

    Adds a local variable and acknolwedges with confirmation.

    @param {String} parent Which variable to change (e.g. locals, env)
    @param {String} key The key to lookup (supports dot-notation)
    @param {*} val The value to assign

  **/

  add: function(parent, key, val) {

    var editor = require("./config-editor"),
        ref    = (parent) ? parent + "." + key : key;

    console.log("");

    // Perform type casting
    if (val === "false")
      val = false;
    else if (val === "true")
      val = true;
    else if (/^\-?([0-9]+\.?[0-9]*|\.[0-9]*)$/.test(val))
      val = parseFloat(val);

    editor.set(ref, val);
    editor.save();

    parent = (parent) ? " " + parent : "";
    console.log("   " + chalk.cyan("Added:") + parent + " variable " + chalk.yellow(key) + " now contains " + chalk.yellow(val));
    console.log("");

  },


  /**

    Removes a local variable and acknowledges with confirmation.

    @param {String} parent Which variable to change (e.g. locals, env)
    @param {String} key The key to remove (supports dot-notation)

  **/

  remove: function(parent, key) {

    var editor = require("./config-editor"),
        ref    = (parent) ? parent + "." + key : key;
        prev   = editor.get(ref);

    console.log("");

    editor.unset(ref);
    editor.save();

    parent = (parent) ? " " + parent : "";
    if ("undefined" === typeof prev)
      console.log("   " + chalk.red("No Change:") + " there was no" + parent + " variable called " + chalk.yellow(key));
    else if ("object" === typeof prev)
      console.log("   " + chalk.cyan("Removed:") + parent + " variable " + chalk.yellow(key) + " has been unset");
    else
      console.log("   " + chalk.cyan("Removed:") + parent + " variable " + chalk.yellow(key) + " has been unset, previously " + chalk.yellow(prev));
    console.log("");

  }

};
