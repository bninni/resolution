/*
Copyright Brian Ninni 2016
*/

/*
To create a Resolution Object.
	isImmutable : Whether this Resolution can be updated once it has already been Resolved or Rejected
	hasMethod : Whether this Resolution was given a Function which will Resolve or Reject this Resolution
	handle : The initial isFulfilled value or the method to invoke if hasMethod is true
		- will set the state to the handle value if hasMethod is false and the handle value is a boolean
	value : The initial data value
*/
function Resolution( isImmutable, hasMethod, handle, value ){
	
	//Initialize the state as 'pending'
	var state,
		result,
		isSettled,
		isFulfilled,
		isRejected,
		isPending,
		isLocked = false,
		self = this,
		callbacks = {
			reject : [],
			resolve : [],
			reset : []
		};
	
	//To add the given callback to the given callback array
	function addCallback( which, fn, once ){
		var arr = callbacks[which];
		
		//Return if the 'which' is not valid or fn is not a function
		if( !arr || typeof fn !== 'function' ) return;
		
		//Add the callback object to the callback array
		arr.push({
			fn : fn,
			once : once === true
		});
	}
	
	//To run the given callback array
	function runCallbacks( which ){
		var newArr = [];
		callbacks[which].forEach(function( obj, i ){
			obj.fn( value, self );
			//If not once, then add to the new array
			if( !obj.once ) newArr.push( obj );
		})
		callbacks[which] = newArr;
	};
	
	//	To update the state data based on the given value (true if fulfilled, false if rejected)
	function setState( doFulfill ){
		isPending = typeof doFulfill !== 'boolean';
		isSettled = !isPending;
		isFulfilled = doFulfill === true;
		isRejected = doFulfill === false;
		state = isFulfilled ? 'fulfilled' : ( isRejected ? 'rejected' : 'pending');
	}
	
	// To update the value to the given data (if data was provided) and set isLocked to the given value
	function setData( data, doLock ){
		isLocked = doLock;
		if( typeof data !== 'undefined' ) value = data;
	}
	
	/*
		To resolve this Resolution to the given value by setting the state to 'fulfilled' and updating the data (if provided)
			-Will not resolve if this Resolution is Locked
	*/
	function resolve( data ){
		if( isLocked ) return;
		setState( true );
		//Update the data and lock if Immutable
		setData( data, isImmutable );
		runCallbacks( 'resolve' );
		return self;
	}
	
	/*
		To reject this Resolution to the given value by setting the state to 'rejected' and updating the data (if provided)
			-Will not reject if this Resolution is Locked
	*/
	function reject( data ){
		if( isLocked ) return;
		setState( false );
		//Update the data and lock if Immutable
		setData( data, isImmutable );
		runCallbacks( 'reject' );
		return self;
	}
	
	/*
		To reset this Resolution to the pending state and update the data (if provided)
			-Will not reset if this Resolution is Locked
	*/
	function reset( data ){
		if( isLocked ) return;
		setState();
		//Update the data and unlock
		setData( data, false );
		runCallbacks( 'reset' );
		return self;
	}
	
	
	Object.defineProperties( this, {
	
		/*
			To run specific functions based on the state of this Resolution and return another Resolution
				-If resolved, will run the onResolve function and return a new Resolution Fulfilled with that return value
				-If rejected, will run the onReject function and return a new Resolution Rejected with that return value
				-If pending or onResolve/onReject are not functions, it will return a Clone of this Resolution
		*/
		then : {
			value : function( onResolve, onReject ){
				//Initialize the new data to be equal to the current data
				var fn,
					newValue = value,
					newSuccess = isFulfilled;
				
				//If this is Fulfilled, then run the onResolve function
				if( isFulfilled ) fn = onResolve;
				//If this is Rejected, then run the onReject function
				else if( isRejected ) fn = onReject;
				//If this is pending, then set newSuccess to null
				else newSuccess = null;
				
				//If fn is a function, then try to update the value to the result of that function
				if( typeof fn === 'function' ){
					try{
						newValue = fn(value);
						newSuccess = true;
					}
					//If an error was thrown, then reject the new Resolution with that error
					catch(e){
						newValue = e;
						newSuccess = false;
					}
				}
				
				//Return a new Resolution with the new data
				return new Resolution( true, false, newSuccess, newValue )
			}
		},
		// catch is the equivalent of this( null, onReject ), so just forward it to that
		catch : {
			value : function( onError ){
				return self.then( null, onError );
			}
		},
		settled : {
			get : function(){
				return isSettled;
			}
		},
		locked : {
			get : function(){
				return isLocked;
			}
		},
		pending : {
			get : function(){
				return isPending;
			}
		},
		resolved : {
			get : function(){
				return isFulfilled;
			}
		},
		fulfilled : {
			get : function(){
				return isFulfilled;
			}
		},
		rejected : {
			get : function(){
				return isRejected;
			}
		},
		state : {
			get : function(){
				return state;
			},
			enumerable : true,
		},
		value : {
			get : function(){
				return value;
			},
			enumerable : true,
		},
	});
	
	//If the Resolution is Mutable, then add the resolve, reject, reset, and on properties
	if( !isImmutable ) Object.defineProperties( this, {
		resolve : {
			value : resolve
		},
		reject : {
			value : reject
		},
		reset : {
			value : reset
		},
		lock : {
			value : function( data ){
				//Update the data and Lock
				setData( data, true );
			}
		},
		on : {
			value : addCallback
		},
	});
	
	//Initialize the state as 'pending'
	setState();
	
	//If a method was provided, then invoke it
	if( hasMethod ){
		
		if( typeof handle !== 'function' ) throw new Error( handle + ' is not a function');
		
		try{
			//Invoke the method with the resolve and reject functions
			result = handle( resolve, reject );
		}
		catch(e){
			//If there was an error, then reject with that error if not already settled
			if( !isSettled ) reject(e);
		}
		
		//If the result value was not 'undefined', then resolve with that value
		if( typeof result !== 'undefined' ) resolve( result );
	}
	// Otherwise, update the state if initial value was provided as a boolean value
	else if( typeof handle === 'boolean' ) setState( handle );
		
	//Lock if Immutable
	if( isImmutable ) isLocked = true;
}

