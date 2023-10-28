import chai from 'chai'
import mocha from 'mocha'
import {magic, MagicClass as ExperimentalMagicClass, MagicMixin} from '../src'

const before = mocha.after
const beforeEach = mocha.beforeEach
const after = mocha.after
const afterEach = mocha.afterEach
const describe = mocha.describe
const it = mocha.it
const expect = chai.expect
chai.should()

describe('magic-class', function () {
    // before(() => {
    // })
    // beforeEach(() => {
    // })
    // after(() => {
    // })
    // afterEach(() => {
    // })

    describe('Input is Class >> instance', function () {
        it('magic get', function (done) {
            const NormalClass = class
            {
                normal = true

                __get(prop) {
                    return prop
                }
            }

            const MagicClass = magic(NormalClass)
            const normalInstance = new NormalClass
            const magicInstance = new MagicClass

            // defined prop
            expect(normalInstance.normal).to.equal(true)
            expect(magicInstance.normal).to.equal(true)
            // undefined prop
            expect(normalInstance.magic).to.be.undefined
            expect(magicInstance.magic).to.equal('magic')

            done()
        })

        it('magic call', function (done) {
            const NormalClass = class
            {
                normal(...parameters) {
                    return {parameters}
                }

                __call(method, ...parameters) {
                    return {method, parameters}
                }
            }

            const MagicClass = magic(NormalClass)
            const normalInstance = new NormalClass
            const magicInstance = new MagicClass

            // defined method
            expect(normalInstance.normal('normal', true)).to.deep.equal({
                parameters: ['normal', true],
            })
            expect(magicInstance.normal('normal', true)).to.deep.equal({
                parameters: ['normal', true],
            })
            // undefined method
            try {
                normalInstance.magic('magic', true)
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('normalInstance.magic is not a function')
            }
            expect(magicInstance.magic('magic', true)).to.deep.equal({
                method: 'magic',
                parameters: ['magic', true],
            })
            expect(magicInstance.any).to.be.a('function')

            done()
        })

        it('magic (get+call) >> `magic call` is executed if there is any case of returning `undefined` in `magic get`', function (done) {
            const NormalClass = class
            {
                __get(prop) {
                    if (prop.startsWith('call')) {
                        return undefined
                    }
                    return prop
                }

                __call(method, ...parameters) {
                    return {method, parameters}
                }
            }

            const MagicClass = magic(NormalClass)
            const normalInstance = new NormalClass
            const magicInstance = new MagicClass

            // undefined prop
            expect(normalInstance.magic).to.be.undefined
            expect(magicInstance.magic).to.equal('magic')
            // undefined method
            expect(normalInstance.callMagic).to.be.undefined
            try {
                normalInstance.callMagic('magic', true)
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('normalInstance.callMagic is not a function')
            }
            expect(magicInstance.callMagic).to.be.a('function')
            expect(magicInstance.callMagic('magic', true)).to.deep.equal({
                method: 'callMagic',
                parameters: ['magic', true],
            })

            done()
        })

        it('magic (get+call) >> `magic call` is not executed if there is no case of returning `undefined` in `magic get`', function (done) {
            const NormalClass = class
            {
                __get(prop) {
                    // if (prop.startsWith('call')) {
                    //     return undefined
                    // }
                    return prop
                }

                __call(method, ...parameters) {
                    return {method, parameters}
                }
            }

            const MagicClass = magic(NormalClass)
            const normalInstance = new NormalClass
            const magicInstance = new MagicClass

            // undefined prop
            expect(normalInstance.magic).to.be.undefined
            expect(magicInstance.magic).to.equal('magic')
            // undefined method
            try {
                normalInstance.callMagic('magic', true)
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('normalInstance.callMagic is not a function')
            }
            try {
                magicInstance.callMagic('magic', true)
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('magicInstance.callMagic is not a function')
            }
            expect(magicInstance.callMagic).to.be.a('string')
            expect(magicInstance.callMagic).to.equal('callMagic')

            done()
        })

        it('magic (get+call) >> not defined', function (done) {
            const NormalClass = class
            {
            }

            const MagicClass = magic(NormalClass)
            const normalInstance = new NormalClass
            const magicInstance = new MagicClass

            // undefined prop
            expect(normalInstance.magic).to.be.undefined
            try {
                const magic = magicInstance.magic
            }
            catch (e) {
                expect(e).to.be.an.instanceof(ReferenceError)
                expect(e.message).to.equal('Property [magic] does not exist.')
            }
            // undefined method
            try {
                normalInstance.callMagic('magic', true)
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('normalInstance.callMagic is not a function')
            }
            try {
                magicInstance.callMagic('magic', true)
            }
            catch (e) {
                expect(e).to.be.an.instanceof(ReferenceError)
                expect(e.message).to.equal('Property [callMagic] does not exist.')
            }

            done()
        })

        it('magic invoke', function (done) {
            const NormalClass = class
            {
                __invoke(...parameters) {
                    return {parameters}
                }
            }

            const MagicClass = magic(NormalClass)
            const normalInstance = new NormalClass
            const magicInstance = new MagicClass

            try {
                normalInstance('invoke', true)
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('normalInstance is not a function')
            }
            expect(magicInstance('invoke', true)).to.deep.equal({
                parameters: ['invoke', true],
            })

            done()
        })

        it('magic invoke >> not defined', function (done) {
            const NormalClass = class
            {
            }

            const MagicClass = magic(NormalClass)
            const normalInstance = new NormalClass
            const magicInstance = new MagicClass

            try {
                normalInstance('invoke', true)
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('normalInstance is not a function')
            }
            try {
                magicInstance('invoke', true)
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('magicInstance is not a function')
            }

            done()
        })

        it('magic set', function (done) {
            const NormalClass = class
            {
                normal = true

                magicProps = {}

                __set(prop, value) {
                    this.magicProps[prop] = value
                    if (prop === 'magic') {
                        return true
                    }
                }
            }

            const MagicClass = magic(NormalClass)
            const normalInstance = new NormalClass
            const magicInstance = new MagicClass

            // defined props
            normalInstance.normal = false
            magicInstance.normal = false
            expect(normalInstance.normal).to.equal(false)
            expect(magicInstance.normal).to.equal(false)

            // undefined prop
            normalInstance.magic = true
            magicInstance.magic = true
            magicInstance.any = true
            expect(normalInstance.magic).to.equal(true)
            try {
                const magic = magicInstance.magic
            }
            catch (e) {
                expect(e).to.be.an.instanceof(ReferenceError)
                expect(e.message).to.equal('Property [magic] does not exist.')
            }
            expect(magicInstance.magicProps).to.deep.equal({
                magic: true,
                any: true,
            })

            done()
        })

        it('magic set >> not defined', function (done) {
            const NormalClass = class
            {
            }

            const MagicClass = magic(NormalClass)
            const normalInstance = new NormalClass
            const magicInstance = new MagicClass

            // undefined prop
            normalInstance.magic = true
            expect(normalInstance.magic).to.equal(true)
            try {
                magicInstance.magic = true
            }
            catch (e) {
                expect(e).to.be.an.instanceof(ReferenceError)
                expect(e.message).to.equal('Property [magic] does not exist.')
            }

            done()
        })

        it('method chaining >> (constructor)->(normal method)->(magic invoke)->(magic call)->(magic get)->(normal prop)', function (done) {
            const NormalClass = class
            {
                chain = []

                constructor(...parameters) {
                    this.chain.push(...parameters)
                }

                normal(...parameters) {
                    this.chain.push(...parameters.map(p => 'normal:' + p))
                    return this
                }

                __invoke(...parameters) {
                    this.chain.push(...parameters.map(p => 'invoke:' + p))
                    return this
                }

                __get(prop) {
                    if (prop.startsWith('call')) {
                        return undefined
                    }
                    return this
                }

                __call(method, ...parameters) {
                    if (['callInsert', 'callPush', 'callAdd'].includes(method)) {
                        this.chain.push(...parameters.map(p => method + ':' + p))
                    }
                    return this
                }
            }

            const MagicClass = magic(NormalClass)

            try {
                const normalChain = (new NormalClass(1)).normal(2)(3).callInsert(4).callPush(5).callAdd(6).callSelf('any').self.chain
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('(intermediate value).normal(...) is not a function')
            }
            const magicChain = (new MagicClass(1)).normal(2)(3).callInsert(4).callPush(5).callAdd(6).callSelf('any').self.chain
            expect(magicChain).to.deep.equal([1, 'normal:2', 'invoke:3', 'callInsert:4', 'callPush:5', 'callAdd:6'])

            done()
        })

        it('`in` operator', function (done) {
            const NormalClass = class
            {
                normal = true
            }

            const MagicClass = magic(NormalClass)
            const normalInstance = new NormalClass
            const magicInstance = new MagicClass

            // defined props
            expect('normal' in normalInstance).to.equal(true)
            expect('normal' in magicInstance).to.equal(true)
            // undefined prop
            expect('magic' in normalInstance).to.equal(false)
            expect('magic' in magicInstance).to.equal(false)

            done()
        })

        it('`in` operator >> magic call >> always true', function (done) {
            const NormalClass = class
            {
                __call() {

                }
            }

            const MagicClass = magic(NormalClass)
            const normalInstance = new NormalClass
            const magicInstance = new MagicClass

            // undefined prop
            expect('magic' in normalInstance).to.equal(false)
            expect('magic' in magicInstance).to.equal(true)
            expect('any' in magicInstance).to.equal(true)

            done()
        })

        it('`in` operator >> magic get', function (done) {
            const NormalClass = class
            {
                __get(prop) {
                    if (prop === 'magic') {
                        return prop
                    }
                    return undefined
                }
            }

            const MagicClass = magic(NormalClass)
            const normalInstance = new NormalClass
            const magicInstance = new MagicClass

            // undefined prop
            expect('magic' in normalInstance).to.equal(false)
            expect('magic' in magicInstance).to.equal(true)
            expect('any' in magicInstance).to.equal(false)

            done()
        })

        it('`delete` operator', function (done) {
            const NormalClass = class
            {
                normal = true
            }

            const MagicClass = magic(NormalClass)
            const normalInstance = new NormalClass
            const magicInstance = new MagicClass

            // defined props
            delete normalInstance.normal
            expect('normal' in normalInstance).to.equal(false)
            try {
                delete magicInstance.normal
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('Cannot delete property [normal]')
            }
            // undefined prop
            delete normalInstance.magic
            expect('magic' in normalInstance).to.equal(false)
            try {
                delete magicInstance.magic
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('Cannot delete property [magic]')
            }
            expect('magic' in magicInstance).to.equal(false)

            done()
        })

        it('`instanceof` operator', function (done) {
            const NormalClass = class
            {
            }
            const SubNormalClass = class extends NormalClass
            {
            }

            const MagicClass = magic(NormalClass)
            const SubMagicClass = magic(SubNormalClass)
            const magicInstance = new MagicClass
            const subMagicInstance = new SubMagicClass

            expect(magicInstance instanceof NormalClass).to.equal(true)
            expect(subMagicInstance instanceof SubNormalClass).to.equal(true)
            expect(subMagicInstance instanceof NormalClass).to.equal(true)

            done()
        })

        it('extends >> from original class (recommended)', function (done) {
            const NormalClass = class
            {
                normal = true

                magicProps = {}

                callNormal() {
                    return true
                }

                __set(prop, value) {
                    this.magicProps[prop] = value
                }

                __invoke(...parameters) {
                    return {parameters}
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
            }
            const SubNormalClass = class extends NormalClass
            {
                __set(prop, value) {
                    super.__set(prop, {sub: value})
                }

                __invoke(...parameters) {
                    return {sub: super.__invoke(...parameters)}
                }

                __get(prop) {
                    const value = super.__get(prop)
                    return value === undefined ? undefined : {sub: value}
                }

                __call(method, ...parameters) {
                    return {sub: super.__call(method, ...parameters)}
                }
            }

            const SubMagicClass = magic(SubNormalClass)
            const subMagicInstance = new SubMagicClass

            // magic get
            expect(subMagicInstance.magic).to.deep.equal({sub: 'magic'})
            // magic call
            expect(subMagicInstance.callMagic('magic', true)).to.deep.equal({
                sub: {
                    method: 'callMagic',
                    parameters: ['magic', true],
                },
            })
            // magic invoke
            expect(subMagicInstance('magic', true)).to.deep.equal({
                sub: {
                    parameters: ['magic', true],
                },
            })
            // magic set
            subMagicInstance.magic = true
            expect(subMagicInstance.magicProps).to.deep.equal({
                magic: {
                    sub: true,
                },
            })

            done()
        })

        it('extends >> from magic class (not recommended)', function (done) {
            const NormalClass = class
            {
                normal = true

                magicProps = {}

                callNormal() {
                    return true
                }

                __set(prop, value) {
                    this.magicProps[prop] = value
                }

                __invoke(...parameters) {
                    return {parameters}
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
            }

            const MagicClass = magic(NormalClass)
            const SubMagicClass = class extends MagicClass
            {
                __set(prop, value) {
                    super.__set(prop, {sub: value})
                }

                __invoke(...parameters) {
                    return {sub: super.__invoke(...parameters)}
                }

                __get(prop) {
                    const value = super.__get(prop)
                    return value === undefined ? undefined : {sub: value}
                }

                __call(method, ...parameters) {
                    return {sub: super.__call(method, ...parameters)}
                }
            }

            const subMagicInstance = new SubMagicClass

            // magic get
            expect(subMagicInstance.magic).to.deep.equal({sub: 'magic'})
            // magic call
            expect(subMagicInstance.callMagic('magic', true)).to.deep.equal({
                sub: {
                    method: 'callMagic',
                    parameters: ['magic', true],
                },
            })
            // magic invoke
            expect(subMagicInstance('magic', true)).to.deep.equal({
                sub: {
                    parameters: ['magic', true],
                },
            })
            // magic set
            subMagicInstance.magic = true
            expect(subMagicInstance.magicProps).to.deep.equal({
                magic: {
                    sub: true,
                },
            })

            done()
        })
    })

    describe('Input is Class >> static', function () {
        it('magic get', function (done) {
            const NormalClass = class
            {
                static normal = true

                static __get(prop) {
                    return prop
                }
            }

            const MagicClass = magic(NormalClass)

            // defined static prop
            expect(NormalClass.normal).to.equal(true)
            expect(MagicClass.normal).to.equal(true)
            // undefined static prop
            expect(NormalClass.magic).to.be.undefined
            expect(MagicClass.magic).to.equal('magic')

            done()
        })

        it('magic call', function (done) {
            const NormalClass = class
            {
                static normal(...parameters) {
                    return {parameters}
                }

                static __call(method, ...parameters) {
                    return {method, parameters}
                }
            }

            const MagicClass = magic(NormalClass)

            // defined static method
            expect(NormalClass.normal('normal', true)).to.deep.equal({
                parameters: ['normal', true],
            })
            expect(MagicClass.normal('normal', true)).to.deep.equal({
                parameters: ['normal', true],
            })
            // undefined static method
            try {
                NormalClass.magic('magic', true)
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('NormalClass.magic is not a function')
            }
            expect(MagicClass.magic('magic', true)).to.deep.equal({
                method: 'magic',
                parameters: ['magic', true],
            })

            done()
        })

        it('magic (get+call) >> `magic call` is executed if there is any case of returning `undefined` in `magic get`', function (done) {
            const NormalClass = class
            {
                static __get(prop) {
                    if (prop.startsWith('call')) {
                        return undefined
                    }
                    return prop
                }

                static __call(method, ...parameters) {
                    return {method, parameters}
                }
            }

            const MagicClass = magic(NormalClass)

            // undefined static prop
            expect(NormalClass.magic).to.be.undefined
            expect(MagicClass.magic).to.equal('magic')
            // undefined static method
            expect(NormalClass.callMagic).to.be.undefined
            try {
                NormalClass.callMagic('magic', true)
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('NormalClass.callMagic is not a function')
            }
            expect(MagicClass.callMagic).to.be.a('function')
            expect(MagicClass.callMagic('magic', true)).to.deep.equal({
                method: 'callMagic',
                parameters: ['magic', true],
            })

            done()
        })

        it('magic (get+call) >> `magic call` is not executed if there is no case of returning `undefined` in `magic get`', function (done) {
            const NormalClass = class
            {
                static __get(prop) {
                    // if (prop.startsWith('call')) {
                    //     return undefined
                    // }
                    return prop
                }

                static __call(method, ...parameters) {
                    return {method, parameters}
                }
            }

            const MagicClass = magic(NormalClass)

            // defined static prop
            expect(NormalClass.magic).to.be.undefined
            expect(MagicClass.magic).to.equal('magic')
            // defined static method
            try {
                NormalClass.callMagic('magic', true)
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('NormalClass.callMagic is not a function')
            }
            try {
                MagicClass.callMagic('magic', true)
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('MagicClass.callMagic is not a function')
            }

            done()
        })

        it('magic (get+call) >> not defined', function (done) {
            const NormalClass = class
            {
            }

            const MagicClass = magic(NormalClass)

            // undefined prop
            expect(NormalClass.magic).to.be.undefined
            try {
                const magic = MagicClass.magic
            }
            catch (e) {
                expect(e).to.be.an.instanceof(ReferenceError)
                expect(e.message).to.equal('Static property [magic] does not exist.')
            }
            // undefined method
            try {
                NormalClass.callMagic('magic', true)
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('NormalClass.callMagic is not a function')
            }
            try {
                MagicClass.callMagic('magic', true)
            }
            catch (e) {
                expect(e).to.be.an.instanceof(ReferenceError)
                expect(e.message).to.equal('Static property [callMagic] does not exist.')
            }

            done()
        })

        it('magic set', function (done) {
            const NormalClass = class
            {
                static normal1 = true

                static normal2 = true

                static magicProps = {}

                static __set(prop, value) {
                    this.magicProps[prop] = value
                    if (prop === 'magic2') {
                        return true
                    }
                }
            }

            const MagicClass = magic(NormalClass)

            // defined props
            NormalClass.normal1 = false
            MagicClass.normal2 = false
            expect(NormalClass.normal1).to.equal(false)
            expect(MagicClass.normal2).to.equal(false)

            // undefined prop
            NormalClass.magic1 = true
            MagicClass.magic2 = true
            MagicClass.any = true
            expect(NormalClass.magic1).to.equal(true)
            try {
                const magic2 = MagicClass.magic2
            }
            catch (e) {
                expect(e).to.be.an.instanceof(ReferenceError)
                expect(e.message).to.equal('Static property [magic2] does not exist.')
            }
            expect(MagicClass.magicProps).to.deep.equal({
                magic2: true,
                any: true,
            })

            done()
        })

        it('magic set >> not defined', function (done) {
            const NormalClass = class
            {
            }

            const MagicClass = magic(NormalClass)

            // undefined prop
            NormalClass.magic1 = true
            expect(NormalClass.magic1).to.equal(true)
            try {
                MagicClass.magic2 = true
            }
            catch (e) {
                expect(e).to.be.an.instanceof(ReferenceError)
                expect(e.message).to.equal('Static property [magic2] does not exist.')
            }

            done()
        })

        it('method chaining >> (static)->(magic call)->(normal method)->(magic get)->(normal prop)', function (done) {
            const NormalClass = class
            {
                static chain = []

                static {
                    this.chain.push(1)
                }

                static normal(...parameters) {
                    this.chain.push(...parameters.map(p => 'normal:' + p))
                    return this
                }

                static __get(prop) {
                    if (prop.startsWith('call')) {
                        return undefined
                    }
                    return this
                }

                static __call(method, ...parameters) {
                    if (['callInsert', 'callPush', 'callAdd'].includes(method)) {
                        this.chain.push(...parameters.map(p => method + ':' + p))
                    }
                    return this
                }
            }

            const MagicClass = magic(NormalClass)

            try {
                const normalChain = NormalClass.callInsert(2).callPush(3).callAdd(4).callSelf('any').normal(5).self.chain
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('NormalClass.callInsert is not a function')
            }
            const magicChain = MagicClass.callInsert(2).callPush(3).callAdd(4).callSelf('any').normal(5).self.chain
            expect(magicChain).to.deep.equal([1, 'callInsert:2', 'callPush:3', 'callAdd:4', 'normal:5'])

            done()
        })

        it('`in` operator', function (done) {
            const NormalClass = class
            {
                static normal = true
            }

            const MagicClass = magic(NormalClass)

            // defined props
            expect('normal' in NormalClass).to.equal(true)
            expect('normal' in MagicClass).to.equal(true)
            // undefined prop
            expect('magic' in NormalClass).to.equal(false)
            expect('magic' in MagicClass).to.equal(false)
            expect('__static' in MagicClass).to.equal(true)
            expect('__instance' in MagicClass).to.equal(true)
            expect('__singleton' in MagicClass).to.equal(true)

            done()
        })

        it('`in` operator >> magic call >> always true', function (done) {
            const NormalClass = class
            {
                static __call() {

                }
            }

            const MagicClass = magic(NormalClass)

            // undefined prop
            expect('magic' in NormalClass).to.equal(false)
            expect('magic' in MagicClass).to.equal(true)
            expect('any' in MagicClass).to.equal(true)

            done()
        })

        it('`in` operator >> magic get', function (done) {
            const NormalClass = class
            {
                static __get(prop) {
                    if (prop === 'magic') {
                        return prop
                    }
                    return undefined
                }
            }

            const MagicClass = magic(NormalClass)

            // undefined prop
            expect('magic' in NormalClass).to.equal(false)
            expect('magic' in MagicClass).to.equal(true)
            expect('any' in MagicClass).to.equal(false)

            done()
        })

        it('`delete` operator', function (done) {
            const NormalClass = class
            {
                static normal1 = true

                static normal2 = true
            }

            const MagicClass = magic(NormalClass)

            // defined props
            delete NormalClass.normal1
            expect('normal1' in NormalClass).to.equal(false)
            try {
                delete MagicClass.normal2
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('Cannot delete static property [normal2]')
            }
            // undefined prop
            delete NormalClass.magic1
            expect('magic1' in NormalClass).to.equal(false)
            try {
                delete MagicClass.magic2
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('Cannot delete static property [magic2]')
            }
            expect('magic2' in MagicClass).to.equal(false);
            // special props
            (props => props.forEach(prop => {
                try {
                    delete MagicClass[prop]
                }
                catch (e) {
                    expect(e).to.be.an.instanceof(TypeError)
                    expect(e.message).to.equal(`Cannot delete static property [${prop}]`)
                }
            }))(['__static', '__instance', '__singleton'])

            done()
        })

        it('prototype', function (done) {
            const NormalClass = class
            {
            }
            const SubNormalClass = class extends NormalClass
            {
            }

            const MagicClass = magic(NormalClass)
            const SubMagicClass = magic(SubNormalClass)

            expect(MagicClass.name).to.equal(NormalClass.name)
            expect(MagicClass.length).to.equal(NormalClass.length)
            expect(MagicClass.prototype).to.deep.equal(NormalClass.prototype)

            expect(NormalClass.isPrototypeOf(SubMagicClass)).to.equal(true)
            expect(MagicClass.isPrototypeOf(SubMagicClass)).to.equal(false)

            done()
        })

        it('extends >> from original class (recommended)', function (done) {
            const NormalClass = class
            {
                static normal = true

                static magicProps = {}

                static callNormal() {
                    return true
                }

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
            }
            const SubNormalClass = class extends NormalClass
            {
                static __set(prop, value) {
                    super.__set(prop, {sub: value})
                }

                static __get(prop) {
                    const value = super.__get(prop)
                    return value === undefined ? undefined : {sub: value}
                }

                static __call(method, ...parameters) {
                    return {sub: super.__call(method, ...parameters)}
                }
            }

            const SubMagicClass = magic(SubNormalClass)

            // magic get
            expect(SubMagicClass.magic).to.deep.equal({sub: 'magic'})
            // magic call
            expect(SubMagicClass.callMagic('magic', true)).to.deep.equal({
                sub: {
                    method: 'callMagic',
                    parameters: ['magic', true],
                },
            })
            // magic set
            SubMagicClass.magic = true
            expect(SubMagicClass.magicProps).to.deep.equal({
                magic: {
                    sub: true,
                },
            })

            done()
        })

        it('extends >> from magic class (not recommended) [static members not inherited]', function (done) {
            const NormalClass = class
            {
                static normal = true

                static magicProps = {}

                static callNormal() {
                    return true
                }

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
            }

            const MagicClass = magic(NormalClass)
            const SubMagicClass = class extends MagicClass
            {
                static __set(prop, value) {
                    super.__set(prop, {sub: value})
                }

                static __invoke(...parameters) {
                    return {sub: super.__invoke(...parameters)}
                }

                static __get(prop) {
                    const value = super.__get(prop)
                    return value === undefined ? undefined : {sub: value}
                }

                static __call(method, ...parameters) {
                    return {sub: super.__call(method, ...parameters)}
                }
            }

            // magic get
            expect(SubMagicClass.magic).to.deep.equal('magic')
            // magic call
            expect(SubMagicClass.callMagic('magic', true)).to.deep.equal({
                method: 'callMagic',
                parameters: ['magic', true],
            })
            // magic set
            SubMagicClass.magic = true
            expect(SubMagicClass.magicProps).to.deep.equal({
                magic: true,
            })

            done()
        })

        it('special prop >> `__static`', function (done) {
            const NormalClass = class
            {
            }

            const MagicClass = magic(NormalClass)

            expect(MagicClass.__static).to.equal(MagicClass)

            done()
        })

        it('special prop >> `__instance`', function (done) {
            const NormalClass = class
            {
                chain = []

                constructor(...parameters) {
                    this.chain.push(...parameters)
                }

                normal(...parameters) {
                    this.chain.push(...parameters.map(p => 'normal:' + p))
                    return this
                }

                __invoke(...parameters) {
                    this.chain.push(...parameters.map(p => 'invoke:' + p))
                    return this
                }

                __get(prop) {
                    if (prop.startsWith('call')) {
                        return undefined
                    }
                    return this
                }

                __call(method, ...parameters) {
                    if (['callInsert', 'callPush', 'callAdd'].includes(method)) {
                        this.chain.push(...parameters.map(p => method + ':' + p))
                    }
                    return this
                }
            }

            const MagicClass = magic(NormalClass)

            expect(MagicClass.__instance).to.be.a('function')
            const magicInstance = MagicClass.__instance(1)
            expect(magicInstance instanceof NormalClass).to.equal(true)
            const magicInstance2 = MagicClass.__instance(1)
            expect(magicInstance2).to.not.equal(magicInstance)
            const magicChain = magicInstance.normal(2)(3).callInsert(4).callPush(5).callAdd(6).callSelf('any').self.chain
            expect(magicChain).to.deep.equal([1, 'normal:2', 'invoke:3', 'callInsert:4', 'callPush:5', 'callAdd:6'])

            done()
        })

        it('special prop >> `__singleton`', function (done) {
            const NormalClass = class
            {
                chain = []

                constructor(...parameters) {
                    this.chain.push(...parameters)
                }

                normal(...parameters) {
                    this.chain.push(...parameters.map(p => 'normal:' + p))
                    return this
                }

                __invoke(...parameters) {
                    this.chain.push(...parameters.map(p => 'invoke:' + p))
                    return this
                }

                __get(prop) {
                    if (prop.startsWith('call')) {
                        return undefined
                    }
                    return this
                }

                __call(method, ...parameters) {
                    if (['callInsert', 'callPush', 'callAdd'].includes(method)) {
                        this.chain.push(...parameters.map(p => method + ':' + p))
                    }
                    return this
                }
            }

            const MagicClass = magic(NormalClass)

            expect(MagicClass.__instance).to.be.a('function')
            const magicInstance = MagicClass.__singleton(1)
            expect(magicInstance instanceof NormalClass).to.equal(true)
            const magicInstance2 = MagicClass.__singleton(1)
            const magicInstance3 = MagicClass.__singleton()
            const magicInstance4 = MagicClass.__instance(1)
            const magicInstance5 = MagicClass.__instance()
            expect(magicInstance2).to.equal(magicInstance)
            expect(magicInstance3).to.equal(magicInstance)
            expect(magicInstance4).to.equal(magicInstance)
            expect(magicInstance5).to.equal(magicInstance)
            const magicChain = magicInstance.normal(2)(3).callInsert(4).callPush(5).callAdd(6).callSelf('any').self.chain
            expect(magicChain).to.deep.equal([1, 'normal:2', 'invoke:3', 'callInsert:4', 'callPush:5', 'callAdd:6'])

            done()
        })
    })

    describe('strict >> off', function () {
        it('{Input is Class >> instance}: magic (get+call) >> not defined', function (done) {
            const NormalClass = class
            {
            }

            const MagicClass = magic(NormalClass, false)
            const magicInstance = new MagicClass

            // undefined prop
            expect(magicInstance.magic).to.be.undefined
            // undefined method
            try {
                magicInstance.callMagic('magic', true)
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('magicInstance.callMagic is not a function')
            }
            expect(magicInstance.callMagic).to.be.undefined

            done()
        })

        it('{Input is Class >> instance}: magic set >> not defined', function (done) {
            const NormalClass = class
            {
            }

            const MagicClass = magic(NormalClass, false)
            const magicInstance = new MagicClass

            // undefined prop
            magicInstance.magic = true
            expect(magicInstance.magic).to.equal(true)

            done()
        })

        it('{Input is Class >> instance}: `delete` operator', function (done) {
            const NormalClass = class
            {
                normal = true
            }

            const MagicClass = magic(NormalClass, false)
            const magicInstance = new MagicClass

            // defined props
            delete magicInstance.normal
            expect('normal' in magicInstance).to.equal(false)
            // undefined prop
            delete magicInstance.magic
            expect('magic' in magicInstance).to.equal(false)

            done()
        })

        it('{Input is Class >> static}: magic (get+call) >> not defined', function (done) {
            const NormalClass = class
            {
            }

            const MagicClass = magic(NormalClass, false)

            // undefined prop
            expect(MagicClass.magic).to.be.undefined
            // undefined method
            try {
                MagicClass.callMagic('magic', true)
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('MagicClass.callMagic is not a function')
            }
            expect(MagicClass.callMagic).to.be.undefined

            done()
        })

        it('{Input is Class >> static}: magic set >> not defined', function (done) {
            const NormalClass = class
            {
            }

            const MagicClass = magic(NormalClass, false)

            // undefined prop
            MagicClass.magic = true
            expect(MagicClass.magic).to.equal(true)

            done()
        })

        it('{Input is Class >> static}: `delete` operator', function (done) {
            const NormalClass = class
            {
                static normal = true
            }

            const MagicClass = magic(NormalClass, false)

            // defined props
            delete MagicClass.normal
            expect('normal' in NormalClass).to.equal(false)
            // undefined prop
            delete MagicClass.magic
            expect('magic' in MagicClass).to.equal(false);
            // special props
            (props => props.forEach(prop => {
                try {
                    delete MagicClass[prop]
                }
                catch (e) {
                    expect(e).to.be.an.instanceof(TypeError)
                    expect(e.message).to.equal(`Cannot delete static property [${prop}]`)
                }
            }))(['__static', '__instance', '__singleton'])

            done()
        })
    })

    describe('Other Inputs', function () {
        it('Input is Instance', function (done) {
            const NormalClass = class
            {
                chain = []

                constructor(...parameters) {
                    this.chain.push(...parameters)
                }

                normal(...parameters) {
                    this.chain.push(...parameters.map(p => 'normal:' + p))
                    return this
                }

                __invoke(...parameters) {
                    this.chain.push(...parameters.map(p => 'invoke:' + p))
                    return this
                }

                __get(prop) {
                    if (prop.startsWith('call')) {
                        return undefined
                    }
                    return this
                }

                __call(method, ...parameters) {
                    if (['callInsert', 'callPush', 'callAdd'].includes(method)) {
                        this.chain.push(...parameters.map(p => method + ':' + p))
                    }
                    return this
                }
            }

            const normalInstance = new NormalClass(1)
            const magicInstance = magic(normalInstance)

            const magicChain = magicInstance.normal(2)(3).callInsert(4).callPush(5).callAdd(6).callSelf('any').self.chain
            expect(magicChain).to.deep.equal([1, 'normal:2', 'invoke:3', 'callInsert:4', 'callPush:5', 'callAdd:6'])

            done()
        })

        it('Input is not supported', function (done) {
            try {
                const magicInstance = magic('string')
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('The [target] parameter must be a function or an object.')
            }

            done()
        })
    })

    describe('Experimental implementation', function () {
        it('MagicMixin >> `__static`', function (done) {
            const NormalClass = class
            {
                static magicProps = {}

                static __set(prop, value) {
                    this.magicProps[prop] = value
                }

                static __get(prop) {
                    if (prop in this.magicProps) {
                        return this.magicProps[prop]
                    }
                    if (prop.startsWith('call')) {
                        return undefined
                    }
                    return prop
                }

                static __call(method, ...parameters) {
                    return {method, parameters}
                }
            }

            const MagicClass = MagicMixin(NormalClass)

            // cannot access static magic methods directly
            // magic get not work
            expect(MagicClass.magic).to.be.undefined
            // magic call not work
            try {
                MagicClass.callMagic('magic', true)
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
            }
            expect(MagicClass.callMagic).to.be.undefined
            // magic set not work
            MagicClass.magic1 = true
            expect(MagicClass.magic1).to.equal(true)

            // must access static magic methods via `__static`
            // magic get
            expect(MagicClass.__static.magic).to.equal('magic')
            // magic call
            expect(MagicClass.__static.callMagic('magic', true)).to.deep.equal({
                method: 'callMagic',
                parameters: ['magic', true],
            })
            expect(MagicClass.__static.callMagic).to.be.a('function')
            // magic set
            MagicClass.__static.magic2 = true
            expect(MagicClass.magic2).to.be.undefined
            expect(MagicClass.__static.magic2).to.equal(true)
            expect(MagicClass.magicProps).to.deep.equal({
                magic2: true,
            })

            done()
        })

        it('MagicMixin >> `__instance`', function (done) {
            const NormalClass = class
            {
                chain = []

                constructor(...parameters) {
                    this.chain.push(...parameters)
                }

                normal(...parameters) {
                    this.chain.push(...parameters.map(p => 'normal:' + p))
                    return this
                }

                __invoke(...parameters) {
                    this.chain.push(...parameters.map(p => 'invoke:' + p))
                    return this
                }

                __get(prop) {
                    if (prop.startsWith('call')) {
                        return undefined
                    }
                    return this
                }

                __call(method, ...parameters) {
                    if (['callInsert', 'callPush', 'callAdd'].includes(method)) {
                        this.chain.push(...parameters.map(p => method + ':' + p))
                    }
                    return this
                }
            }

            const MagicClass = MagicMixin(NormalClass)

            const magicInstance = MagicClass.__instance(1)
            expect(magicInstance instanceof NormalClass).to.equal(true)
            const magicInstance2 = MagicClass.__instance(1)
            expect(magicInstance2).to.not.equal(magicInstance)
            const magicChain = magicInstance.normal(2)(3).callInsert(4).callPush(5).callAdd(6).callSelf('any').self.chain
            expect(magicChain).to.deep.equal([1, 'normal:2', 'invoke:3', 'callInsert:4', 'callPush:5', 'callAdd:6'])

            done()
        })

        it('MagicMixin >> `__singleton`', function (done) {
            const NormalClass = class
            {
                chain = []

                constructor(...parameters) {
                    this.chain.push(...parameters)
                }

                normal(...parameters) {
                    this.chain.push(...parameters.map(p => 'normal:' + p))
                    return this
                }

                __invoke(...parameters) {
                    this.chain.push(...parameters.map(p => 'invoke:' + p))
                    return this
                }

                __get(prop) {
                    if (prop.startsWith('call')) {
                        return undefined
                    }
                    return this
                }

                __call(method, ...parameters) {
                    if (['callInsert', 'callPush', 'callAdd'].includes(method)) {
                        this.chain.push(...parameters.map(p => method + ':' + p))
                    }
                    return this
                }
            }

            const MagicClass = MagicMixin(NormalClass)

            const magicInstance = MagicClass.__singleton(1)
            expect(magicInstance instanceof NormalClass).to.equal(true)
            const magicInstance2 = MagicClass.__singleton(1)
            const magicInstance3 = MagicClass.__singleton()
            const magicInstance4 = MagicClass.__instance(1)
            const magicInstance5 = MagicClass.__instance()
            expect(magicInstance2).to.equal(magicInstance)
            expect(magicInstance3).to.equal(magicInstance)
            expect(magicInstance4).to.equal(magicInstance)
            expect(magicInstance5).to.equal(magicInstance)
            const magicChain = magicInstance.normal(2)(3).callInsert(4).callPush(5).callAdd(6).callSelf('any').self.chain
            expect(magicChain).to.deep.equal([1, 'normal:2', 'invoke:3', 'callInsert:4', 'callPush:5', 'callAdd:6'])

            done()
        })

        it('MagicMixin >> strict', function (done) {
            const NormalClass = class
            {
            }

            const StrictMagicClass = MagicMixin(NormalClass)
            const MagicClass = MagicMixin(NormalClass, false)

            const strictMagicInstance = StrictMagicClass.__instance()
            try {
                const magic = magicInstance.magic
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
            }

            const magicInstance = MagicClass.__instance()
            expect(magicInstance.magic).to.be.undefined

            done()
        })

        it('MagicClass >> `__static`', function (done) {
            const NormalClass = class extends ExperimentalMagicClass
            {
                static magicProps = {}

                static __set(prop, value) {
                    this.magicProps[prop] = value
                }

                static __get(prop) {
                    if (prop in this.magicProps) {
                        return this.magicProps[prop]
                    }
                    if (prop.startsWith('call')) {
                        return undefined
                    }
                    return prop
                }

                static __call(method, ...parameters) {
                    return {method, parameters}
                }
            }

            const MagicClass = NormalClass.__magic()

            // cannot access static magic methods directly
            // magic get not work
            expect(MagicClass.magic).to.be.undefined
            // magic call not work
            try {
                MagicClass.callMagic('magic', true)
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
            }
            expect(MagicClass.callMagic).to.be.undefined
            // magic set not work
            MagicClass.magic1 = true
            expect(MagicClass.magic1).to.equal(true)

            // must access static magic methods via `__static`
            // magic get
            expect(MagicClass.__static.magic).to.equal('magic')
            // magic call
            expect(MagicClass.__static.callMagic('magic', true)).to.deep.equal({
                method: 'callMagic',
                parameters: ['magic', true],
            })
            expect(MagicClass.__static.callMagic).to.be.a('function')
            // magic set
            MagicClass.__static.magic2 = true
            expect(MagicClass.magic2).to.be.undefined
            expect(MagicClass.__static.magic2).to.equal(true)
            expect(MagicClass.magicProps).to.deep.equal({
                magic2: true,
            })

            done()
        })

        it('MagicClass >> `__instance`', function (done) {
            const NormalClass = class extends ExperimentalMagicClass
            {
                chain = []

                constructor(...parameters) {
                    super()

                    this.chain.push(...parameters)
                }

                normal(...parameters) {
                    this.chain.push(...parameters.map(p => 'normal:' + p))
                    return this
                }

                __invoke(...parameters) {
                    this.chain.push(...parameters.map(p => 'invoke:' + p))
                    return this
                }

                __get(prop) {
                    if (prop.startsWith('call')) {
                        return undefined
                    }
                    return this
                }

                __call(method, ...parameters) {
                    if (['callInsert', 'callPush', 'callAdd'].includes(method)) {
                        this.chain.push(...parameters.map(p => method + ':' + p))
                    }
                    return this
                }
            }

            const MagicClass = NormalClass.__magic()

            const magicInstance = MagicClass.__instance(1)
            expect(magicInstance instanceof NormalClass).to.equal(true)
            const magicInstance2 = MagicClass.__instance(1)
            expect(magicInstance2).to.not.equal(magicInstance)
            const magicChain = magicInstance.normal(2)(3).callInsert(4).callPush(5).callAdd(6).callSelf('any').self.chain
            expect(magicChain).to.deep.equal([1, 'normal:2', 'invoke:3', 'callInsert:4', 'callPush:5', 'callAdd:6'])

            done()
        })

        it('MagicClass >> `__singleton`', function (done) {
            const NormalClass = class extends ExperimentalMagicClass
            {
                chain = []

                constructor(...parameters) {
                    super()
                    this.chain.push(...parameters)
                }

                normal(...parameters) {
                    this.chain.push(...parameters.map(p => 'normal:' + p))
                    return this
                }

                __invoke(...parameters) {
                    this.chain.push(...parameters.map(p => 'invoke:' + p))
                    return this
                }

                __get(prop) {
                    if (prop.startsWith('call')) {
                        return undefined
                    }
                    return this
                }

                __call(method, ...parameters) {
                    if (['callInsert', 'callPush', 'callAdd'].includes(method)) {
                        this.chain.push(...parameters.map(p => method + ':' + p))
                    }
                    return this
                }
            }

            const MagicClass = NormalClass.__magic()

            const magicInstance = MagicClass.__singleton(1)
            expect(magicInstance instanceof NormalClass).to.equal(true)
            const magicInstance2 = MagicClass.__singleton(1)
            const magicInstance3 = MagicClass.__singleton()
            const magicInstance4 = MagicClass.__instance(1)
            const magicInstance5 = MagicClass.__instance()
            expect(magicInstance2).to.equal(magicInstance)
            expect(magicInstance3).to.equal(magicInstance)
            expect(magicInstance4).to.equal(magicInstance)
            expect(magicInstance5).to.equal(magicInstance)
            const magicChain = magicInstance.normal(2)(3).callInsert(4).callPush(5).callAdd(6).callSelf('any').self.chain
            expect(magicChain).to.deep.equal([1, 'normal:2', 'invoke:3', 'callInsert:4', 'callPush:5', 'callAdd:6'])

            done()
        })

        it('MagicClass >> strict', function (done) {
            const NormalClass = class extends ExperimentalMagicClass
            {
            }

            const StrictMagicClass = NormalClass.__magic()
            const strictMagicInstance = StrictMagicClass.__instance()
            try {
                const magic = magicInstance.magic
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
            }

            const MagicClass = NormalClass.__magic(false)
            const magicInstance = MagicClass.__instance()
            expect(magicInstance.magic).to.be.undefined

            done()
        })
    })
})
