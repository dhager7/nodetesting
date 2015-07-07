/**
 * Created by delmarhager on 6/25/15.
 */
//declare categorypromise varvar catPromise;
var assert = require('assert');

function alert (message) {
    console.log (message);
}
function* demo() {
    var res = yield 10;
    res = yield 20;
    assert(res === 32);
    return 42;
}

var d = demo();
var resA = d.next();
alert(resA);
// => {value: 10, done: false}
var resC = d.next();
alert(resC);
var resB = d.next(32);
alert(resB);
// => {value: 42, done: true}
//if we call d.next() again it throws an error