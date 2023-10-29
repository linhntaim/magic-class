# magic-class

[![NPM version](https://img.shields.io/npm/v/magic-class.svg?style=flat-square)](https://www.npmjs.com/package/magic-class)
[![Travis (.org)](https://img.shields.io/travis/com/linhntaim/magic-class?style=flat-square)](https://app.travis-ci.com/github/linhntaim/magic-class)
[![Coveralls github](https://img.shields.io/coveralls/github/linhntaim/magic-class?style=flat-square)](https://coveralls.io/github/linhntaim/magic-class)
[![NPM](https://img.shields.io/npm/l/magic-class?style=flat-square)](https://github.com/linhntaim/magic-class/blob/master/LICENSE)

Activate PHP-like magic methods in Javascript classes and instances.

---

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
    - [Magic methods](#magic-methods)
        - [`__set`](#__set)
        - [`__get`](#__get)
        - [`__call`](#__call)
        - [`__invoke`](#__invoke)
        - [Method chaining](#method-chaining)
    - [Magic static methods](#magic-static-methods)
        - [Static `__set`](#static-__set)
        - [Static `__get`](#static-__get)
        - [Static `__call`](#static-__call)
        - [Static method chaining](#static-method-chaining)
    - [Operators](#operators)
        - [`in`](#in)
        - [`instanceof`](#instanceof)
        - [`delete`](#delete)
    - [Strict mode](#strict-mode)
    - Special static members
        - Static `__static` property
        - Static `__instance` method
        - Static `__singleton` method
    - Inheritance
    - Experimental
- [Documentation](#documentation)
    - `magic`
    - `MagicMixin`
    - `MagicClass`

---

## Installation

```bash
npm install magic-class --save
```

## Usage

- Use `magic` function *(recommended)*:

```javascript
const {magic} = require('magic-class')
/* or ES6 */

// import {magic} from 'magic-class'

class NormalClass
{
    static magicProps = {}

    static __set(prop, value) {
        this.magicProps[`static:${prop}`] = value
    }

    static __get(prop) {
        if (`static:${prop}` in this.magicProps) {
            return this.magicProps[`static:${prop}`]
        }
        if (prop.startsWith('call')) {
            return undefined
        }
        return `static:${prop}`
    }

    static __call(method, ...parameters) {
        return {method: `static:${method}`, parameters}
    }

    magicProps = {}

    constructor(normal) {
        this.normal = normal
    }

    __set(prop, value) {
        this.magicProps[prop] = value
    }

    __get(prop) {
        if (prop in this.magicProps) {
            return this.magicProps[prop]
        }
        if (prop.startsWith('call')) {
            return undefined
        }
        return prop
    }

    __call(method, ...parameters) {
        return {method, parameters}
    }

    __invoke(...parameters) {
        return {parameters}
    }
}

// Create magic class
const MagicClass = magic(NormalClass)
// magic static __set
MagicClass.magic = true
console.log(MagicClass.magicProps)          // (object) {'static:magic': true}
// magic static __get
console.log(MagicClass.magic)               // (boolean) true
console.log(MagicClass.any)                 // (string) 'static:any'
// magic static __call
console.log(MagicClass.callAny(true))       // (object) {method: 'static:callAny', parameters: [true]}

// Create magic instance
const magicInstance = new MagicClass('normal')
/* or */
// const magicInstance = magic(new NormalClass())
// magic __set
magicInstance.magic = true
console.log(magicInstance.magicProps)       // (object) {magic: true}
// magic __get
console.log(magicInstance.magic)            // (boolean) true
console.log(magicInstance.any)              // (string) 'any'
// magic __call
console.log(magicInstance.callAny(true))    // (object) {method: 'callAny', parameters: [true]}
// magic __invoke
console.log(magicInstance(true))            // (object) {parameters: [true]}
```

- Use `MagicMixin` function *(experimental)*:

```javascript
const {MagicMixin} = require('magic-class')
/* or ES6 */

// import {MagicMixin} from 'magic-class'

class NormalClass
{
    static magicProps = {}

    static __set(prop, value) {
        this.magicProps[`static:${prop}`] = value
    }

    static __get(prop) {
        if (`static:${prop}` in this.magicProps) {
            return this.magicProps[`static:${prop}`]
        }
        if (prop.startsWith('call')) {
            return undefined
        }
        return `static:${prop}`
    }

    static __call(method, ...parameters) {
        return {method: `static:${method}`, parameters}
    }

    magicProps = {}

    constructor(normal) {
        this.normal = normal
    }

    __set(prop, value) {
        this.magicProps[prop] = value
    }

    __get(prop) {
        if (prop in this.magicProps) {
            return this.magicProps[prop]
        }
        if (prop.startsWith('call')) {
            return undefined
        }
        return prop
    }

    __call(method, ...parameters) {
        return {method, parameters}
    }

    __invoke(...parameters) {
        return {parameters}
    }
}

// Create magic class
const MagicClass = MagicMixin(NormalClass)
// magic static __set
MagicClass.__static.magic = true
console.log(MagicClass.__static.magicProps)     // (object) {'static:magic': true}
// magic static __get
console.log(MagicClass.__static.magic)          // (boolean) true
console.log(MagicClass.__static.any)            // (string) 'static:any'
// magic static __call
console.log(MagicClass.__static.callAny(true))  // (object) {method: 'static:callAny', parameters: [true]}

// Create magic instance
const magicInstance = MagicClass.__instance('normal')
// magic __set
magicInstance.magic = true
console.log(magicInstance.magicProps)           // (object) {magic: true}
// magic __get
console.log(magicInstance.magic)                // (boolean) true
console.log(magicInstance.any)                  // (string) 'any'
// magic __call
console.log(magicInstance.callAny(true))        // (object) {method: 'callAny', parameters: [true]}
// magic __invoke
console.log(magicInstance(true))                // (object) {parameters: [true]}
```

- Use `MagicClass` class *(experimental)*:

```javascript
const {MagicClass} = require('magic-class')
/* or ES6 */

// import {MagicMixin} from 'magic-class'

class NormalClass extends MagicClass
{
    static magicProps = {}

    static __set(prop, value) {
        this.magicProps[`static:${prop}`] = value
    }

    static __get(prop) {
        if (`static:${prop}` in this.magicProps) {
            return this.magicProps[`static:${prop}`]
        }
        if (prop.startsWith('call')) {
            return undefined
        }
        return `static:${prop}`
    }

    static __call(method, ...parameters) {
        return {method: `static:${method}`, parameters}
    }

    magicProps = {}

    constructor(normal) {
        super()

        this.normal = normal
    }

    __set(prop, value) {
        this.magicProps[prop] = value
    }

    __get(prop) {
        if (prop in this.magicProps) {
            return this.magicProps[prop]
        }
        if (prop.startsWith('call')) {
            return undefined
        }
        return prop
    }

    __call(method, ...parameters) {
        return {method, parameters}
    }

    __invoke(...parameters) {
        return {parameters}
    }
}

// Create magic class
NormalClass.__magic()
// magic static __set
NormalClass.__static.magic = true
console.log(NormalClass.__static.magicProps)     // (object) {'static:magic': true}
// magic static __get
console.log(NormalClass.__static.magic)          // (boolean) true
console.log(NormalClass.__static.any)            // (string) 'static:any'
// magic static __call
console.log(NormalClass.__static.callAny(true))  // (object) {method: 'static:callAny', parameters: [true]}

// Create magic instance
const magicInstance = NormalClass.__instance('normal')
// magic __set
magicInstance.magic = true
console.log(magicInstance.magicProps)           // (object) {magic: true}
// magic __get
console.log(magicInstance.magic)                // (boolean) true
console.log(magicInstance.any)                  // (string) 'any'
// magic __call
console.log(magicInstance.callAny(true))        // (object) {method: 'callAny', parameters: [true]}
// magic __invoke
console.log(magicInstance(true))                // (object) {parameters: [true]}
```

## Features

### Magic methods

#### `__set`

`__set` is run when writing data to non-existing instance's properties.

```javascript
const {magic} = require('magic-class')
/* or ES6 */

// import {magic} from 'magic-class'

class NormalClass
{
    magicProps = {}

    constructor(normal) {
        this.normal = normal
    }

    __set(prop, value) {
        this.magicProps[prop] = value
    }
}

const MagicClass = magic(NormalClass)
const magicInstance = new MagicClass('normal')

// existing prop
console.log(magicInstance.normal)       // (string) 'normal'
magicInstance.normal = 'new value'
console.log(magicInstance.normal)       // (string) 'new value'
// non-existing prop
try {
    console.log(magicInstance.magic)
}
catch (e) {
    console.log(e.message)              // (string) 'Property [magic] does not exist.'
}
magicInstance.magic = true
try {
    console.log(magicInstance.magic)
}
catch (e) {
    console.log(e.message)              // (string) 'Property [magic] does not exist.'
}
console.log(magicInstance.magicProps)   // (object) {magic: true}
```

***Note:* While magic is activated (in default strict mode and without magic `__get`/`__call` methods),
accessing non-existing properties will throw `ReferenceError` instead of getting `undefined`.

#### `__get`

`__get` is run when reading data from non-existing instance's properties.

```javascript
const {magic} = require('magic-class')
/* or ES6 */

// import {magic} from 'magic-class'

class NormalClass
{
    constructor(normal) {
        this.normal = normal
    }

    __get(prop) {
        if (prop.startsWith('call')) {
            return undefined
        }
        return `magic:${prop}`
    }
}

const MagicClass = magic(NormalClass)
const magicInstance = new MagicClass('normal')

// existing prop
console.log(magicInstance.normal)       // (string) 'normal'
// non-existing prop
console.log(magicInstance.value)        // (string) 'magic:value'
console.log(magicInstance.any)          // (string) 'magic:any'
try {
    console.log(magicInstance.callAny)
}
catch (e) {
    console.log(e.message)              // (string) 'Property [callAny] does not exist.'
}
```

***Note:* While magic is activated (in default strict mode and without magic `__call` method),
accessing non-existing properties will throw `ReferenceError` when magic `__get` returns `undefined`.

#### `__call`

`__call` is run when calling non-existing instance's properties as function
while magic `__get` is not defined or magic `__get` returns `undefined`.

```javascript
const {magic} = require('magic-class')
/* or ES6 */
// import {magic} from 'magic-class'

/* magic `__get` is not defined */
class NormalClass1
{
    constructor(normal) {
        this.normal = normal
    }

    __call(method, ...parameters) {
        return {method, parameters}
    }
}

const MagicClass1 = magic(NormalClass1)
const magicInstance1 = new MagicClass1('normal')

// existing prop
console.log(magicInstance1.normal)       // (string) 'normal'
// non-existing prop
console.log(magicInstance1.any)          // (function)
console.log(magicInstance1.value(1))     // (object) {method: 'value', parameters: [1]}

/* magic `__get` returns `undefined` in some cases */
class NormalClass2
{
    constructor(normal) {
        this.normal = normal
    }

    __get(prop) {
        if (prop.startsWith('call')) {
            return undefined
        }
        return `magic:${prop}`
    }

    __call(method, ...parameters) {
        return {method, parameters}
    }
}

const MagicClass2 = magic(NormalClass2)
const magicInstance2 = new MagicClass2('normal')

// existing prop
console.log(magicInstance2.normal)          // (string) 'normal'
// non-existing prop
console.log(magicInstance2.any)             // (string) 'magic:any'
try {
    console.log(magicInstance2.value(1))
}
catch (e) {
    console.log(e.message)                  // (string) 'magicInstance2.value is not a function'
}
console.log(magicInstance2.callValue(1))    // (object) {method: 'callValue', parameters: [1]}
```

***Note:* If magic `__get` never returns `undefined`, magic `__call` is also never run.

#### `__invoke`

`__invoke` is run when calling instance as a function.

```javascript
const {magic} = require('magic-class')
/* or ES6 */

// import {magic} from 'magic-class'

class NormalClass
{
    constructor(normal) {
        this.normal = normal
    }

    __invoke(parameters) {
        return {parameters}
    }
}

const MagicClass = magic(NormalClass)
const magicInstance = new MagicClass('normal')

console.log(magicInstance(1))   // (object) {parameters: [1]}
```

#### Method chaining

```javascript
const {magic} = require('magic-class')
/* or ES6 */

// import {magic} from 'magic-class'

class NormalClass
{
    chain = []

    constructor(...parameters) {
        this.push(...parameters.map(p => `construct:${p}`))
    }

    push(...parameters) {
        this.chain.push(...parameters)
        return this
    }

    __get(prop) {
        if (prop.startsWith('call')) {
            return undefined
        }
        if (prop === 'self') {
            return this
        }
        return this.push(`get:${prop}`)
    }

    __call(method, ...parameters) {
        if (['callInsert', 'callAdd'].includes(method)) {
            return this.push(...parameters.map(p => `${method}:${p}`))
        }
        return this.push(`call:${method}`)
    }

    __invoke(...parameters) {
        return this.push(...parameters.map(p => `invoke:${p}`))
    }
}

const MagicClass = magic(NormalClass)
// Chain: (constructor)->(magic __invoke)->(existing method)->(magic __call)->(magic __get)->(existing prop)
const magicChain = (new MagicClass(0))(1).push(2).callInsert(3).callAdd(4).callAny(5).any.self.chain
console.log(magicChain) // (array) ['construct:0', 'invoke:1', 2, 'callInsert:3', 'callAdd:4', 'call:callAny', 'get:any']
```

### Magic static methods

#### Static `__set`

Static `__set` is run when writing data to non-existing class's properties.

```javascript
const {magic} = require('magic-class')
/* or ES6 */

// import {magic} from 'magic-class'

class NormalClass
{
    static normal = 'normal'

    static magicProps = {}

    static __set(prop, value) {
        this.magicProps[prop] = value
    }
}

const MagicClass = magic(NormalClass)

// existing prop
console.log(MagicClass.normal)       // (string) 'normal'
MagicClass.normal = 'new value'
console.log(MagicClass.normal)       // (string) 'new value'
// non-existing prop
try {
    console.log(MagicClass.magic)
}
catch (e) {
    console.log(e.message)              // (string) 'Static property [magic] does not exist.'
}
MagicClass.magic = true
try {
    console.log(MagicClass.magic)
}
catch (e) {
    console.log(e.message)              // (string) 'Static property [magic] does not exist.'
}
console.log(MagicClass.magicProps)   // (object) {magic: true}
```

***Note:* While magic is activated (in default strict mode and without magic static `__get`/`__call` methods),
accessing non-existing properties will throw `ReferenceError` instead of getting `undefined`.

#### Static `__get`

Static `__get` is run when reading data from non-existing class's properties.

```javascript
const {magic} = require('magic-class')
/* or ES6 */

// import {magic} from 'magic-class'

class NormalClass
{
    static normal = 'normal'

    static __get(prop) {
        if (prop.startsWith('call')) {
            return undefined
        }
        return `magic:${prop}`
    }
}

const MagicClass = magic(NormalClass)

// existing prop
console.log(MagicClass.normal)       // (string) 'normal'
// non-existing prop
console.log(MagicClass.value)        // (string) 'magic:value'
console.log(MagicClass.any)          // (string) 'magic:any'
try {
    console.log(MagicClass.callAny)
}
catch (e) {
    console.log(e.message)              // (string) 'Static property [callAny] does not exist.'
}
```

***Note:* While magic is activated (in default strict mode and without magic static `__call` method),
accessing non-existing properties will throw `ReferenceError` 
when magic static `__get` returns `undefined`.

#### Static `__call`

Static `__call` is run when calling non-existing class's properties as function
while magic static `__get` is not defined or magic static `__get` returns `undefined`.

```javascript
const {magic} = require('magic-class')
/* or ES6 */
// import {magic} from 'magic-class'

/* magic `__get` is not defined */
class NormalClass1
{
    static normal = 'normal'

    static __call(method, ...parameters) {
        return {method, parameters}
    }
}

const MagicClass1 = magic(NormalClass1)

// existing prop
console.log(MagicClass1.normal)         // (string) 'normal'
// non-existing prop
console.log(MagicClass1.any)            // (function)
console.log(MagicClass1.value(1))       // (object) {method: 'value', parameters: [1]}

/* magic `__get` returns `undefined` in some cases */
class NormalClass2
{
    static normal = 'normal'

    static __get(prop) {
        if (prop.startsWith('call')) {
            return undefined
        }
        return `magic:${prop}`
    }

    static __call(method, ...parameters) {
        return {method, parameters}
    }
}

const MagicClass2 = magic(NormalClass2)

// existing prop
console.log(MagicClass2.normal)         // (string) 'normal'
// non-existing prop
console.log(MagicClass2.any)            // (string) 'magic:any'
try {
    console.log(MagicClass2.value(1))
}
catch (e) {
    console.log(e.message)              // (string) 'MagicClass2.value is not a function'
}
console.log(MagicClass2.callValue(1))   // (object) {method: 'callValue', parameters: [1]}
```

***Note:* If magic static `__get` never returns `undefined`, magic static `__call` is also never run.

#### Static method chaining

It is possible to call magic static methods in a chain.

```javascript
const {magic} = require('magic-class')
/* or ES6 */

// import {magic} from 'magic-class'

class NormalClass
{
    static chain = [0]

    static push(...parameters) {
        this.chain.push(...parameters)
        return this
    }

    static __get(prop) {
        if (prop.startsWith('call')) {
            return undefined
        }
        if (prop === 'self') {
            return this
        }
        return this.push(`get:${prop}`)
    }

    static __call(method, ...parameters) {
        if (['callInsert', 'callAdd'].includes(method)) {
            return this.push(...parameters.map(p => `${method}:${p}`))
        }
        return this.push(`call:${method}`)
    }
}

const MagicClass = magic(NormalClass)
// Chain: (class)->(existing static method)->(magic static __call)->(magic static __get)->(existing static prop)
const magicChain = MagicClass.push(1).callInsert(2).callAdd(3).callAny(4).any.self.chain
console.log(magicChain) // (array) [0, 1, 'callInsert:2', 'callAdd:3', 'call:callAny', 'get:any']
```

### Operators

#### `in`

While magic is activated, the `in` operator works as follows:

- Instances:
    - If the property is existing, it results `true`.
    - If the magic `__call` is defined, it always results `true`.
    - If the property is not existing and the magic `__get` is defined when the magic `__call` is not,
      and the value returned from the magic `__get` for this property is not `undefined`,
      it results `true`.
    - Other cases, it results `false`.
- Classes:
    - If the static property is existing, it results `true`.
    - If the magic static `__call` is defined, it always results `true`.
    - If the static property is not existing and the magic static `__get` is defined
      when magic static `__call` is not, and the value returned from the magic `__get`
      for this property is not `undefined`, it results `true`.
    - Other cases, it results `false`.

```javascript
const {magic} = require('magic-class')
/* or ES6 */
// import {magic} from 'magic-class'

/* no magic __call or __get */
class NormalClass1
{
    normal = 'normal'
}

const MagicClass1 = magic(NormalClass1)
const magicInstance1 = new MagicClass1()
// existing prop
console.log('normal' in magicInstance1)  // true
// non-existing props
console.log('any' in magicInstance1)     // false
console.log('magic' in magicInstance1)   // false

/* magic __call is defined -> `in` -> always true */
class NormalClass2
{
    normal = 'normal'

    __call() {
    }
}

const MagicClass2 = magic(NormalClass2)
const magicInstance2 = new MagicClass2()
// existing prop
console.log('normal' in magicInstance2)  // true
// non-existing props
console.log('any' in magicInstance2)     // true
console.log('magic' in magicInstance2)   // true

/* magic __get is defined, __call is not */
class NormalClass3
{
    normal = 'normal'

    __get(prop) {
        if (prop === 'magic') {
            return 'magic'
        }
        return undefined
    }
}

const MagicClass3 = magic(NormalClass3)
const magicInstance3 = new MagicClass3()
// existing prop
console.log('normal' in magicInstance3)  // true
// non-existing props
console.log('any' in magicInstance3)     // false
console.log('magic' in magicInstance3)   // true
```

#### `instanceof`

Technically, **the class after the magic is activated (which is a proxy object)** is different from 
the original class, but their constructors are the same. So, the `instanceof` operator 
should work normally as usual.

```javascript
const {magic} = require('magic-class')
/* or ES6 */
// import {magic} from 'magic-class'

class ParentClass
{
}

class NormalClass extends ParentClass
{
    __get(prop) {
        return prop
    }
}

const MagicClass = magic(NormalClass)

const normalInstance = new NormalClass()
const magicInstance = new MagicClass()

console.log(normalInstance instanceof MagicClass)   // (boolean) true
console.log(normalInstance instanceof NormalClass)  // (boolean) true
console.log(normalInstance instanceof ParentClass)  // (boolean) true
// `instanceof MagicClass = true` but no magic
console.log(normalInstance.value)                   // (undefined) undefined

console.log(magicInstance instanceof MagicClass)    // (boolean) true
console.log(magicInstance instanceof NormalClass)   // (boolean) true
console.log(magicInstance instanceof ParentClass)   // (boolean) true
// Magic!
console.log(magicInstance.value)                    // (string) 'value'
```

#### `delete`

While magic is activated in default strict mode, properties cannot be deleted.
`TypeError` will be thrown if you try to do it.

```javascript
const {magic} = require('magic-class')
/* or ES6 */
// import {magic} from 'magic-class'

class NormalClass
{
    static normal = 'normal'
    
    normal = 'normal'
}

// Static properties
const MagicClass = magic(NormalClass)
// existing prop
try {
    delete MagicClass.normal
}
catch (e) {
    console.log(e.message) // (string) 'Cannot delete static property [normal]'
}
console.log('normal' in MagicClass) // true
// non-existing prop
try {
    delete MagicClass.magic
}
catch (e) {
    console.log(e.message) // (string) 'Cannot delete static property [magic]'
}
console.log('magic' in MagicClass) // false

// Instance properties
const magicInstance = new MagicClass()
// existing prop
try {
    delete magicInstance.normal
}
catch (e) {
    console.log(e.message) // (string) 'Cannot delete property [normal]'
}
console.log('normal' in magicInstance) // true
// non-existing prop
try {
    delete magicInstance.magic
}
catch (e) {
    console.log(e.message) // (string) 'Cannot delete property [magic]'
}
console.log('magic' in magicInstance) // false
```

***Note:* Even when the strict mode is off, you can delete only existing properties. 
Deleting non-existing properties (something like magic `__delete`) is not supported 
(yet - maybe it's not necessary?).

### Strict mode

## Documentation
