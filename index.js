/**
 * Returns function that provides results of fun in continuation-passing style
 * @param fun
 */
module.exports = function (fun) {
  /*
   * @param {...*} args
   * @param {Function} callback
   */
  return function () {
    var args = Array.prototype.slice.call(arguments, 0, -1);
    var callback = arguments[arguments.length - 1];
    var result;
    try {
      result = fun.apply(this, args);
    } catch (err) {
      callback(err);
      return;
    }
    callback(null, result);
  }
};