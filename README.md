continuate
==========

[![Build Status](https://travis-ci.org/franza/continuate.svg?branch=master)](https://travis-ci.org/franza/continuate)

A wrapper to convert regular functions to continuation-passing style.

Usage
-----

```javascript
//regular divide function which throws error if second arg is 0
function divide(a, b) {
  if (b === 0) {
    throw Error('b is 0');
  }
  return a / b;
}

var cps = require('continuate');

var cpsDivide = cps(divide);

cpsDivide(46, 2, function (err, data) {
  console.assert(data === 23);
});

//it provides error to callback
cpsDivide(1, 0, function (err, data) {
  console.assert(err === true);
});
```

Description
-----------

To avoid callback hell you usually work with modules like `async` and its methods. Assume that you have a pretty complex function built upon `async#auto` or `async#parallel`, whatever. Here we read two data sources and pass data to data-handlers. If data-handlers are pretty complex we will eventually want them to be wrapped in `try/catch` to avoid sudden failing of our app:

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

Here we can see that code is not DRY and looks pretty ugly. We can rewrite those handler in continuation-passing style (CPS) right away but imaging situation when you need those handlers as a regular functions, say in synchronous code. You will not want additional callback level in your neat synchronous code.

Instead we can rewrite handling of data in prettier way using `continuate` module. It is an utility you can use to easily convert regualr functions to CPS:

```javascript
var async = require('async');
var cps = require('continuate');

//...

async.auto({
  'dataSource1': [function (callback) {
    readDatabase(callback);
  }],
  'dataSource2': [function (callback) {
    getDataFromWebService(callback);
  }],
  'actionsWithData1': ['dataSource1', function (callback, results) {
    var cpsStyle_handleData1 = cps(handleData1);
    //Now it provides error and result in the callback
    cpsStyle_handleData1(results.dataSource1, callback);
  }],
  'actionsWithData2': ['dataSource2', function (callback, results) {
    cps(handleData2)(results.dataSource2, callback);
  }],
});

```

And we have neat and descriptive logic without changing original `handleData1` and `handleData2` functions so we can reuse them in regular and CPS-code.

**Note, that when you use CPS, functions doesn't become 'asynchronous'. They just provide their results in callbacks.**

Consider this example:

```javascript
var cps = require('continuate');

function add(a, b) { return a + b; }

var cpsAdd = cps(add);
cpsAdd(1, 42, function (err, data) {
  console.assert(data === 43);
});
```

Since it only returns new function it can be also used with methods. Simple `Function.prototype.bind` helps:

```javascript
var cps = require('continuate');

var object = {
  counter: 0,
  add: function (x) { return this.count += x; }
}

var cpsAdd = cps(object.add.bind(object));
cpsAdd(1, function (err, res) {
  console.assert(res === 1);
});
```