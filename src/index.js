/**
 *
 * @param {Object} instance
 * @param {boolean} strict
 * @return {Object}
 */
function magicInstance(instance, strict) {
    let instanceProxy

    const handler = {
        get(target, p) {
            if (Reflect.has(instance, p)) {
                return Reflect.get(instance, p, instanceProxy)
            }

            const getter = Reflect.get(instance, '__get')
            if (typeof getter === 'function') {
                const value = Reflect.apply(getter, instanceProxy, [p])
                if (value !== undefined) {
                    return value
                }
            }

            const caller = Reflect.get(instance, '__call')
            if (typeof caller === 'function') {
                return function (...parameters) {
                    parameters.unshift(p)
                    return Reflect.apply(caller, instanceProxy, parameters)
                }
            }

            if (strict) {
                throw new ReferenceError(`Property [${p}] does not exist.`)
            }
            return undefined
        },
        set(target, p, newValue) {
            if (Reflect.has(instance, p)) {
                return Reflect.set(instance, p, newValue, instanceProxy)
            }

            const setter = Reflect.get(instance, '__set')
            if (typeof setter === 'function') {
                return Reflect.apply(setter, instanceProxy, [p, newValue]) ?? true
            }

            if (strict) {
                throw new ReferenceError(`Property [${p}] does not exist.`)
            }
            return Reflect.set(instance, p, newValue, instanceProxy)
        },
        has(target, p) {
            if (Reflect.has(instance, p)) {
                return true
            }

            const caller = Reflect.get(instance, '__call')
            if (typeof caller === 'function') {
                return true
            }

            const getter = Reflect.get(instance, '__get')
            if (typeof getter === 'function') {
                if (Reflect.apply(getter, instanceProxy, [p]) !== undefined) {
                    return true
                }
            }

            return false
        },
        deleteProperty(target, p) {
            if (strict) {
                throw new TypeError(`Cannot delete property [${p}]`)
            }

            if (Reflect.has(instance, p)) {
                return Reflect.deleteProperty(instance, p)
            }

            // TODO: should implement magic delete ??

            return true
        },
        getPrototypeOf() {
            return Reflect.getPrototypeOf(instance)
        },
    }

    const invoke = Reflect.get(instance, '__invoke')
    if (typeof invoke === 'function') {
        return instanceProxy = new Proxy(invoke, {
            apply(target, thisArg, argArray) {
                return Reflect.apply(invoke, instanceProxy, argArray)
            },
            ...handler,
        })
    }

    return instanceProxy = new Proxy(instance, handler)
}

function magicClass(Class, strict) {
    let ClassProxy

    const InstanceFactory = {
        singletonEnabled: false,
        singletonInstance: null,
        getInstance(...constructParams) {
            return Reflect.construct(ClassProxy, constructParams)
        },
        getSingleton(...constructParams) {
            this.singletonEnabled = true
            return this.getInstance(...constructParams)
        },
        getInstanceProxy(constructParams, newTarget) {
            const createInstanceProxy = () => magicInstance(
                Reflect.construct(Class, constructParams, newTarget),
                strict,
            )
            if (this.singletonEnabled) {
                if (this.singletonInstance === null) {
                    this.singletonInstance = createInstanceProxy()
                }
                return this.singletonInstance
            }
            return createInstanceProxy()
        },
    }
    return ClassProxy = new Proxy(Class, {
        construct(target, argArray, newTarget) {
            return InstanceFactory.getInstanceProxy(argArray, newTarget)
        },
        get(target, p) {
            switch (p) {
                case '__static':
                    return ClassProxy
                case '__instance':
                    return (...constructParams) => InstanceFactory.getInstance(...constructParams)
                case '__singleton':
                    return (...constructParams) => InstanceFactory.getSingleton(...constructParams)
                default:
                    if (Reflect.has(Class, p)) {
                        return Reflect.get(Class, p, ClassProxy)
                    }

                    const getter = Reflect.get(Class, '__get')
                    if (typeof getter === 'function') {
                        const value = Reflect.apply(getter, ClassProxy, [p])
                        if (value !== undefined) {
                            return value
                        }
                    }

                    const caller = Reflect.get(Class, '__call')
                    if (typeof caller === 'function') {
                        return function (...parameters) {
                            parameters.unshift(p)
                            return Reflect.apply(caller, ClassProxy, parameters)
                        }
                    }

                    if (strict) {
                        throw new ReferenceError(`Static property [${p}] does not exist.`)
                    }
                    return undefined
            }
        },
        set(target, p, newValue) {
            if (Reflect.has(Class, p)) {
                return Reflect.set(Class, p, newValue, ClassProxy)
            }

            const setter = Reflect.get(Class, '__set')
            if (typeof setter === 'function') {
                return Reflect.apply(setter, ClassProxy, [p, newValue]) ?? true
            }

            if (strict) {
                throw new ReferenceError(`Static property [${p}] does not exist.`)
            }
            return Reflect.set(Class, p, newValue, ClassProxy)
        },
        has(target, p) {
            if (Reflect.has(Class, p)) {
                return true
            }

            if (['__static', '__instance', '__singleton'].includes(p)) {
                return true
            }

            const caller = Reflect.get(Class, '__call')
            if (typeof caller === 'function') {
                return true
            }

            const getter = Reflect.get(Class, '__get')
            if (typeof getter === 'function') {
                if (Reflect.apply(getter, ClassProxy, [p]) !== undefined) {
                    return true
                }
            }

            return false
        },
        deleteProperty(target, p) {
            if (strict || ['__static', '__instance', '__singleton'].includes(p)) {
                throw new TypeError(`Cannot delete static property [${p}]`)
            }

            if (Reflect.has(Class, p)) {
                return Reflect.deleteProperty(Class, p)
            }

            // TODO: should implement magic delete ??

            return true
        },
        getPrototypeOf() {
            return Reflect.getPrototypeOf(Class)
        },
    })
}

export function magic(target, strict = true) {
    if (target !== null && typeof target === 'object') {
        return magicInstance(target, strict)
    }
    if (typeof target !== 'function') {
        throw new TypeError('The [target] parameter must be a function or an object.')
    }
    return magicClass(target, strict)
}

export const MagicMixin = (Class, strict = true) => class extends Class
{
    static ___magic

    static {
        this.___magic = magic(this, strict)
    }

    static get __static() {
        return this.___magic
    }

    static __instance(...constructParams) {
        return this.__static.__instance(...constructParams)
    }

    static __singleton(...constructParams) {
        return this.__static.__singleton(...constructParams)
    }
}

export class MagicClass
{
    static ___magic

    static get __static() {
        return this.___magic
    }

    static __instance(...constructParams) {
        return this.__static.__instance(...constructParams)
    }

    static __singleton(...constructParams) {
        return this.__static.__singleton(...constructParams)
    }

    static __magic(strict = true) {
        this.___magic = magic(this, strict)
        return this
    }
}
