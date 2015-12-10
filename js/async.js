/**
 * Asynchronous utilities for non-blocking loops
 * 
 * All generated promises can be aborted using their .abort() methods.
 * This is non-standard.
 */

/**
 * Asynchronous for loop
 * Calls callback for each item of the loop
 * Equivalent: for (var i = start; i < end; i += step) callback(i)
 * If callback returns a Promise, waits on that promise before continuing
 */
function asyncFor(start, end, step, callback, delay) {
  return asyncLoop(function(value, finish) {
    if (value >= end) {
      return finish();
    }

    var result = callback(value);
    if (!(result instanceof Promise)) {
      result = Promise.resolve(result);
    }

    return result.then(function() {
      return value + step;
    });
  }, start, delay);
}

/**
 * Asynchronously completes a loop using setTimeout
 * Returns a promise for when the loop is done
 * 
 * Calls callback(value, finish). finish is a function
 * which when called will end the loop.
 * value is either the initial provided value or the return
 * value of each successive callback
 * If the return value is a promise, that promise will be awaited
 * before continuing in the loop
 *
 * The returned promise can be aborted using its abort() method
 * This ends the loop at the next iteration (similar to while(!done))
 */
function asyncLoop(callback, value, delay) {
  // Secret paramter saves from having to define a whole new function for
  // this extra argument
  var status = arguments[3] || {
    done: false,
    finish: function() {
      this.done = true;
    }
  };

  var promise = new Promise(function(resolve, reject) {
    setTimeout(function() {
      value = callback(value, status.finish.bind(status));
      if (!(value instanceof Promise)) {
        value = Promise.resolve(value);
      }
      value.then(function(nextValue) {
        if (status.done) {
          resolve();
        }
        else {
          resolve(asyncLoop(callback, nextValue, delay, status));
        }
      });
    }, delay || 0);
  });

  return modifiedPromise(promise, function() {
    status.finish();
  });
}

function modifiedPromise(promise, abort) {
  var promiseAbort = promise.abort;
  promise.abort = function() {
    if (promiseAbort) {
      promiseAbort.apply(promise, arguments);
    }
    abort();
  };
  var promiseThen = promise.then;
  promise.then = function() {
    promise = promiseThen.apply(promise, arguments);
    return modifiedPromise(promise, abort);
  };
  var promiseCatch = promise.catch;
  promise.catch = function() {
    promise = promiseCatch.apply(promise, arguments);
    return modifiedPromise(promise, abort);
  };
  return promise;
}

