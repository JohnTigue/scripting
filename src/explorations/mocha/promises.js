/* global describe, console, require, before, beforeEach, after, afterEach, it */

/** The explorations of mocha's fundimentals series continues...
  * 
  * This file explores the handling of promises, maximally leveraging what is built into 
  * mocha while minimizing help from other libraries. Turns out mocha-as-promised
  * is not necessary. And node's build-in assert does just fine.
  *
  * After a bit of research, decided to go with Forbes Lindesay's Promise library:
  *   https://www.npmjs.com/package/promise
  *
  * One can read up on that at https://www.promisejs.org/
  *
  * He also did talks on it:
  *   Forbes Lindesay: Promises and Generators: control flow utopia -- JSConf EU 2013:
  *     https://www.youtube.com/watch?v=qbKWsbJ76-s
  *
  * Install it:
  *   npm install promise --save
  */
describe('builtin-promises-test.js:', function(){
  // Moved all the code into one big file-wide describe to keep JSHint from saying: 
  //   Use the function form of "use strict"
  'use strict'; 

  var assert  = require('assert');
  var http    = require('http');
  var fs      = require('fs');

  // Following Lindesay's style here. I guess the Capital is to imply class-ness? Dunno.
  var Promise = require('promise');

  context('when simply instantiating a Promise', function(){
    var aPromise = null;
    before(function(){
      // If no function as first param throws: TypeError: not a function
      //   var aPromise = new Promise();	
      aPromise = new Promise(function(){});
      });

    it('should be able to instantiate a Promise', function(){
      assert(aPromise, 'aPromise is truthy');
      });
    });


  context('when auto-resolving a Promise', function(){
    var bPromise = null;
    before(function(){
      bPromise = new Promise(function(resolve, reject){
        resolve('basically, unit');
        });
      });

    // Notice how there is no need for a done callback in the params of the function passed in.
    // With a simple (i.e. non-Promise) async callback, that function def would need to function(done){}
    // but because it() returns the Promise synchronously, no done() is needed to handle asynch-ery,
    // yet then() will happen asynchronously. Mocha is tight like that.
    it('should find the supplied resolved value in then()', function(){
      return bPromise.then(function(aValue){
        assert.equal(aValue, 'basically, unit', 'bPromise insta-resolved like unit');
        });
      });
    });


  context('when auto-rejecting a Promise', function(){
    var aPromise = null;
    before(function(){
      aPromise = new Promise(function(resolve, reject){
        reject('Reason? Just because.');
        });
      });

    // Here's the most elegant solution from 2014-11:
    //   http://stackoverflow.com/a/26572442
    //   1. No done passed into it()'s callback
    //   2. No rejection handler (could suppress errors)
    //   3. Return the Promise
    //   4. I guess mocha will then() on it and repsond appropriately
    it('should throw', function(){
      return aPromise.then(function(aValue){
        assert.fail('', '', 'aPromise should have rejected', '');
        });
      });
    });

  /** This confirms that if before() returns a promise which rejects, then 
    * it() will never be called, which is good.
    */
  context('when auto-rejecting a Promise and returning it from before() should throw ahead of it()', function(){
    var aPromise = null;
    before(function(){
      return aPromise = new Promise(function(resolve, reject){
        reject('Reason? Just because I\'m in a bad mood.');
        });
      });

    it('should throw', function(){
      return aPromise.then(function(aValue){
        assert.fail('', '', 'aPromise should have rejected in before and this it() should never have been called', '');
        });
      });
    });


  /** Just checking that indeed an _async_ reject in before() will prevent it() from being called */
  context('when setTime() rejects a Promise that was returned from before() should throw ahead of it()', function(){
    var aPromise = null;
    before(function(){
      return aPromise = new Promise(function(resolve, reject){
        setTimeout(function(){reject('Intentionally timed out and rejected');}, 500);
        });
      });

    it('should throw', function(){
      return aPromise.then(function(aValue){
        assert.fail('', '', 'aPromise should have rejected in before and this it() should never have been called', '');
        });
      });
    });
  });

