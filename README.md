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
    - For instances
        - Magic methods
            - `__set`
            - `__get`
            - `__call`
            - `__invoke`
    - For classes
        - Magic static methods
            - `__set`
            - `__get`
            - `__call`
        - Special static members
            - `__static` property
            - `__instance` method
            - `__singleton` method
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

- Recommended:

```javascript
const {magic} = require('magic-class')
/* or ES6 */

// import {magic} from 'magic-class

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

    __invoke() {
        return 'invoke'
    }
}

const MagicClass = magic(NormalClass)
// static: magic set
MagicClass.magic = true
console.log(MagicClass.magicProps)      // (object) {'static:magic': true}
// static: magic get
console.log(MagicClass.magic)           // (boolean) true
console.log(MagicClass.any)             // (string) 'static:any'
// static: magic call
console.log(MagicClass.callAny())       // (object) {method: 'static:callAny', parameters: []}

const magicInstance = new MagicClass()
// instance: magic set
magicInstance.magic = true
console.log(magicInstance.magicProps)   // (object) {magic: true}
// instance: magic get
console.log(magicInstance.magic)        // (boolean) true
console.log(magicInstance.any)          // (string) 'any'
// instance: magic call
console.log(magicInstance.callAny())    // (object) {method: 'callAny', parameters: []}
// instance: magic invoke
console.log(magicInstance())            // (string) 'invoke'
```

## Features

## Documentation
