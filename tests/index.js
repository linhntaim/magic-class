import chai from 'chai'
import mocha from 'mocha'
import magic from '../src'

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

        it('magic invoke >> not declared', function (done) {
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

            // declared props
            normalInstance.normal = false
            magicInstance.normal = false
            expect(normalInstance.normal).to.equal(false)
            expect(magicInstance.normal).to.equal(false)

            // undeclared prop
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

        it('magic set >> not declared', function (done) {
            const NormalClass = class
            {
            }

            const MagicClass = magic(NormalClass)
            const normalInstance = new NormalClass
            const magicInstance = new MagicClass

            // undeclared prop
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

            // declared prop
            expect(normalInstance.normal).to.equal(true)
            expect(magicInstance.normal).to.equal(true)
            // undeclared prop
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

            // declared method
            expect(normalInstance.normal('normal', true)).to.deep.equal({
                parameters: ['normal', true],
            })
            expect(magicInstance.normal('normal', true)).to.deep.equal({
                parameters: ['normal', true],
            })
            // undeclared method
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

        it('magic (get+call) >> `magic call` is executed if there is any case of returning `undeclared` in `magic get`', function (done) {
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

            // undeclared prop
            expect(normalInstance.magic).to.be.undefined
            expect(magicInstance.magic).to.equal('magic')
            // undeclared method
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

        it('magic (get+call) >> `magic call` is not executed if there is no case of returning `undeclared` in `magic get`', function (done) {
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

            // undeclared prop
            expect(normalInstance.magic).to.be.undefined
            expect(magicInstance.magic).to.equal('magic')
            // undeclared method
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

        it('magic (get+call) >> not declared', function (done) {
            const NormalClass = class
            {
            }

            const MagicClass = magic(NormalClass)
            const normalInstance = new NormalClass
            const magicInstance = new MagicClass

            // undeclared prop
            expect(normalInstance.magic).to.be.undefined
            try {
                const magic = magicInstance.magic
            }
            catch (e) {
                expect(e).to.be.an.instanceof(ReferenceError)
                expect(e.message).to.equal('Property [magic] does not exist.')
            }
            // undeclared method
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

        it('magic has', function (done) {
            const NormalClass = class
            {
                normal = true

                __has(prop) {
                    if (prop === 'magic') {
                        return true
                    }
                    return false
                }
            }

            const MagicClass = magic(NormalClass)
            const normalInstance = new NormalClass
            const magicInstance = new MagicClass

            // declared prop
            expect('normal' in normalInstance).to.equal(true)
            expect('normal' in magicInstance).to.equal(true)
            // undeclared prop
            expect('magic' in normalInstance).to.equal(false)
            expect('other' in normalInstance).to.equal(false)
            expect('magic' in magicInstance).to.equal(true)
            expect('other' in magicInstance).to.equal(false)

            done()
        })

        it('magic has >> not declared', function (done) {
            const NormalClass = class
            {
            }

            const MagicClass = magic(NormalClass)
            const normalInstance = new NormalClass
            const magicInstance = new MagicClass

            // undeclared prop
            expect('magic' in normalInstance).to.equal(false)
            expect('other' in normalInstance).to.equal(false)
            expect('magic' in magicInstance).to.equal(false)
            expect('other' in magicInstance).to.equal(false)

            done()
        })

        it('magic has >> not return', function (done) {
            const NormalClass = class
            {
                __has() {
                }
            }

            const MagicClass = magic(NormalClass)
            const normalInstance = new NormalClass
            const magicInstance = new MagicClass

            // undeclared prop
            expect('magic' in normalInstance).to.equal(false)
            expect('other' in normalInstance).to.equal(false)
            expect('magic' in magicInstance).to.equal(false)
            expect('other' in magicInstance).to.equal(false)

            done()
        })

        it('magic delete', function (done) {
            const NormalClass = class
            {
                normal = true

                magicProps = {
                    magic: true,
                }

                __delete(prop) {
                    return delete this.magicProps[prop]
                }
            }

            const MagicClass = magic(NormalClass)
            const normalInstance = new NormalClass
            const magicInstance = new MagicClass

            // declared props
            expect('normal' in normalInstance).to.equal(true)
            expect(delete normalInstance.normal).to.equal(true)
            expect('normal' in normalInstance).to.equal(false)
            expect('normal' in magicInstance).to.equal(true)
            try {
                delete magicInstance.normal
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('Cannot delete property [normal].')
            }
            expect('normal' in magicInstance).to.equal(true)
            // undeclared prop
            expect(delete normalInstance.magic).to.equal(true)
            expect(delete normalInstance.other).to.equal(true)
            expect('magic' in magicInstance.magicProps).to.equal(true)
            expect(delete magicInstance.magic).to.equal(true)
            expect('magic' in magicInstance.magicProps).to.equal(false)
            expect('other' in magicInstance.magicProps).to.equal(false)
            expect(delete magicInstance.other).to.equal(true)
            expect('other' in magicInstance.magicProps).to.equal(false)

            done()
        })

        it('magic delete >> not declared', function (done) {
            const NormalClass = class
            {
            }

            const MagicClass = magic(NormalClass)
            const normalInstance = new NormalClass
            const magicInstance = new MagicClass

            // undeclared prop
            expect(delete normalInstance.magic).to.equal(true)
            expect(delete normalInstance.other).to.equal(true)
            expect(delete magicInstance.magic).to.equal(true)
            expect(delete magicInstance.other).to.equal(true)

            done()
        })

        it('magic delete >> not return', function (done) {
            const NormalClass = class
            {
                __delete() {
                }
            }

            const MagicClass = magic(NormalClass)
            const normalInstance = new NormalClass
            const magicInstance = new MagicClass

            // undeclared prop
            expect(delete normalInstance.magic).to.equal(true)
            expect(delete normalInstance.other).to.equal(true)
            expect(delete magicInstance.magic).to.equal(true)
            expect(delete magicInstance.other).to.equal(true)

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

        it('prototype', function (done) {
            const NormalClass = class
            {
            }
            const SubNormalClass = class extends NormalClass
            {
            }

            const MagicClass = magic(NormalClass)
            const SubMagicClass = magic(SubNormalClass)

            const normalInstance = new NormalClass
            const subNormalInstance = new SubNormalClass
            const magicInstance = new MagicClass
            const subMagicInstance = new SubMagicClass

            // instance of class
            expect(magicInstance instanceof NormalClass).to.equal(true)
            expect(normalInstance instanceof MagicClass).to.equal(true)
            expect(subMagicInstance instanceof SubNormalClass).to.equal(true)
            expect(subNormalInstance instanceof SubMagicClass).to.equal(true)
            // instance of parent class
            expect(subMagicInstance instanceof NormalClass).to.equal(true)
            expect(subNormalInstance instanceof MagicClass).to.equal(true)

            done()
        })

        it('inheritance >> from original class (recommended)', function (done) {
            const NormalClass = class
            {
                magicProps = {}

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

        it('inheritance >> from magic class (not recommended)', function (done) {
            const NormalClass = class
            {
                magicProps = {}

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

            // declared props
            NormalClass.normal1 = false
            MagicClass.normal2 = false
            expect(NormalClass.normal1).to.equal(false)
            expect(MagicClass.normal2).to.equal(false)

            // undeclared prop
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

        it('magic set >> not declared', function (done) {
            const NormalClass = class
            {
            }

            const MagicClass = magic(NormalClass)

            // undeclared prop
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

        it('magic get', function (done) {
            const NormalClass = class
            {
                static normal = true

                static __get(prop) {
                    return prop
                }
            }

            const MagicClass = magic(NormalClass)

            // declared static prop
            expect(NormalClass.normal).to.equal(true)
            expect(MagicClass.normal).to.equal(true)
            // undeclared static prop
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

            // declared static method
            expect(NormalClass.normal('normal', true)).to.deep.equal({
                parameters: ['normal', true],
            })
            expect(MagicClass.normal('normal', true)).to.deep.equal({
                parameters: ['normal', true],
            })
            // undeclared static method
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

        it('magic (get+call) >> `magic call` is executed if there is any case of returning `undeclared` in `magic get`', function (done) {
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

            // undeclared static prop
            expect(NormalClass.magic).to.be.undefined
            expect(MagicClass.magic).to.equal('magic')
            // undeclared static method
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

        it('magic (get+call) >> `magic call` is not executed if there is no case of returning `undeclared` in `magic get`', function (done) {
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

            // declared static prop
            expect(NormalClass.magic).to.be.undefined
            expect(MagicClass.magic).to.equal('magic')
            // declared static method
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

        it('magic (get+call) >> not declared', function (done) {
            const NormalClass = class
            {
            }

            const MagicClass = magic(NormalClass)

            // undeclared prop
            expect(NormalClass.magic).to.be.undefined
            try {
                const magic = MagicClass.magic
            }
            catch (e) {
                expect(e).to.be.an.instanceof(ReferenceError)
                expect(e.message).to.equal('Static property [magic] does not exist.')
            }
            // undeclared method
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

        it('magic has', function (done) {
            const NormalClass = class
            {
                static normal = true

                static __has(prop) {
                    if (prop === 'magic') {
                        return true
                    }
                    return false
                }
            }

            const MagicClass = magic(NormalClass)

            // declared prop
            expect('normal' in NormalClass).to.equal(true)
            expect('normal' in MagicClass).to.equal(true)
            // undeclared prop
            expect('magic' in NormalClass).to.equal(false)
            expect('other' in NormalClass).to.equal(false)
            expect('magic' in MagicClass).to.equal(true)
            expect('other' in MagicClass).to.equal(false)
            // special prop
            expect('__instance' in NormalClass).to.equal(false)
            expect('__singleton' in NormalClass).to.equal(false)
            expect('__instance' in MagicClass).to.equal(true)
            expect('__singleton' in MagicClass).to.equal(true)

            done()
        })

        it('magic has >> not declared', function (done) {
            const NormalClass = class
            {
            }

            const MagicClass = magic(NormalClass)

            // undeclared prop
            expect('magic' in NormalClass).to.equal(false)
            expect('other' in NormalClass).to.equal(false)
            expect('magic' in MagicClass).to.equal(false)
            expect('other' in MagicClass).to.equal(false)

            done()
        })

        it('magic has >> not return', function (done) {
            const NormalClass = class
            {
                static __has() {
                }
            }

            const MagicClass = magic(NormalClass)

            // undeclared prop
            expect('magic' in NormalClass).to.equal(false)
            expect('other' in NormalClass).to.equal(false)
            expect('magic' in MagicClass).to.equal(false)
            expect('other' in MagicClass).to.equal(false)

            done()
        })

        it('magic delete', function (done) {
            const NormalClass = class
            {
                static normal1 = true

                static normal2 = true

                static magicProps = {
                    magic2: true,
                }

                static __delete(prop) {
                    return delete this.magicProps[prop]
                }
            }

            const MagicClass = magic(NormalClass)

            // declared props
            expect('normal1' in NormalClass).to.equal(true)
            expect(delete NormalClass.normal1).to.equal(true)
            expect('normal1' in NormalClass).to.equal(false)
            expect('normal2' in MagicClass).to.equal(true)
            try {
                delete MagicClass.normal2
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('Cannot delete static property [normal2].')
            }
            expect('normal2' in MagicClass).to.equal(true)
            // undeclared prop
            expect(delete NormalClass.magic1).to.equal(true)
            expect(delete NormalClass.other1).to.equal(true)
            expect('magic2' in MagicClass.magicProps).to.equal(true)
            expect(delete MagicClass.magic2).to.equal(true)
            expect('magic2' in MagicClass.magicProps).to.equal(false)
            expect('other2' in MagicClass.magicProps).to.equal(false)
            expect(delete MagicClass.other2).to.equal(true)
            expect('other2' in MagicClass.magicProps).to.equal(false)

            done()
        })

        it('magic delete >> not declared', function (done) {
            const NormalClass = class
            {
            }

            const MagicClass = magic(NormalClass)

            // undeclared prop
            expect(delete NormalClass.magic).to.equal(true)
            expect(delete NormalClass.other).to.equal(true)
            expect(delete MagicClass.magic).to.equal(true)
            expect(delete MagicClass.other).to.equal(true)

            done()
        })

        it('magic delete >> not return', function (done) {
            const NormalClass = class
            {
                static __delete() {
                }
            }

            const MagicClass = magic(NormalClass)

            // undeclared prop
            expect(delete NormalClass.magic).to.equal(true)
            expect(delete NormalClass.other).to.equal(true)
            expect(delete MagicClass.magic).to.equal(true)
            expect(delete MagicClass.other).to.equal(true)

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
            expect(MagicClass.prototype).to.equal(NormalClass.prototype)
            expect(SubMagicClass.name).to.equal(SubNormalClass.name)
            expect(SubMagicClass.length).to.equal(SubNormalClass.length)
            expect(SubMagicClass.prototype).to.equal(SubNormalClass.prototype)

            expect(NormalClass.isPrototypeOf(SubNormalClass)).to.equal(true)
            expect(NormalClass.isPrototypeOf(SubMagicClass)).to.equal(true)
            expect(Object.getPrototypeOf(SubNormalClass)).to.equal(NormalClass)
            expect(Object.getPrototypeOf(SubMagicClass)).to.equal(NormalClass)
            expect(MagicClass.isPrototypeOf(SubNormalClass)).to.equal(false)
            expect(MagicClass.isPrototypeOf(SubMagicClass)).to.equal(false)
            expect(MagicClass.prototype.constructor.isPrototypeOf(SubNormalClass)).to.equal(true)
            expect(MagicClass.prototype.constructor.isPrototypeOf(SubMagicClass)).to.equal(true)

            done()
        })

        it('inheritance >> from original class (recommended)', function (done) {
            const NormalClass = class
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

            // magic set
            SubMagicClass.magic = true
            expect(SubMagicClass.magicProps).to.deep.equal({
                magic: {
                    sub: true,
                },
            })
            // magic get
            expect(SubMagicClass.magic).to.deep.equal({sub: 'magic'})
            // magic call
            expect(SubMagicClass.callMagic('magic', true)).to.deep.equal({
                sub: {
                    method: 'callMagic',
                    parameters: ['magic', true],
                },
            })

            done()
        })

        it('inheritance >> from magic class (not recommended) [static members not inherited]', function (done) {
            const NormalClass = class
            {
                static normal = true

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
            }

            const MagicClass = magic(NormalClass)
            const SubMagicClass = class extends MagicClass
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

            // magic set
            SubMagicClass.magic = true
            expect(SubMagicClass.magicProps).to.deep.equal({
                magic: true,
            })
            // magic get
            expect(SubMagicClass.magic).to.deep.equal('magic')
            // magic call
            expect(SubMagicClass.callMagic('magic', true)).to.deep.equal({
                method: 'callMagic',
                parameters: ['magic', true],
            })

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
        it('{Input is Class >> instance}: magic set >> not declared', function (done) {
            const NormalClass = class
            {
            }

            const MagicClass = magic(NormalClass, false)
            const magicInstance = new MagicClass

            // undeclared prop
            magicInstance.magic = true
            expect(magicInstance.magic).to.equal(true)

            done()
        })

        it('{Input is Class >> instance}: magic (get+call) >> not declared', function (done) {
            const NormalClass = class
            {
            }

            const MagicClass = magic(NormalClass, false)
            const magicInstance = new MagicClass

            // undeclared prop
            expect(magicInstance.magic).to.be.undefined
            // undeclared method
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

        it('{Input is Class >> instance}: magic delete', function (done) {
            const NormalClass = class
            {
                normal = true
            }

            const MagicClass = magic(NormalClass, false)
            const magicInstance = new MagicClass

            // declared props
            delete magicInstance.normal
            expect('normal' in magicInstance).to.equal(false)

            done()
        })

        it('{Input is Class >> static}: magic set >> not declared', function (done) {
            const NormalClass = class
            {
            }

            const MagicClass = magic(NormalClass, false)

            // undeclared prop
            MagicClass.magic = true
            expect(MagicClass.magic).to.equal(true)

            done()
        })

        it('{Input is Class >> static}: magic (get+call) >> not declared', function (done) {
            const NormalClass = class
            {
            }

            const MagicClass = magic(NormalClass, false)

            // undeclared prop
            expect(MagicClass.magic).to.be.undefined
            // undeclared method
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

        it('{Input is Class >> static}: magic delete', function (done) {
            const NormalClass = class
            {
                static normal = true
            }

            const MagicClass = magic(NormalClass, false)

            // declared props
            delete MagicClass.normal
            expect('normal' in NormalClass).to.equal(false);
            // special props
            (props => props.forEach(prop => {
                try {
                    delete MagicClass[prop]
                }
                catch (e) {
                    expect(e).to.be.an.instanceof(TypeError)
                    expect(e.message).to.equal(`Cannot delete static property [${prop}].`)
                }
            }))(['__instance', '__singleton'])

            done()
        })
    })

    describe('Others', function () {
        it('magic >> Input is Instance', function (done) {
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

        it('magic >> Input is not supported', function (done) {
            try {
                const magicInstance = magic('string')
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('The [target] parameter must be a function or an object.')
            }

            done()
        })

        it('other proxy traps', function (done) {
            const ParentClass = class
            {
                parent = 'parent'
            }
            const NormalClass = class
            {
                static normal = 'normal'

                normal = 'normal'
            }

            // setPrototypeOf
            const MagicClass = magic(NormalClass)
            try {
                Object.setPrototypeOf(MagicClass, ParentClass)
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal(`Cannot change prototype of the class [${NormalClass.name}].`)
            }

            const magicInstance = new MagicClass()
            try {
                Object.setPrototypeOf(magicInstance, ParentClass)
            }
            catch (e) {
                expect(e).to.be.an.instanceof(TypeError)
                expect(e.message).to.equal('Cannot change prototype of the instance.')
            }

            // defineProperty + getOwnPropertyDescriptor + ownKeys
            Object.defineProperty(MagicClass, 'magic', {
                value: 'magic',
                configurable: true,
                writable: true,
                enumerable: true,
            })
            Object.defineProperty(magicInstance, 'magic', {
                value: 'magic',
                configurable: true,
                writable: true,
                enumerable: true,
            })
            expect(Object.getOwnPropertyDescriptor(MagicClass, 'magic')).to.deep.equal({
                value: 'magic',
                configurable: true,
                writable: true,
                enumerable: true,
            })
            expect(Object.getOwnPropertyDescriptor(magicInstance, 'magic')).to.deep.equal({
                value: 'magic',
                configurable: true,
                writable: true,
                enumerable: true,
            })
            expect(Object.keys(MagicClass)).to.deep.equal(['normal', 'magic'])
            expect(Object.keys(magicInstance)).to.deep.equal(['normal', 'magic'])

            // preventExtensions + isExtensible
            expect(Object.preventExtensions(MagicClass)).to.equal(MagicClass)
            expect(Object.preventExtensions(magicInstance)).to.equal(magicInstance)
            expect(Object.isExtensible(MagicClass)).equal(false)
            expect(Object.isExtensible(magicInstance)).equal(false)

            done()
        })
    })
})