/*
	To see if the given object is iterable
	Is not iterable if:
		-It is undefined, null, or does not have a 'length' property
*/
function isIterable( o ){
	return typeof o !== 'undefined' &&  o !== null && typeof o.length !== 'undefined';
}

//Returns an Immutable Resolution that calls the given method
function ResolutionWrapper( method ){
	return new Resolution( true, true, method )
}

//Returns a Resolved, Immutable Resolution
ResolutionWrapper.resolve = function( value ){
	return new Resolution( true, false, true, value );
}

//Returns a Rejected, Immutable Resolution
ResolutionWrapper.reject = function( value ){
	return new Resolution( true, false, false, value );
}

//Returns a Pending, Immutable Resolution
ResolutionWrapper.pending = function( value ){
	return new Resolution( true, false, null, value );
}

//Returns a Mutable Resolution that calls the given method
ResolutionWrapper.Mutable = function( method ){
	return new Resolution( false, true, method )
}

//Returns a Resolved, Mutable Resolution
ResolutionWrapper.Mutable.resolve = function( value ){
	return new Resolution( false, false, true, value );
}

//Returns a Rejected, Mutable Resolution
ResolutionWrapper.Mutable.reject = function( value ){
	return new Resolution( false, false, false, value );
}

//Returns a Pending, Mutable Resolution
ResolutionWrapper.Mutable.pending = function( value ){
	return new Resolution( false, false, null, value );
}

/*
	Race returns a Resolution which:
		-Rejects if no iterable was provided
		-Resolves with the the first Non-Resolution element or value of the first Resolved Resolution in the given iterable
		-Rejects with the value of the first Rejected Resolution in the given iterable
		-is Pending if the iterable is empty or filled with Pending Resolutions
*/
ResolutionWrapper.race = function( arr ){
	var i, len;
	
	//If no iterable was provided, then reject
	if( !isIterable(arr) ) return ResolutionWrapper.reject(new Error(arr + ' is not iterable'))
	
	for(i=0,len=arr.length;i<len;i++){
		//If the element is not a resolution, then return a new Resolution resolved to the value
		if( !(arr[i] instanceof Resolution) ) return ResolutionWrapper.resolve( arr[i] );
		else if( arr[i].fulfilled ) return ResolutionWrapper.resolve( arr[i].value );
		else if( arr[i].rejected ) return ResolutionWrapper.reject( arr[i].value );
		//otherwise, it's pending so check the next element
	}
	
	//Otherwise, return a new Pending Resolution
	return ResolutionWrapper.pending();
};

/*
	All returns a Resolution which:
		-Rejects if no iterable was provided
		-Resolves with array of all resolved values if all elements in the given iterable are values or Resolved Resolutions
		-Rejects with the value of the first Resolution that is rejected
		-is Pending if there is a Pending Resolution in the iterable
*/
ResolutionWrapper.all = function( arr ){
	var resolvedArray = [],
		i, len;
	
	//If no iterable was provided, then reject
	if( !isIterable(arr) ) return ResolutionWrapper.reject(new Error(arr + ' is not iterable'))
	
	for(i=0,len=arr.length;i<len;i++){
		//If the element is not a resolution, then add that value to the resolve array
		if( !(arr[i] instanceof Resolution) ) resolvedArray.push( arr[i] );
		//If the Resolution is fulfilled, then add the value to the resolvedArray
		else if( arr[i].fulfilled ) resolvedArray.push( arr[i].value );
		//If the Resolution is pending, then return a Resolution rejected with that value
		else if( arr[i].rejected ) return ResolutionWrapper.reject( arr[i].value );
		//otherwise, the Resolution is pending, so return a new Pending Resolution
		else return ResolutionWrapper.pending();
	}
	
	//If we reached here, then return a Resolution resolved with the resolvedArray
	return ResolutionWrapper.resolve( resolvedArray );
};

module.exports = ResolutionWrapper;