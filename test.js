require('should');
var cps = require('./index');

describe('cps', function () {
  
  function answer() {
    return 42;
  }

  function divide(a, b) {
    if (b === 0) {
      throw Error('b is 0');
    }
    return a / b;
  }

  function sayHello(name) {
    name = name || 'world';
    return 'hello ' + name;
  }
  
  it('should work on function with no arguments', function () {
    cps(answer)(function (err, res) {
      (!err).should.be.true;
      res.should.eql(answer());
    });
  });

  it('should work on functions with several arguments', function () {
    cps(divide)(4, 2, function (err, res) {
      (!err).should.be.true;
      res.should.eql(divide(4, 2));
    });
  });

  it('should provide errors in first argument for callback', function () {
    cps(divide)(4, 0, function (err, res) {
      err.should.be.ok;
      (!res).should.be.true;
    });
  });

  it('should fail if no callback provided in last argument', function () {
    cps(divide).bind(4, 2).should.throw();
  });

  it('should properly handle default arguments', function () {
    cps(sayHello)(function (err, res) {
      res.should.eql(sayHello());
    });
  });

});