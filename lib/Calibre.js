const process = require('child_process');
const escape = require('js-string-escape');

/**
 * Wrapper for Calibre's command-line tools. Each instance is set to a specific
 * library path. Uses promises for asynchronous calls that expect a response.
 * @class
 */
class Calibre {

  /**
   * Initialize the instance by setting the Calibre library path.
   * @param {string} [library] - Full path to Calibre library. Only needed if
   * the commands this instance will run use the --library-path option.
   * @param {boolean} [log=false] - If true, the command string that is run by
   * Node's child_process.exec() is logged to console before running.
   */
  constructor(library = '', log = false) {
    this.library = library;
    this.log = log;
  }

  /**
   * Runs a command on one of Calibre's binaries.
   * @param {string} command - The name of the bin and command to run. For
   * example 'calibredb add' or 'ebook-convert'.
   * @param {string[]} [args] - An array of argument strings that the
   * command will accept. All arguments are wrapped in "" and escaped.
   * @param {object} [options] - A key:value object containing options that the
   * command will accept. If an option does not take a value, the key's value
   * should be an empty string. All values are wrapped in "" and escaped.
   * @returns {Promise} A promise that is rejected if the callback of Node's
   * child_process.exec() has a value for error or stderr and resolves to the
   * callback's stdout if no error occured.
   */
  run(command = '', args = [], options = {}) {
    let execString = command;

    // Add default options to object if for calibredb
    if (command.indexOf('calibredb') == 0) {
      options = Object.assign({
        'library-path': this.library,
        'dont-notify-gui': ''
      }, options);
    }

    // Build options string from object
    execString += ' ' +
    Object.entries(options).map(option => {
      let str = '';

      // Convert s to -s, search to --search
      if (option[0].length == 1)
        str = '-' + option[0];
      else
        str = '--' + option[0];
      
      // Add option's value
      if (option[1] != '')
        str += ` "${escape(option[1])}"`;
      
      return str;
    }).join(' ');

    // Build arguments string from array
    execString += ' ' + args.map(arg => `"${escape(arg)}"`).join(' ');

    if (this.log) console.log('~~CALIBRE:', execString);

    return new Promise((resolve, reject) => {
      process.exec(execString, (err, stdout, stderr) => {
        if (err || stderr)
          reject(err || stderr);
        else
          resolve(stdout);
      });
    });
  }

}

module.exports = Calibre;