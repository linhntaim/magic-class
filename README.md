# magic-class

[![NPM version](https://img.shields.io/npm/v/magic-class.svg?style=flat-square)](https://www.npmjs.com/package/magic-class)
[![Github Actions](https://img.shields.io/github/actions/workflow/status/linhntaim/magic-class/build.yml?style=flat-square)](https://github.com/linhntaim/magic-class/actions/workflows/build.yml)
[![Coveralls](https://img.shields.io/coveralls/github/linhntaim/magic-class?style=flat-square)](https://coveralls.io/github/linhntaim/magic-class)
[![License](https://img.shields.io/npm/l/magic-class?style=flat-square)](https://github.com/linhntaim/magic-class/blob/master/LICENSE)

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
        - [`__has`](#__has)
        - [`__delete`](#__delete)
        - [Method chaining](#method-chaining)
    - [Magic static methods](#magic-static-methods)
        - [Static `__set`](#static-__set)
        - [Static `__get`](#static-__get)
        - [Static `__call`](#static-__call)
        - [Static `__has`](#static-__has)
        - [Static `__delete`](#static-__delete)
        - [Static method chaining](#static-method-chaining)
    - [Prototype operations](#prototype-operations)
    - [Strict mode](#strict-mode)
    - [Special magic static methods](#special-magic-static-methods)
        - [Static `__instance`](#static-__instance)
        - [Static `__singleton`](#static-__singleton)
    - [Inheritance](#inheritance)

---

## Installation

```bash
npm install magic-class --save
```

## Usage

```javascript
const magic = require('magic-class')
/* or ES6 */
// import magic from 'magic-class'

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

## Features

### Magic methods

#### `__set`

`__set` is run when writing data to non-existing properties.

```javascript
const magic = require('magic-class')
/* or ES6 */
// import magic from 'magic-class'

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

***Note:*

- While magic is activated in default [strict mode](#strict-mode)
  and without magic `__get`/`__call` methods, accessing non-existing properties
  will throw `ReferenceError` exception instead of getting `undefined`.
- While magic is activated in default [strict mode](#strict-mode),
  writing data to non-existing properties will throw `ReferenceError` exception.

#### `__get`

`__get` is run when reading data from non-existing properties.

```javascript
const magic = require('magic-class')
/* or ES6 */
// import magic from 'magic-class'

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

***Note:* While magic is activated in default [strict mode](#strict-mode) and
without magic `__call` method, accessing non-existing properties
will throw `ReferenceError` exception when magic `__get` returns `undefined`.

#### `__call`

`__call` is run when calling non-existing properties as function
while magic `__get` is not declared or magic `__get` returns `undefined`.

```javascript
const magic = require('magic-class')
/* or ES6 */
// import magic from 'magic-class'

/* magic `__get` is not declared */
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
const magic = require('magic-class')
/* or ES6 */
// import magic from 'magic-class'

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

#### `__has`

`__has` is run when checking existence of non-existing properties.

```javascript
const magic = require('magic-class')
/* or ES6 */
// import magic from 'magic-class'

class NormalClass
{
    constructor(normal) {
        this.normal = normal
    }

    __has(prop) {
        if (prop === 'magic') {
            return true
        }
        return false
        /* or */
        // return // returning nothing means returning `false`
    }
}

const MagicClass = magic(NormalClass)
const magicInstance = new MagicClass('normal')

// existing prop
console.log('normal' in magicInstance)      // (boolean) true
// non-existing prop
console.log('magic' in magicInstance)       // (boolean) true
console.log('other' in magicInstance)       // (boolean) false
```

***Note:* Magic `__has` has a fallback of returning `false` in case it returns nothing.

#### `__delete`

`__delete` is run when deleting non-existing properties.

```javascript
const magic = require('magic-class')
/* or ES6 */
// import magic from 'magic-class'

class NormalClass
{
    magicProps = {
        magic: true,
    }

    constructor(normal) {
        this.normal = normal
    }

    __delete(prop) {
        return delete this.magicProps[prop]
    }
}

const MagicClass = magic(NormalClass)
const magicInstance = new MagicClass('normal')

// existing prop
try {
    console.log(delete magicInstance.normal)
}
catch (e) {
    console.log(e.message)                          // (string) 'Cannot delete property [normal].'
}
// non-existing props
console.log('magic' in magicInstance.magicProps)    // (boolean) true
console.log(delete magicInstance.magic)             // (boolean) true
console.log('magic' in magicInstance.magicProps)    // (boolean) false
console.log('other' in magicInstance.magicProps)    // (boolean) false
console.log(delete magicInstance.other)             // (boolean) true
console.log('other' in magicInstance.magicProps)    // (boolean) false
```

***Note:*

- While magic is activated in default [strict mode](#strict-mode), deleting existing properties
  throws `TypeError` exception.
- Magic `__delete` has a fallback of returning `true` in case it returns nothing.

#### Method chaining

```javascript
const magic = require('magic-class')
/* or ES6 */
// import magic from 'magic-class'

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

Static `__set` is run when writing data to non-existing static properties.

```javascript
const magic = require('magic-class')
/* or ES6 */
// import magic from 'magic-class'

class NormalClass
{
    static normal = 'normal'

    static magicProps = {}

    static __set(prop, value) {
        this.magicProps[prop] = value
    }
}

const MagicClass = magic(NormalClass)

// existing static prop
console.log(MagicClass.normal)      // (string) 'normal'
MagicClass.normal = 'new value'
console.log(MagicClass.normal)      // (string) 'new value'
// non-existing static prop
try {
    console.log(MagicClass.magic)
}
catch (e) {
    console.log(e.message)          // (string) 'Static property [magic] does not exist.'
}
MagicClass.magic = true
try {
    console.log(MagicClass.magic)
}
catch (e) {
    console.log(e.message)          // (string) 'Static property [magic] does not exist.'
}
console.log(MagicClass.magicProps)  // (object) {magic: true}
```

***Note:*

- While magic is activated in default [strict mode](#strict-mode) and
  without magic static `__get`/`__call` methods, accessing non-existing static properties
  will throw `ReferenceError` exception instead of getting `undefined`.
- While magic is activated in default [strict mode](#strict-mode),
  writing data to non-existing static properties will throw `ReferenceError` exception.

#### Static `__get`

Static `__get` is run when reading data from non-existing static properties.

```javascript
const magic = require('magic-class')
/* or ES6 */
// import magic from 'magic-class'

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

// existing static prop
console.log(MagicClass.normal)      // (string) 'normal'
// non-existing static props
console.log(MagicClass.value)       // (string) 'magic:value'
console.log(MagicClass.any)         // (string) 'magic:any'
try {
    console.log(MagicClass.callAny)
}
catch (e) {
    console.log(e.message)          // (string) 'Static property [callAny] does not exist.'
}
```

***Note:* While magic is activated in default [strict mode](#strict-mode) and
without magic static `__call` method, accessing non-existing static properties
will throw `ReferenceError` exception when magic static `__get` returns `undefined`.

#### Static `__call`

Static `__call` is run when calling non-existing static properties as function
while magic static `__get` is not declared or magic static `__get` returns `undefined`.

```javascript
const magic = require('magic-class')
/* or ES6 */
// import magic from 'magic-class'

/* magic `__get` is not declared */
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

// existing static prop
console.log(MagicClass2.normal)         // (string) 'normal'
// non-existing static props
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

#### Static `__has`

Static `__has` is run when checking existence of non-existing static properties.

```javascript
const magic = require('magic-class')
/* or ES6 */
// import magic from 'magic-class'

class NormalClass
{
    static normal = 'normal'

    static __has(prop) {
        if (prop === 'magic') {
            return true
        }
        return false
        /* or */
        // return // returning nothing means returning `false`
    }
}

const MagicClass = magic(NormalClass)

// existing static prop
console.log('normal' in MagicClass)     // (boolean) true
// non-existing static props
console.log('magic' in MagicClass)      // (boolean) true
console.log('other' in MagicClass)      // (boolean) false
```

***Note:* Magic static `__has` has a fallback of returning `false` in case it returns nothing.

#### Static `__delete`

Static `__delete` is run when deleting non-existing static properties.

```javascript
const magic = require('magic-class')
/* or ES6 */
// import magic from 'magic-class'

class NormalClass
{
    static normal = 'normal'

    static magicProps = {
        magic: true,
    }

    static __delete(prop) {
        return delete this.magicProps[prop]
    }
}

const MagicClass = magic(NormalClass)

// existing static prop
try {
    console.log(delete MagicClass.normal)
}
catch (e) {
    console.log(e.message)                      // (string) 'Cannot delete property [normal].'
}
// non-existing static props
console.log('magic' in MagicClass.magicProps)   // (boolean) true
console.log(delete MagicClass.magic)            // (boolean) true
console.log('magic' in MagicClass.magicProps)   // (boolean) false
console.log('other' in MagicClass.magicProps)   // (boolean) false
console.log(delete MagicClass.other)            // (boolean) true
console.log('other' in MagicClass.magicProps)   // (boolean) false
```

***Note:*

- While magic is activated in default [strict mode](#strict-mode),
  deleting existing static properties throws `TypeError` exception.
- Magic static `__delete` has a fallback of returning `true` in case it returns nothing.

#### Static method chaining

It is possible to call magic static methods in a chain.

```javascript
const magic = require('magic-class')
/* or ES6 */
// import magic from 'magic-class'

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

### Prototype operations

Technically, **the class after the magic is activated (which is a proxy object)** is different from
the original class, but their prototypes are the same. So, operations by `getPrototypeOf` method,
`isPrototypeOf` method and the `instanceof` operator should work normally as usual.

```javascript
const magic = require('magic-class')
/* or ES6 */
// import magic from 'magic-class'

class GrandParentClass
{
}

class ParentClass extends GrandParentClass
{
}

class NormalClass extends ParentClass
{
    __get(prop) {
        return prop
    }
}

const MagicClass = magic(NormalClass)

/* getPrototypeOf */

console.log(Object.getPrototypeOf(NormalClass) === ParentClass) // (boolean) true
console.log(Object.getPrototypeOf(MagicClass) === ParentClass)  // (boolean) true

/* isPrototypeOf */

console.log(ParentClass.isPrototypeOf(NormalClass))             // (boolean) true
console.log(ParentClass.isPrototypeOf(MagicClass))              // (boolean) true
console.log(GrandParentClass.isPrototypeOf(NormalClass))        // (boolean) true
console.log(GrandParentClass.isPrototypeOf(MagicClass))         // (boolean) true

/* instanceof */

const normalInstance = new NormalClass()
const magicInstance = new MagicClass()
/* or */
// const magicInstance = magic(normalInstance)

console.log(normalInstance instanceof MagicClass)               // (boolean) true
console.log(normalInstance instanceof NormalClass)              // (boolean) true
console.log(normalInstance instanceof ParentClass)              // (boolean) true
console.log(normalInstance instanceof GrandParentClass)         // (boolean) true
// `instanceof MagicClass = true` but no magic
console.log(normalInstance.value)                               // (undefined) undefined

console.log(magicInstance instanceof MagicClass)                // (boolean) true
console.log(magicInstance instanceof NormalClass)               // (boolean) true
console.log(magicInstance instanceof ParentClass)               // (boolean) true
console.log(magicInstance instanceof GrandParentClass)          // (boolean) true
// Magic!
console.log(magicInstance.value)                                // (string) 'value'
```

### Strict mode

Strict mode is on by default while activating the magic. It will raise exceptions in following cases:

- Writing data to non-existing properties while magic `__set` is not declared.
- Reading data from non-existing properties while magic `__call` is not declared, and
  magic `__get` is not declared or returns `undefined`.
- Deleting existing properties.
- Writing data to non-existing static properties while magic static `__set` is not declared.
- Reading data from non-existing properties while magic static `__call` is not declared, and
  magic static `__get` is not declared or returns `undefined`.
- Deleting existing static properties.

To turn off strict mode, pass the `false` value as the second parameter while calling `magic` function.

```javascript
const magic = require('magic-class')
/* or ES6 */
// import magic from 'magic-class'

class NormalClass
{
    static normal = 'normal'

    normal = 'normal'
}

/* Strict mode is ON */

const StrictMagicClass = magic(NormalClass)
const strictMagicInstance = new StrictMagicClass()
// get non-existing prop
try {
    console.log(strictMagicInstance.magic)
}
catch (e) {
    console.log(e.message) // (string) 'Property [magic] does not exist.'
}
// set non-existing prop
try {
    strictMagicInstance.magic = 'magic'
}
catch (e) {
    console.log(e.message) // (string) 'Property [magic] does not exist.'
}
// delete existing prop
try {
    delete strictMagicInstance.normal
}
catch (e) {
    console.log(e.message) // (string) 'Cannot delete property [normal].'
}
// get non-existing static prop
try {
    console.log(StrictMagicClass.magic)
}
catch (e) {
    console.log(e.message) // (string) 'Static property [magic] does not exist.'
}
// set non-existing static prop
try {
    StrictMagicClass.magic = 'magic'
}
catch (e) {
    console.log(e.message) // (string) 'Static property [magic] does not exist.'
}
// delete existing static prop
try {
    delete StrictMagicClass.normal
}
catch (e) {
    console.log(e.message) // (string) 'Cannot delete static property [normal].'
}

/* Strict mode is OFF */

const NotStrictMagicClass = magic(NormalClass, false)
const notStrictMagicInstance = new NotStrictMagicClass()
// get non-existing prop
console.log(notStrictMagicInstance.magic)          // (undefined) undefined
console.log('magic' in notStrictMagicInstance)     // (boolean) false
// set non-existing prop
notStrictMagicInstance.magic = 'magic'
console.log(notStrictMagicInstance.magic)          // (string) 'magic'
console.log('magic' in notStrictMagicInstance)     // (boolean) true
// delete existing prop
delete notStrictMagicInstance.normal
console.log(notStrictMagicInstance.normal)         // (undefined) 'undefined'
console.log('normal' in notStrictMagicInstance)    // (boolean) false
// get non-existing static prop
console.log(NotStrictMagicClass.magic)             // (undefined) undefined
console.log('magic' in NotStrictMagicClass)        // (boolean) false
// set non-existing static prop
NotStrictMagicClass.magic = 'magic'
console.log(NotStrictMagicClass.magic)             // (string) 'magic'
console.log('magic' in NotStrictMagicClass)        // (boolean) true
// delete existing static prop
delete NotStrictMagicClass.normal
console.log(NotStrictMagicClass.normal)            // (undefined) 'undefined'
console.log('normal' in NotStrictMagicClass)       // (boolean) false
```

### Special magic static methods

#### Static `__instance`

This magic static method is to create instance of the class without using `new` operator.

```javascript
const magic = require('magic-class')
/* or ES6 */
// import magic from 'magic-class'

class NormalClass
{
    constructor(...parameters) {
        this.parameters = parameters
    }
}

const MagicClass = magic(NormalClass)
/* `new` operator */
const magicInstance1 = new MagicClass(1, 2, 3)
console.log(magicInstance2.parameters) // (array) [1, 2, 3]
/* magic `__instance` */
const magicInstance2 = MagicClass.__instance(1, 2, 3)
console.log(magicInstance1.parameters) // (array) [1, 2, 3]
```

#### Static `__singleton`

This magic static method is to create only one instance of the class.

```javascript
const magic = require('magic-class')
/* or ES6 */
// import magic from 'magic-class'

class NormalClass
{
    constructor(...parameters) {
        this.parameters = parameters
    }
}

const MagicClass = magic(NormalClass)
// create a singleton instance
const magicInstance1 = MagicClass.__singleton(1, 2, 3)
console.log(magicInstance1.parameters)                      // (array) [1, 2, 3]

// create new instance via `new` operator? 
const magicInstance2 = new MagicClass(4, 5, 6)
const magicInstance3 = new MagicClass()
// no, it's the same with the first instance
console.log(magicInstance2 === magicInstance1)              // (boolean) true
console.log(magicInstance2.parameters)                      // (array) [1, 2, 3]
console.log(magicInstance3 === magicInstance1)              // (boolean) true
console.log(magicInstance3.parameters)                      // (array) [1, 2, 3]

// create new instance via magic `__instance`? 
const magicInstance4 = MagicClass.__instance(7, 8, 9)
const magicInstance5 = MagicClass.__instance()
// no, it's the same with the first instance
console.log(magicInstance4 === magicInstance1)              // (boolean) true
console.log(magicInstance4.parameters)                      // (array) [1, 2, 3]
console.log(magicInstance5 === magicInstance1)              // (boolean) true
console.log(magicInstance5.parameters)                      // (array) [1, 2, 3]

// create new instance via magic `__singleton` again? 
const magicInstance6 = MagicClass.__singleton(9, 10, 11)
const magicInstance7 = MagicClass.__singleton()
// no, it's the same with the first instance
console.log(magicInstance6 === magicInstance1)              // (boolean) true
console.log(magicInstance6.parameters)                      // (array) [1, 2, 3]
console.log(magicInstance7 === magicInstance1)              // (boolean) true
console.log(magicInstance7.parameters)                      // (array) [1, 2, 3]
```

***Note:* The instances created before the first call to magic static `__singleton` are different from
the instance created by magic static `__singleton`.

### Inheritance

Declaring a magic subclass inherits directly from the magic class is possible, but **not recommended**.

```javascript
const magic = require('magic-class')
/* or ES6 */
// import magic from 'magic-class'

class NormalClass
{
    magicProps = {}

    __set(prop, value) {
        this.magicProps[prop] = value
    }

    __get(prop) {
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

    __has(prop) {
        return prop in this.magicProps
    }

    __delete(prop) {
        return delete this.magicProps[prop]
    }
}

const MagicClass = magic(NormalClass)

/* magic subclass inherits directly from magic class */
const SubMagicClass = class extends MagicClass
{
    subMagicProps = {
        subMagic: true,
    }

    /* overrides magic `__set` */
    __set(prop, value) {
        super.__set(prop, {sub: value})
    }

    /* overrides magic `__get` */
    __get(prop) {
        const value = super.__get(prop)
        return value === undefined ? undefined : {sub: value}
    }

    /* overrides magic `__call` */
    __call(method, ...parameters) {
        return {sub: super.__call(method, ...parameters)}
    }

    /* overrides magic `__invoke` */
    __invoke(...parameters) {
        return {sub: super.__invoke(...parameters)}
    }

    /* overrides magic `__has` */
    __has(prop) {
        return super.__has(prop) || prop in this.subMagicProps
    }

    /* overrides magic `__delete` */
    __delete(prop) {
        super.__delete(prop)
        return delete this.subMagicProps[prop]
    }
}

// create sub magic instance
const subMagicInstance = new SubMagicClass
// magic `__set` still works
subMagicInstance.magic = true
console.log(subMagicInstance.magicProps)                // (object) {magic: {sub: true}}
// magic `__get` still works
console.log(subMagicInstance.magic)                     // (object) {sub: 'magic'})
// magic `__call` still works
console.log(subMagicInstance.callMagic('magic', true))  // (object) {sub: {method: 'callMagic', parameters: ['magic', true]}}
// magic `__invoke` still works
console.log(subMagicInstance('magic', true))            // (object) {sub: {parameters: ['magic', true]}}
// magic `__has` still works
console.log('subMagic' in subMagicInstance)             // (boolean) true
// magic `__delete` still works
console.log(delete subMagicInstance.subMagic)           // (boolean) true
console.log('subMagic' in subMagicInstance)             // (boolean) false
console.log(subMagicInstance.subMagicProps)             // (object) {}
```

The reason is static properties/methods (including [magic static methods](#magic-static-methods)
and [special ones](#special-magic-static-methods)) cannot be overridden with direct inheritance.

```javascript
const magic = require('magic-class')
/* or ES6 */
// import magic from 'magic-class'

class NormalClass
{
    static magicProps = {}

    static __set(prop, value) {
        this.magicProps[prop] = value
    }

    static __get(prop) {
        if (prop.startsWith('call')) {
            return undefined
        }
        return prop
    }

    static __call(method, ...parameters) {
        return {method, parameters}
    }

    static __has(prop) {
        return prop in this.magicProps
    }

    static __delete(prop) {
        return delete this.magicProps[prop]
    }
}

const MagicClass = magic(NormalClass)

/* magic subclass inherits directly from magic class */
const SubMagicClass = class extends MagicClass
{
    static subMagicProps = {
        subMagic: true,
    }

    /* overrides magic static `__set` */
    static __set(prop, value) {
        super.__set(prop, {sub: value})
    }

    /* overrides magic static `__get` */
    static __get(prop) {
        const value = super.__get(prop)
        return value === undefined ? undefined : {sub: value}
    }

    /* overrides magic static `__call` */
    static __call(method, ...parameters) {
        return {sub: super.__call(method, ...parameters)}
    }

    /* overrides magic static `__has` */
    static __has(prop) {
        return super.__has(prop) || prop in this.subMagicProps
    }

    /* overrides magic static `__delete` */
    static __delete(prop) {
        super.__delete(prop)
        return delete this.subMagicProps[prop]
    }
}

// magic static `__set` not work as expected
SubMagicClass.magic = true
console.log(SubMagicClass.magicProps)                   // (object) {magic: true} // expected: (object) {magic: {sub: true}}
// magic static `__get` not work as expected
console.log(SubMagicClass.magic)                        // (string) 'magic' // expected: (object) {sub: 'magic'})
// magic static `__call` not work as expected
console.log(SubMagicClass.callMagic('magic', true))     // (object) {method: 'callMagic', parameters: ['magic', true]} // expected: (object) {sub: {method: 'callMagic', parameters: ['magic', true]}}
// magic static `__has` still works
console.log('subMagic' in SubMagicClass)                // (boolean) false // expected: (boolean) true
// magic static `__delete` still works
console.log(delete SubMagicClass.subMagic)              // (boolean) true
console.log('subMagic' in SubMagicClass)                // (boolean) false
console.log(SubMagicClass.subMagicProps)                // (object) {subMagic: true} // expected: (object) {}
```

The **recommended** way:

- Firstly, declaring the subclass inherits from the original class.
- Then, apply the magic to the subclass to get the magic subclass.

```javascript
const magic = require('magic-class')
/* or ES6 */
// import magic from 'magic-class'

class NormalClass
{
    // ...
}

const MagicClass = magic(NormalClass)

// 1. Declaring the subclass inherits from the original class
class SubNormalClass extends NormalClass
{
    // ...
}

// 2. Apply the magic to the subclass to get the magic subclass
const SubMagicClass = magic(SubNormalClass)

// ...
```
