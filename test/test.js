var Resolution = require('../index'),
	vows = require('vows'),
    assert = require('assert');

vows.describe('Test').addBatch({
	'Mutable Resolution':{
		'Can initialize to Pending, Resolved Rejected' : function( r ){
			var r = Resolution.Mutable.pending()
			assert.equal( r.state, 'pending' );
			assert.equal( r.fulfilled, false );
			assert.equal( r.rejected, false );
			assert.equal( r.pending, true );
			assert.equal( r.settled, false );
			assert.equal( r.locked, false );
			assert( typeof r.value === 'undefined' );
			
			r = Resolution.Mutable.resolve( 100 )
			assert.equal( r.state, 'fulfilled' );
			assert.equal( r.fulfilled, true );
			assert.equal( r.rejected, false );
			assert.equal( r.pending, false );
			assert.equal( r.settled, true );
			assert.equal( r.locked, false );
			assert.equal( r.value, 100 );
			
			r = Resolution.Mutable.reject( false, 0 )
			assert.equal( r.state, 'rejected' );
			assert.equal( r.fulfilled, false );
			assert.equal( r.rejected, true );
			assert.equal( r.pending, false );
			assert.equal( r.settled, true );
			assert.equal( r.locked, false );
			assert.equal( r.value, 0 );
		},
		'Can be mutated':function( r ){
			var r = Resolution.Mutable.resolve( 100 )
			r.reject( 0 );
			assert.equal( r.state, 'rejected' );
			assert.equal( r.fulfilled, false );
			assert.equal( r.rejected, true );
			assert.equal( r.pending, false );
			assert.equal( r.settled, true );
			assert.equal( r.locked, false );
			assert.equal( r.value, 0 );
		},
		'Mutating without a value will not affect current value':function( r ){
			var r = Resolution.Mutable.reject( 0 )
			r.resolve();
			assert.equal( r.state, 'fulfilled' );
			assert.equal( r.fulfilled, true );
			assert.equal( r.rejected, false );
			assert.equal( r.pending, false );
			assert.equal( r.settled, true );
			assert.equal( r.locked, false );
			assert.equal( r.value, 0 );
		},
		'Can Reset to Pending state':function( r ){
			var r = Resolution.Mutable.resolve( 100 )
			r.reset( 50 );
			assert.equal( r.state, 'pending' );
			assert.equal( r.fulfilled, false );
			assert.equal( r.rejected, false );
			assert.equal( r.pending, true );
			assert.equal( r.settled, false );
			assert.equal( r.locked, false );
			assert.equal( r.value, 50 );
		},
		'Can Lock':function( r ){
			var r = Resolution.Mutable.reject( 0 )
			r.resolve( 100 );
			r.lock();
			r.reject( 0 );
			assert.equal( r.state, 'fulfilled' );
			assert.equal( r.fulfilled, true );
			assert.equal( r.rejected, false );
			assert.equal( r.pending, false );
			assert.equal( r.settled, true );
			assert.equal( r.locked, true );
			assert.equal( r.value, 100 );
		},
	},
	'Initializing Immutable Specific State':{
		'Pending' : function(){
			var r = Resolution.pending( 50 );
			assert.equal( r.state, 'pending' );
			assert.equal( r.fulfilled, false );
			assert.equal( r.rejected, false );
			assert.equal( r.pending, true );
			assert.equal( r.settled, false );
			assert.equal( r.locked, true );
			assert.equal( r.value, 50 );
		},
		'Resolved' : function(){
			var r = Resolution.resolve( 100 );
			assert.equal( r.state, 'fulfilled' );
			assert.equal( r.fulfilled, true );
			assert.equal( r.rejected, false );
			assert.equal( r.pending, false );
			assert.equal( r.settled, true );
			assert.equal( r.locked, true );
			assert.equal( r.value, 100 );
		},
		'Rejected' : function(){
			var r = Resolution.reject( 0 )
			assert.equal( r.state, 'rejected' );
			assert.equal( r.fulfilled, false );
			assert.equal( r.rejected, true );
			assert.equal( r.pending, false );
			assert.equal( r.settled, true );
			assert.equal( r.locked, true );
			assert.equal( r.value, 0 );
		},
		'Does not have resolve/reject properties':function(){
			var r = Resolution.reject( 0 )
			assert( typeof r.resolve === 'undefined' );
			assert( typeof r.reject === 'undefined' );
			assert( typeof r.reset === 'undefined' );
			assert( typeof r.lock === 'undefined' );
			assert( typeof r.on === 'undefined' );
		},
	},
	'Methods':{
		topic :function(){ return function( res, rej ){ res(100); rej(0); } },
		'Immutable will be Resolved to 100' : function( f ){
			var r = Resolution(f);
			assert.equal( r.state, 'fulfilled' );
			assert.equal( r.value, 100 );
		},
		'Mutable will be Rejected to 0' : function( f ){
			var r = Resolution.Mutable(f);
			assert.equal( r.state, 'rejected' );
			assert.equal( r.value, 0 );
		},
		'Can resolve with return value' : function( f ){
			var r = Resolution(function(){return 100});
			assert.equal( r.state, 'fulfilled' );
			assert.equal( r.value, 100 );
			var r = Resolution.Mutable(function(){return 100});
			assert.equal( r.state, 'fulfilled' );
			assert.equal( r.value, 100 );
		},
		'Immutable will not resolve with return value if already settled' : function( f ){
			var r = Resolution(function(res, rej){rej(0);return 100});
			assert.equal( r.state, 'rejected' );
			assert.equal( r.value, 0 );
		},
		'Mutable will resolve with return value even if already settled' : function( f ){
			var r = Resolution.Mutable(function(res, rej){rej(0);return 100});
			assert.equal( r.state, 'fulfilled' );
			assert.equal( r.value, 100 );
		},
		'Will be Pending if not Resolved or Rejected Synchronously' : function(){
			var r = Resolution(function(res,rej){ setTimeout(function(){res()},0) });
			assert.equal( r.state, 'pending' );
			assert( typeof r.value === "undefined" );
		},
		'Will Reject with Errors' : function(){			
			var r = Resolution(function(){ throw new Error() })
			assert.equal( r.state, 'rejected' );
			assert( r.value instanceof Error );
		},
		'Will Throw if not a function' : function(){			
			assert.throws( function(){ var r = Resolution(); } );
		},
		'Will Not Reject with Errors if Already Resolved/Rejected' : function(){
			var r = Resolution(function(res, rej){ res(100);throw new Error() })
			assert.equal( r.state, 'fulfilled' );
			assert.equal( r.value, 100 );
			
			var r = Resolution(function(res, rej){ rej(0);throw new Error() })
			assert.equal( r.state, 'rejected' );
			assert.equal( r.value, 0 );
		}
	},
	'Then/Catch':{
		topic :function(){
			return function( r, which ){
				var resolvedCount = 0,
					rejectedCount = 0;
					
				function incResolved(){ resolvedCount++ }
				function incRejected(){ rejectedCount++ }
			
				if( which === 0) r( function( res, rej ){ res(100); rej(0); } ).then(incResolved,incRejected).then(incResolved,incRejected);
				else if( which === 1) r( function( res, rej ){ res(100); rej(0); } ).catch(incRejected).then(incResolved,incRejected);
				else if (which === 2) r( function( res, rej ){ res(100); rej(0); } ).then(incResolved,incRejected).catch(incRejected);
				else if (which === 3) r( function( res, rej ){ res(100); rej(0); } ).then(incResolved).catch(incRejected);
				
				return [resolvedCount, rejectedCount]
			}
		},
		'Pending will not call Either' : function( handle ){
			var count = handle( Resolution.pending, 0 );
			
			assert.equal( count[0], 0 );
			assert.equal( count[1], 0 );
		},
		'Immutable will call Resolve Twice' : function( handle ){
				
			var count = handle( Resolution, 0 );
			
			assert.equal( count[0], 2 );
			assert.equal( count[1], 0 );
		},
		'Mutable will call Each Once' : function( handle ){
			var count = handle( Resolution.Mutable, 0 );
			
			assert.equal( count[0], 1 );
			assert.equal( count[1], 1 );
		},
		'Catch with then after' : function( handle ){
			var count = handle( Resolution.Mutable, 1 );
			
			assert.equal( count[0], 1 );
			assert.equal( count[1], 1 );
			
			var count = handle( Resolution, 1 );
			
			assert.equal( count[0], 1 );
			assert.equal( count[1], 0 );
		},
		'Then with catch after' : function( handle ){
			var count = handle( Resolution.Mutable, 2 );
			
			assert.equal( count[0], 0 );
			assert.equal( count[1], 1 );
			
			var count = handle( Resolution, 2 );
			
			assert.equal( count[0], 1 );
			assert.equal( count[1], 0 );
		},
		'Then without reject, catch after' : function( handle ){
			var count = handle( Resolution.Mutable, 3 );
			
			assert.equal( count[0], 0 );
			assert.equal( count[1], 1 );
			
			var count = handle( Resolution, 3 );
			
			assert.equal( count[0], 1 );
			assert.equal( count[1], 0 );
		},
		'Then throws error, catch after' : function( handle ){
			var rVal,
			r = Resolution.resolve(100)
			.then(function(){throw new Error()})
			.catch(function(){ rVal = 'Error' });
			
			assert.equal( rVal, 'Error' );
		},
	},
	"Using Callbacks" : {
		topic : function(){
			var arr = [],
				r = Resolution.Mutable.pending(),
				cb = this.callback;
			
			r.on('resolve',function( data ){
				arr.push((r.state === 'fulfilled' && data === 100))
				r.reject(0);
			})
			
			r.on('reject',function( data ){
				arr.push((r.state === 'rejected' && data === 0))
				r.reset(50)
			})
			
			r.on('reset',function( data ){
				arr.push((r.state === 'pending' && data === 50))
				cb(null, arr )
			})
			
			r.resolve(100);
		},
		"Receives data" : function( err, matches ){
			assert.deepEqual( matches, [true,true,true] )
		}
	},
	"Race" : {
		"Race on non-iterable is Rejected" : function(){
			var r = Resolution.race()
			assert.equal( r.state, 'rejected' );
			assert( r.value instanceof Error );
		},
		"Race on empty array is pending" : function(){
			var r = Resolution.race([])
			assert.equal( r.state, 'pending' );
			assert( typeof r.value === 'undefined' );
		},
		"Race on Pending array is pending" : function(){
			var r = Resolution.race([Resolution.pending(5)])
			assert.equal( r.state, 'pending' );
			assert( typeof r.value === 'undefined' );
		},
		"Race matches first non-pending Resolution" : function(){
			var r = Resolution.race([Resolution.resolve(100),Resolution.reject(0)])
			assert.equal( r.state, 'fulfilled' );
			assert.equal( r.value, 100 );
			
			r = Resolution.race([Resolution.reject(0),Resolution.resolve(100)])
			assert.equal( r.state, 'rejected' );
			assert.equal( r.value, 0 );
			
			r = Resolution.race([Resolution.pending(50),Resolution.resolve(100)])
			assert.equal( r.state, 'fulfilled' );
			assert.equal( r.value, 100 );
		},
		"Race resolves with first value" : function(){
			var r = Resolution.race([100,0])
			assert.equal( r.state, 'fulfilled' );
			assert.equal( r.value, 100 );
		},
	},
	"All" : {
		"All on non-iterable is Rejected" : function(){
			var r = Resolution.all()
			assert.equal( r.state, 'rejected' );
			assert( r.value instanceof Error );
		},
		"All on empty array resolves an empty array" : function(){
			var r = Resolution.all([])
			assert.equal( r.state, 'fulfilled' );
			assert.deepEqual( r.value, [] );
		},
		"All on Pending array is pending" : function(){
			var r = Resolution.all([Resolution.pending(5)])
			assert.equal( r.state, 'pending' );
			assert( typeof r.value === 'undefined' );
		},
		"All rejects if Rejected Resolution is in the Array" : function(){
			var r = Resolution.all([Resolution.resolve(100),Resolution.reject(0)]);
			assert.equal( r.state, 'rejected' );
			assert.equal( r.value, 0 );
		},
		"All resolves if all array is non-Pending or non-Rejected Resolutions" : function(){
			var r = Resolution.all([100,0,Resolution.resolve(50)])
			assert.equal( r.state, 'fulfilled' );
			assert.deepEqual( r.value, [100,0,50] );
		},
	},
}).exportTo(module);