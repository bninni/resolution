var Resolution = require('../index'),
	vows = require('vows'),
    assert = require('assert');

function getState( constructor, instance, callback ){
	constructor.race([instance,null]).then(function( pVal ){
		callback(null, pVal === null ? 'pending' : 'resolved' )
	},function(pVal){
		callback(null, 'rejected' );
	});
}
	
vows.describe('Test').addBatch({
	'Resolve and then':{
		topic : function(){
			var cb = this.callback;
			Promise.resolve( 100 ).then(function( pVal ){
				cb(null, pVal )
			});
		},
		'Produces same Value' : function( pVal ){
			var rVal;
			Resolution.resolve(100).then(function( val ){
				rVal = val;
			});
			assert.equal( rVal, pVal )
		}
	},
	'Reject and then':{
		topic : function(){
			var cb = this.callback;
			Promise.reject( 0 ).then(null,function( pVal ){
				cb(null, pVal )
			});
		},
		'Produces same Value' : function( pVal ){
			var rVal;
			Resolution.reject(0).then(null,function( val ){
				rVal = val;
			});
			assert.equal( rVal, pVal )
		}
	},
	'Reject and catch':{
		topic : function(){
			var cb = this.callback;
			Promise.reject( 0 ).catch(function( pVal ){
				cb(null, pVal )
			});
		},
		'Produces same Value' : function( pVal ){
			var rVal;
			Resolution.reject(0).catch(function( val ){
				rVal = val;
			});
			assert.equal( rVal, pVal )
		}
	},
	'Methods that Don\'t Resolve': {
		topic :function(){
			var cb = this.callback;
			getState( Promise, new Promise(function(){}), function(state){ cb( null, state ) } )
		},
		'Are Pending' : function( pVal ){
			var rVal;
			getState( Resolution, Resolution(function(){}), function(state){
				rVal = state;
			});
			assert.equal( rVal, pVal )
		},
	},
	'Methods that Resolve': {
		topic :function(){
			var cb = this.callback;
			getState( Promise, new Promise(function(res, rej){ res(100); rej(0); }), function(state){ cb( null, state ) } );
		},
		'Are fulfilled' : function( pVal ){
			var rVal;
			getState( Promise, new Promise(function(res, rej){ res(100); rej(0); }), function(state){
				rVal = state;
			});
			assert.equal( rVal, pVal )
		},
	},
	'Methods that Reject': {
		topic :function(){
			var cb = this.callback;
			getState( Promise, new Promise(function(res, rej){ rej(0); }), function(state){ cb( null, state ) } );
		},
		'Are rejected' : function( pVal ){
			var rVal;
			getState( Promise, new Promise(function(res, rej){ rej(0); }), function(state){
				rVal = state;
			});
			assert.equal( rVal, pVal )
		},
	},
	'Methods that Reject using then': {
		topic :function(){
			var cb = this.callback;
			new Promise(function(res, rej){ rej(0); res(100); }).then(null,function( pVal ){
				cb(null, pVal )
			});
		},
		'Produces same Value' : function( pVal ){
			var rVal;
			new Resolution(function(res, rej){ rej(0); res(100); }).then(null,function( val ){
				rVal = val;
			});
			assert.equal( rVal, pVal )
		},
	},
	'Methods that Reject using catch': {
		topic :function(){
			var cb = this.callback;
			new Promise(function(res, rej){ rej(0); res(100); }).catch(function( pVal ){
				cb(null, pVal )
			});
		},
		'Produces same Value' : function( pVal ){
			var rVal;
			new Resolution(function(res, rej){ rej(0); res(100); }).catch(function( val ){
				rVal = val;
			});
			assert.equal( rVal, pVal )
		},
	},
	'Chaining Then -> Then': {
		topic :function(){
			var cb = this.callback;
			new Promise(function(res, rej){ res(100) }).then(function(val){
				return val-1;
			}).then(function( pVal ){
				cb(null, pVal )
			});
		},
		'Produces same Value' : function( pVal ){
			var rVal;
			new Resolution(function(res, rej){ res(100) }).then(function(val){
				return val-1;
			}).then(function( val ){
				rVal = val;
			});
			assert.equal( rVal, pVal )
		},
	},
	'Chaining Then -> Catch': {
		topic :function(){
			var cb = this.callback;
			new Promise(function(res, rej){ rej(0) }).then(function(val){
				return val-1;
			}).catch(function( pVal ){
				cb(null, pVal )
			});
		},
		'Produces same Value' : function( pVal ){
			var rVal;
			new Resolution(function(res, rej){ rej(0) }).then(function(val){
				return val-1;
			}).catch(function( val ){
				rVal = val;
			});
			assert.equal( rVal, pVal )
		},
	},
	'Chaining Catch -> Then': {
		topic :function(){
			var cb = this.callback;
			new Promise(function(res, rej){ rej(0) }).catch(function(val){
				return val-1;
			}).then(function( pVal ){
				cb(null, pVal )
			});
		},
		'Produces Same Value' : function( pVal ){
			var rVal;
			new Resolution(function(res, rej){ rej(0) }).catch(function(val){
				return val-1;
			}).then(function( val ){
				rVal = val;
			});
			assert.equal( rVal, pVal )
		},
	},
	'Error in input': {
		'Will throw if not a function' : function( pVal ){
			assert.throws( function(){ var r = new Promise(); } );
		},
	},
	'Errors in Function': {
		topic :function(){
			var cb = this.callback;
			new Promise(function(res, rej){ throw new Error('Error') }).catch(function(err){
				cb(null, err.message )
			});
		},
		'Produces Same Value' : function( pVal ){
			var rVal;
			new Resolution(function(res, rej){ throw new Error('Error') }).catch(function(err){
				rVal = err.message;
			});
			assert.equal( rVal, pVal )
		},
	},
	'Race on non-iterable': {
		topic :function(){
			var cb = this.callback;
			Promise.race().catch(function(){
				cb(null, 'Error' )
			});
		},
		'get Rejected' : function( pVal ){
			var rVal;
			Resolution.race().catch(function(){
				rVal = 'Error';
			});
			assert.equal( rVal, pVal )
		},
	},
	'Race on Empty Array': {
		topic :function(){
			var cb = this.callback;
			getState( Promise, Promise.race([]), function(state){ cb( null, state ) } )
		},
		'is Pending' : function( pVal ){
			var rVal;
			getState( Resolution, Resolution.race([]), function(state){
				rVal = state;
			} )
			assert.equal( rVal, pVal )
		},
	},
	'Race on Pending Array': {
		topic :function(){
			var cb = this.callback;
			getState( Promise, Promise.race([ new Promise(function(){} )]), function(state){ cb( null, state ) } )
		},
		'is Pending' : function( pVal ){
			var rVal;
			getState( Resolution, Resolution.race([ Resolution.pending() ]), function(state){
				rVal = state;
			} )
			assert.equal( rVal, pVal )
		},
	},
	'Race matches first non-Pending': {
		topic :function(){
			var cb = this.callback;
			Promise.race([Promise.reject(0)]).catch(function(pVal){
				cb(null, pVal )
			});
		},
		'Produces Same Value' : function( pVal ){
			var rVal;
			Resolution.race([Resolution.reject(0)]).catch(function(val){
				rVal = val;
			});
			assert.equal( rVal, pVal )
		},
	},
	'Race Resolves with first Value': {
		topic :function(){
			var cb = this.callback;
			Promise.race([100,Promise.reject(0)]).then(function(pVal){
				cb(null, pVal )
			});
		},
		'Produces Same Value' : function( pVal ){
			var rVal;
			Resolution.race([100,Resolution.reject(0)]).then(function(val){
				rVal = val;
			});
			assert.equal( rVal, pVal )
		},
	},
	'All on non-iterable': {
		topic :function(){
			var cb = this.callback;
			Promise.all().catch(function(){
				cb(null, 'Error' )
			});
		},
		'get Rejected' : function( pVal ){
			var rVal;
			Resolution.all().catch(function(){
				rVal = 'Error';
			});
			assert.equal( rVal, pVal )
		},
	},
	'All on empty array': {
		topic :function(){
			var cb = this.callback;
			Promise.all([]).then(function(pVal){
				cb(null, pVal )
			});
		},
		'resolved to empty array' : function( pVal ){
			var rVal;
			Resolution.all([]).then(function(val){
				rVal = val;
			});
			assert.deepEqual( rVal, pVal )
		},
	},
	'All on Pending Array': {
		topic :function(){
			var cb = this.callback;
			getState( Promise, Promise.all([ Promise.resolve(100), new Promise(function(){} )]), function(state){ cb( null, state ) } )
		},
		'is Pending' : function( pVal ){
			var rVal;
			getState( Resolution, Resolution.all([ Resolution.resolve(100), Resolution.pending() ]), function(state){
				rVal = state;
			} )
			assert.equal( rVal, pVal )
		},
	},
	'All Rejects if any are Rejected': {
		topic :function(){
			var cb = this.callback;
			Promise.all([Promise.resolve(100),Promise.reject(0)]).catch(function(pVal){
				cb(null, pVal )
			});
		},
		'Produces Same Value' : function( pVal ){
			var rVal;
			Resolution.all([Resolution.resolve(100),Resolution.reject(0)]).catch(function(val){
				rVal = val;
			});
			assert.equal( rVal, pVal )
		},
	},
	'All Resolves if all are Non-Pending/Rejected': {
		topic :function(){
			var cb = this.callback;
			Promise.all([Promise.resolve(100),0]).then(function(pVal){
				cb(null, pVal )
			});
		},
		'Produces Same Value' : function( pVal ){
			var rVal;
			Resolution.all([Resolution.resolve(100),0]).then(function(val){
				rVal = val;
			});
			assert.deepEqual( rVal, pVal )
		},
	}
}).exportTo(module);