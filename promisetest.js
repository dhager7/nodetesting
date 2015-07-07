/**
 * Created by delmarhager on 6/25/15.
 */
var Promiseme = function () {
    var promState = {
        pending: 1,
        fulfilled: 2,
        rejected: 3
    };
    //check the enumeration of promise states

    var Promiseme = {
        //set default state
        myState: promState.pending,
        changeMyState: function (newState, newValue) {

            // check 1: if we are changing to same state and report it
            if (this.myState == newState) {
                throw new Error("Sorry, But you can't do this to me! You are transitioning to same state: " + newState);
            }

            // check2: trying to get out of the fulfilled or rejected states
            if (this.myState == promState.fulfilled || this.myState == promState.rejected) {
                throw new Error("You can't leave this state now: " + this.myState);
            }
            // check 3: if promise is rejected with a null reason
            if (newState == promState.rejected && newValue === null) {
                throw new Error("If you get rejected there must be a reason. It can't be null!");
            }
            //check: 4 if there was no value passed with fulfilled
            if (newState == promState.fulfilled && arguments.length < 2) {
                throw new Error("I am sorry but you must have a non-null value to proceed to fulfilled!");
            }

            // we passed all the conditions, we can now change the state
            this.myState = newState;
            this.value = newValue;
            this.resolve();
            return this.myState;
        },
        fulfillPromise: function (value) {
            this.changeMyState(promState.fulfilled, value);
        },
        rejectPromise: function (reason) {
            this.changeMyState(promState.rejected, reason);
        },
        then: function (onFulfilled, onRejected) {
            // define an array named handlers
            this.handlers = this.handlers || [];
            // create a promise object
            var returnedPromise = Object.create(Promiseme);
            var that = this;
            setTimeout(function () {
                that.handlers.push({
                    fulfillPromise: onFulfilled,
                    rejectPromise: onRejected,
                    promise: returnedPromise
                });
                that.resolve();
            }, 2);

            return returnedPromise;
        },
        resolve: function () {
            // check for pending and exist
            if (this.myState == promState.pending) {
                return false;
            }
            // loop through each then as long as handlers array contains items
            while (this.handlers && this.handlers.length) {
                //return and remove the first item in array
                var handler = this.handlers.shift();

                //set the function depending on the current state
                var doResolve = (this.myState == promState.fulfilled ? handler.fulfillPromise : handler.rejectPromise);
                //if doResolve is not a function
                if (typeof doResolve != 'function') {
                    handler.promise.changeMyState(this.myState, this.value);

                } else {
                    // fulfill the promise with value or reject with error
                    try {
                        var promiseValue = doResolve(this.value);

                        // deal with promise returned
                        if (promiseValue && typeof promiseValue.then == 'function') {
                            promiseValue.then(function (val) {
                                handler.promise.changeMyState(promState.fulfilled, val);
                            }, function (error) {
                                handler.promise.changeMyState(promState.rejected, error);
                            });
                            //if the value returned is not a promise
                        } else {
                            handler.promise.changeMyState(promState.fulfilled, promiseValue);
                        }
                        // deal with error thrown
                    } catch (error) {
                        handler.promise.changeMyState(promState.rejected, error);
                    }
                }
            }
        }
    };
    return Object.create(Promiseme);
};

var multiplyMeAsync = function (val) {
    var promise = new Promiseme();
    promise.fulfillPromise(val * 2);

    return promise;
};
multiplyMeAsync(0)
    .then(function (value) {
        console.log(value);
    });