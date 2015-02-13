/**
 * Returns function that provides results of fun in continuation-passing style
 * @param fun
 * @returns {Function}
 */
function cps(fun) {
  /**
   * @param {...*} args
   * @param {Function} callback
   */
  return function () {
    var args = Array.prototype.slice.call(arguments);
    var callback = args.pop();
    var result;
    try {
      result = fun.apply(this, args);
    } catch (err) {
      callback(err);
      return;
    }
    callback(null, result);
  }
}

module.exports = cps;
