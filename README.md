# resolution
[![Build Status](https://travis-ci.org/bninni/resolution.svg?branch=master)](https://travis-ci.org/bninni/resolution)

A response object which synchronously replicates features of `Promise` and more

## Install
```
npm install resolution
```
or
```
npm install -g resolution
```

Then import the module into your program:

```javascript
var Resolution = require('resolution')
```

## Description

A **Resolution** Object can be used as a response object (function return value)

### States

It can be in one of the following **states**:

  * **pending** - This means the **Resolution** Object has been initialized, but not yet **resolved** or **rejected**

  * **fulfilled** - This means the **Resolution** Object was successful in its operation, or **resolved**
  
  * **rejected** - This means the **Resolution** Object was unsuccessful in its operation, or **rejected**
  
### Properties
  
The **state** of any **Resolution** Object can be determined multiple ways.  Each **Resolution** Object has the following properties:

  * **state**      - _String_  - The name of the current state

  * **pending**    - _Boolean_ - True if this **Resolution** Object is in the **pending** state

  * **fulfilled**  - _Boolean_ - True if this **Resolution** Object is in the **fulfilled** state
    * **resolved** will also produce the same result

  * **rejected**   - _Boolean_ - True if this **Resolution** Object is in the **rejected** state
  
Along with being in a specific **state**, a **Resolution** Object also has a **value** associated with it.

It can be accessed with the following property:

  * **value**      - _Any_    - The **value** associated with this **Resolution** Object

### Types  
  
**Resolution** Objects comes in two types: _**Immutable**_ and _**Mutable**_

_**Immutable Resolution** Objects behave precisely as `Promises` do, except everything is handled synchronously.

_**Mutable Resolution** Objects behave the same `Promises` during initialization, but the **state** and **value** can still be modified after execution.

### Comparison to Promises

Along with everything mentioned above, every **Resolution** Object has the same properties as a `Promise` does (and more)

*Check out the Instance Methods sections of the API for more details*
  * [Immutable Instance Methods](#immutable_instance_methods)
  * [Mutable Instance Methods](#mutable_instance_methods)

The **Resolution** Constructor also has the same properties that the `Promise` Constructor does (and more)
	
_Check out [Class Methods](#class_methods) section of the API for more details_

To see the tests proving that **Resolutions** and `Promises` have the same behavior, run the following from within the module directory:

```
npm run promise-test
```

or check out `tests\promiseTest.js`

<a name="api"></a>
## API

  * [Initializing Immutable Resolution](#initializing_immutable)
    * [Immutable Instance Methods](#immutable_instance_methods)
  * [Initializing Mutable Resolution](#initializing_mutable)
    * [Mutable Instance Methods](#mutable_instance_methods)
  * [Class Methods](#class_methods)

<a name="initializing_immutable"></a>
### Initialize Immutable Resolutions
[Back to Top](#api)

A **Resolution** object can be created the same way a `Promise` can:

  * **Resolution( _fn_ )**

  * `fn` - _Function_ - Function which will resolve or reject the **Resolution.**  Has the following `arguments`:

    * `resolve` - _Function_ - Function to **resolve** this **Resolution** with the given **value**

    * `reject`  - _Function_ - Function to **reject** this **Resolution** with the given **value**
	
_Note :_
  * An `error` will be thrown if `fn` is not a function
  
**Examples**

Can be invoked with or without the `new` keyword

```javascript
var res = Resolution(function( resolve, reject ){
  resolve( 100 );
})
//res.state = 'fulfilled'
//res.value = 100

var res = new Resolution(function( resolve, reject ){
  reject( 0 );
})
//res.state = 'rejected'
//res.value = 0

var res = Resolution(function(){})
//res.state = 'pending'
//res.value = undefined
```

Only the first invocation of **resolve** or **reject** will have any effect

```javascript
var res = Resolution(function( resolve, reject ){
  resolve( 100 );
  reject( 0 );
})
//res.state = 'fulfilled'
//res.value = 100
```

Invoking **resolve** or **reject** the **Resolution** asynchronously will not have any effect

```javascript
var res = Resolution(function( resolve, reject ){
  setTimeout(function(){
    resolve( 100 );
  },1000)
})

//Immediately:
//res.state = 'pending'
//res.value = undefined

// > 1000 ms later:
//res.state = 'pending'
//res.value = undefined
```

Any `errors` thrown during the execution of `fn` will automatically `reject` the **Resolution** with the `error` as the **value**
  * Unless the **Resolution** was **resolved** or **rejected** before the `error` was thrown

```javascript
var res = Resolution(function( resolve, reject ){
  throw new Error()
})
//res.state = 'rejected'
//res.value = Error

var res = Resolution(function( resolve, reject ){
  resolve( 100 );
  throw new Error()
})
//res.state = 'fulfilled'
//res.value = 100
```
---
A **Resolution** Object can also be initialized into a specific **state**:

  * **Resolution.resolve( _value_ )**

  * **Resolution.reject( _value_ )**

  * **Resolution.pending( _value_ )**

    * **value** - _Any_ - The **value** associated with this **Resolution** Object

**Examples**
```javascript
var res = Resolution.resolve(100)
//res.state = 'fulfilled'
//res.value = 100

var res = Resolution.reject(0)
//res.state = 'rejected'
//res.value = 0

var res = Resolution.pending(50)
//res.state = 'pending'
//res.value = 50
```
---
<a name="immutable_instance_methods"></a>
**Immutable Instance Methods**

[Back to Top](#api)

As with `Promises`, a **Resolution** Object can automatically invoke functions based on the **state*8

  * **then( _onResolve_, _onReject_ )**
  
    * `onResolve` - _Function_ - Function to run if this **Resolution** Object is **resolved**.
  
    * `onReject`  - _Function_ - Function to run if this **Resolution** Object is **rejected**.
  
For both, the input `argument` is the **value** of this **Resolution** Object

Returns a new **Resolution** Object **resolved** to the return value of the `callback` function.
  * If the `callback` function was not invoked, then the **state** and **value** of the new **Resolution** Object will match this **Resolution** Object
  * If the `callback` function throws an `error`, then the new **Resolution** Object will be **rejected** with that error.

**Examples**
  
```javascript
var res = Resolution(function( resolve, reject ){
  resolve( 100 );
})
.then(function( value ){
  console.log('Resolved to ' + value);
},function( value ){
  console.log('Rejected to ' + value);
});
//Resolved to 100

var res = Resolution(function( resolve, reject ){
  reject( 0 );
})
.then(function( value ){
  console.log('Resolved to ' + value);
},function( value ){
  console.log('Rejected to ' + value);
});
//Rejected to 0
```

Because it returns a new **Resolution** Object, the **then**'s can be chained

```javascript

var res = Resolution.resolve(100)
.then(function( value ){
  return value-1;
})
.then(function( value ){
  console.log('Resolved to ' + value);
});
//Resolved to 99

var res = Resolution.resolve(100)
.then(function(){
  throw new Error()
})
.then(function( value ){
  console.log('Resolved');
},function( value ){
  console.log('Error')
});
//Error
```
---
  * **catch( _onReject_ )**
    
    * `onReject`  - _Function_ - Function to run if this **Resolution** Object is **rejected**.
  
The input `argument` is the **value** of this **Resolution** Object

Returns a new **Resolution** Object **resolved** to the return value of the `callback` function.
  * If the `callback` function was not invoked, then the **state** and **value** of the new **Resolution** Object will match this **Resolution** Object
  * If the `callback` function throws an `error`, then the new **Resolution** Object will be **rejected** with that error.

Equivalent to calling `then( undefined, onReject )`

**Examples**

```javascript
var res = Resolution.reject(0)
.catch(function( value ){
  console.log('Rejected to ' + value);
});
//Rejected to 0

var res = Resolution.reject(0)
.then(function( value ){
  console.log('Resolved to ' + value);
})
.catch(function( value ){
  console.log('Rejected to ' + value);
});
//Rejected to 0

var res = Resolution.resolve(100)
.catch(function( value ){
  console.log('Rejected to ' + value);
})
.then(function( value ){
  console.log('Resolved to ' + value);
});
//Resolved to 100

var res = Resolution.resolve(100)
.then(function( value ){
  throw new Error();
})
.catch(function( value ){
  console.log('Error');
});
//Error
```

<a name="initializing_mutable"></a>
### Initialize Mutable Resolutions
[Back to Top](#api)

A **Mutable Resolution** Object follows the same principals as an **Immutable Resolution** Object when initializing.

[See here for Initializing Immutable Resolutions](#initializing_immutable)

  * **Resolution.Mutable( _fn_ )**

The only difference between a **Mutable Resolution** and **Immutable Resolution** Objects during initialization is that the state of a **Mutable Resolution** Object can be set more than once or asynchronously.

```javascript
var res = Resolution.Mutable(function( resolve, reject ){
	resolve(100);
	reject(0);
})
//res.state = 'rejected'
//res.value = 0

var res = Resolution.Mutable(function( resolve, reject ){
	setTimeout(function(){
		resolve( 100 );
	},1000);
})

//Immediately:
//res.state = 'pending'
//res.value = undefined

// > 1000 ms later:
//res.state = 'fulfilled'
//res.value = 1000
```

And as with **Immutable Resolution** Objects, **Mutable Resolution** Objects can be initialized in a specific **state**

  * **Resolution.Mutable.resolve( _value_ )**

  * **Resolution.Mutable.reject( _value_ )**

  * **Resolution.Mutable.pending( _value_ )**

    * **value** - _Any_ - The **value** associated with this **Resolution** Object

---
<a name="mutable_instance_methods"></a>
**Mutable Instance Methods**

[Back to Top](#api)

A **Mutable Resolution** Object also contains **then** and **catch** ([described here](#immutable_instance_methods))

Note that **then** and **catch** are invoked immediately based on the **state** of the **Resolution** Object as that instant.

If the **state** later changes, these will not be retroactively invoked.

To have callbacks be invoked upon a **state** change, use the **on** method (see below)

**Mutable Resolution** Objects contain the following additional methods:

  * **resolve( _value_ )**
    * To **resolve** this **Resolution** with the given **value**
  
  * **reject( _value_ )** 
    * To **reject** this **Resolution** with the given **value**
  
  * **reset( _value_ )** 
    * To **reset** this **Resolution** to **pending** with the given **value**

If no **value** is provided, then the current **value** of this **Resolution** will not change
	
```javascript
var res = Resolution.Mutable.resolve( 100 );
//res.state = 'fulfilled'
//res.value = 100

res.reject( 0 );
//res.state = 'rejected'
//res.value = 0

res.reset( 50 );
//res.state = 'pending'
//res.value = 50

res.resolve();
//res.state = 'fulfilled'
//res.value = 50
```
---

Callbacks can also be connected to the **state** of the **Mutable Resolution** Object

  *  **on( _which_, _fn_[, _once_ ])**
    
    * `which` - _String_   - Name of the state change function to connect the callback `fn` to
      *  Either `'resolve'`, `'reject'`, or `'reset'`
    
    * `fn`    - _Function_ - The Callback Function to run whenever the desired state change function is called
      * Input argument is the **value** of this **Resolution**
	
    * `once`  - _Boolean_  - Whether the `fn` should only be called one time

**Examples**

```javascript
var res = Resolution.Mutable.pending( 100 );

res.on('resolve', function( data ){
  console.log('Always : ' + data)
})

res.on('resolve', function( data ){
  console.log('Once : ' + data)
}, true)

res.resolve(100);
//Always : 100
//Once : 100

res.resolve(50);
//Always : 50
```
  
<a name="class_methods"></a>
### Class Methods
[Back to Top](#api)

Just like `Promises`, the **Resolution** Class has some methods to handle arrays (or other iterable objects) of **Resolution** Objects

  * **all( _iterable_ )**

    * `iterable` - _iterable_   - Object to iterate through

Returns a new **Resolution** Object that is:
  * **rejected** if no `iterable` object was provided
    * **value** will be an `Error`
  * **resolved** if there are no **pending** or **rejected** **Resolution** Objects in the `iterable`
    * **value** will be array of consisting of all values (or **Resolution** Object **values**) in the array
  * **rejected** if there are any **rejected** **Resolution** Objects in the `iterable`
    * **value** will be the **value** of the first **rejected** **Resolution** in the `iterable`
  * **pending** if there are any **pending** **Resolution** Objects in the `iterable`
    * **value** will be `undefined`
  
**Examples**
```javascript
var res = Resolution.all()
//res.state = 'rejected'
//res.value = Error

var res = Resolution.all([])
//res.state = 'fulfilled'
//res.value = []

var res = Resolution.all([Resolution.resolve(100),50])
//res.state = 'fulfilled'
//res.value = [100,50]

var res = Resolution.all([Resolution.resolve(100),Resolution.reject(0)])
//res.state = 'rejected'
//res.value = 0

var res = Resolution.all([Resolution.resolve(100),Resolution.pending(50)])
//res.state = 'pending'
//res.value = undefined
```
---
  * **race( _iterable_ )**

    * `iterable` - _iterable_   - Object to iterate through

Returns a new **Resolution** Object that is:
  * **rejected** with an `Error` if no `iterable` object was provided
  * **resolved** if the first element in the `iterable` that is not a **pending** **Resolution** Object in the `iterable` is also not a **rejected** **Resolution** Object
    * **value** is the value of that element
  * **rejected** if the first element in the `iterable` that is not a **pending** **Resolution** Object in the `iterable` is a **rejected** **Resolution** Object
    * **value** is the value of that **rejected** **Resolution** Object
  * **pending** with `undefined` if the `iterable` is empty or every element in the `iterable` is a **pending** **Resolution** Object
  
**Examples**
```javascript
var res = Resolution.race()
//res.state = 'rejected'
//res.value = Error

var res = Resolution.race([])
//res.state = 'pending'
//res.value = undefined

var res = Resolution.race([Resolution.pending(50)])
//res.state = 'pending'
//res.value = undefined

var res = Resolution.race([Resolution.resolve(100),50])
//res.state = 'fulfilled'
//res.value = 100

var res = Resolution.race([50,Resolution.resolve(100)])
//res.state = 'fulfilled'
//res.value = 50

var res = Resolution.race([Resolution.resolve(100),Resolution.reject(0)])
//res.state = 'fulfilled'
//res.value = 100

var res = Resolution.race([Resolution.reject(0),Resolution.resolve(100)])
//res.state = 'rejected'
//res.value = 0

var res = Resolution.race([Resolution.pending(50),Resolution.resolve(100)])
//res.state = 'fulfilled'
//res.value = 100
```
---
## License

### MIT