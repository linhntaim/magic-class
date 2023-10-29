# magic-class

[![NPM version](https://img.shields.io/npm/v/magic-class.svg?style=flat-square)](https://www.npmjs.com/package/magic-class)
[![Travis (.org)](https://img.shields.io/travis/com/linhntaim/magic-class?style=flat-square)](https://app.travis-ci.com/github/linhntaim/magic-class)
[![Coveralls github](https://img.shields.io/coveralls/github/linhntaim/magic-class?style=flat-square)](https://coveralls.io/github/linhntaim/magic-class)
[![NPM](https://img.shields.io/npm/l/magic-class?style=flat-square)](https://github.com/linhntaim/magic-class/blob/master/LICENSE)

Description.

---

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
    - [Magic methods](#magic-methods)
        - [`__set`](#set)
        - [`__get`](#get)
        - [`__call`](#call)
        - [`__invoke`](#invoke)
    - Magic static methods
        - Static `__set`
        - Static `__get`
        - Static `__call`
    - Special static members
        - Static `__static` property
        - Static `__instance` method
        - Static `__singleton` method
    - [Strict mode](#strict-mode)
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

`__call` is run when accessing non-existing instance's properties 
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

***Note:* When magic `__get` never returns `undefined`, magic `__call` is also never run.

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

### Strict mode

## Documentation
