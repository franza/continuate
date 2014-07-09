continuate
==========

A wrapper to convert regular functions to continuation-passing style.

Description
-----------

To avoid callback hell you usually work with modules like `async` and its methods. Assume that you have a pretty complex function built upon `async#auto`. Here we read two data sources and pass data to data-handlers. If data-handlers are pretty complex we need to wrap them in `try/catch`:

```javascript
var async = require('async');

function handleData1(dbData) {
  // very complex logic to rebuild dbData
}

function handleData2(webServiceData) {
  // very complex logic to rebuild webServiceData
}

async.auto({
  'dataSource1': [function (callback) {
    readDatabase(callback);
  }],
  'dataSource2': [function (callback) {
    getDataFromWebService(callback);
  }],
  'actionsWithData1': ['dataSource1', function (callback, results) {
    try {
      var data = handleData1(results.dataSource1);
    } catch (err) {
      return callback(err);
    }
    callback(null, data);
  }],
  'actionsWithData2': ['dataSource2', function (callback, results) {
    try {
      var data = handleData2(results.dataSource2);
    } catch (err) {
      return callback(err);
    }
    callback(null, data);
  }],
});
```

Here we can see that code is not DRY and looks pretty ugly. Instead we can rewrite handling of data in prettier way:

```javascript
var async = require('async');
var csp = require('continuate');

//...

async.auto({
  'dataSource1': [function (callback) {
    readDatabase(callback);
  }],
  'dataSource2': [function (callback) {
    getDataFromWebService(callback);
  }],
  'actionsWithData1': ['dataSource1', function (callback, results) {
    var cspStyle_handleData1 = cps(handleData1).bind();
    //Now it provides error and result in the callback
    cspStyle_handleData1(results.dataSource1, callback);
  }],
  'actionsWithData2': ['dataSource2', function (callback, results) {
    var cspStyle_handleData2 = cps(handleData2).bind();
    cspStyle_handleData2(results.dataSource2, callback);
  }],
});

```

And we have neat and descriptive logic without changing original `handleData1` and `handleData2` functions so we can reuse them in regular and CSP-code.

\#bind
-----
Works like `Function.prototype.bind` except it returns function which passes results in the callback.

```javascript
var csp = require('continuate');

function add(a, b) { return a + b; }

var increment = csp(add).bind(null, 1);
increment(42, function (err, data) {
  console.assert(data === 43);
});
```

It also works with methods as original `Function.prototype.bind`

```javascript
var csp = require('continuate');

var object = {
  counter: 0,
  add: function (x) { return this.count += x; }
}

var csp_add = csp(object.add).bind(object);
csp_add(1, function (err, res) {
  console.assert(res === 1);
});
```

\#apply
------
Similar to `Function.prototype.apply` - applies array as arguments to the function. Callback should be the last element of array. Also works with methods.

```javascript
var csp = require('continuate');

function add(a, b) { return a + b; }

csp(add).apply(null, [1, 42, function (err, data) {
  console.assert(data === 43);
}]);
```

\#call
------
Similar to `Function.prototype.call` - calls function with provided arguments. Also works with methods.

```javascript
var csp = require('continuate');

function add(a, b) { return a + b; }

csp(add).call(null, 1, 42, function (err, data) {
  console.assert(data === 43);
});
```
