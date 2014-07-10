/**
 * Wraps input function and provides method to work with this function in CPS manner
 * @param {Function} func
 */
Continuate = function (func) {
  if (!(this instanceof Continuate)) {
      return new Continuate(func);
  }
  this.func = func;
};

/**
 * Binds function to contenxt, partically applies function to arguments, provides results in callback
 * @param {?Object} context
 * @param {...*} args
 * @param {Function} callback
 */
Continuate.prototype.bind = function (context, args, callback) {
  /**
   * @param {...*} args function parameters with callback as last parameter
   */
  var func = function (args) {
    var result;
    callback = arguments[arguments.length - 1];
    try {
        //Note that 'this' is original function Continuate#func
        result = this.apply(context, Array.prototype.slice.call(arguments, 0, -1));
    } catch (err) {
        callback(err);
        return;
    }
    callback(null, result);
  }.bind(this.func);

  //Now lets partially apply function on input arguments. We need to use bind with an array arguments so we are doing
  //func.bind.apply to use bind with an array
  return func.bind.apply(func, [context].concat(Array.prototype.slice.call(arguments, 1)));
};

/**
 * Binds function to contenxt, calls function with provided arguments, provides results in callback
 * @param {?Object} context
 * @param {...*} args
 * @param {Function} callback
 */
Continuate.prototype.call = function (context, args, callback) {
  this.bind.apply(this, arguments)();
};

/**
 * Binds function to contenxt, applies function to provided array of arguments, provides results in callback which 
 * should be the last element in array
 * @param {?Object} context
 * @param {...*} args
 * @param {Function} callback
 */
Continuate.prototype.apply = function (context, args) {
  this.bind.apply(this, [context].concat(args))();
};

module.exports = Continuate;