/**
 * Escapes a string that will be wrapped in double quotes and passed to a
 * command executed by child_process.exec(). Only \ and " characters are
 * escaped.
 * @param {string} input - The string to escape.
 * @returns {string} An escaped version of input.
 */
module.exports = function(input) {

  return input.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

};