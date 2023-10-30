/**
 *
 * @param {Object} instance
 * @param {boolean} strict
 * @return {Object}
 */
function magicInstance(instance, strict) {
    let instanceProxy

    const handler = {
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
        has(target, p) {
            if (Reflect.has(instance, p)) {
                return true
            }

            const has = Reflect.get(instance, '__has')
            if (typeof has === 'function') {
                return Reflect.apply(has, instanceProxy, [p]) ?? false
            }

            return false
        },
        deleteProperty(target, p) {
            if (Reflect.has(instance, p)) {
                if (strict) {
                    throw new TypeError(`Cannot delete property [${p}].`)
                }
                return Reflect.deleteProperty(instance, p)
            }

            const deleter = Reflect.get(instance, '__delete')
            if (typeof deleter === 'function') {
                return Reflect.apply(deleter, instanceProxy, [p]) ?? true
            }

            return true
        },
        setPrototypeOf(target, v) {
            throw new TypeError('Cannot change prototype of the instance.')
        },
        getPrototypeOf() {
            return Reflect.getPrototypeOf(instance)
        },
        defineProperty(target, property, attributes) {
            return Reflect.defineProperty(instance, property, attributes)
        },
        getOwnPropertyDescriptor(target, p) {
            return Reflect.getOwnPropertyDescriptor(instance, p)
        },
        ownKeys() {
            return Reflect.ownKeys(instance)
        },
        preventExtensions() {
            return Reflect.preventExtensions(instance)
        },
        isExtensible() {
            return Reflect.isExtensible(instance)
        },
    }

    const invoke = Reflect.get(instance, '__invoke')

    return instanceProxy = typeof invoke === 'function'
        ? new Proxy(invoke, {
            apply(target, thisArg, argArray) {
                return Reflect.apply(invoke, instanceProxy, argArray)
            },
            ...handler,
        })
        : new Proxy(instance, handler)
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
        get(target, p) {
            switch (p) {
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
        has(target, p) {
            if (Reflect.has(Class, p)) {
                return true
            }

            if (['__instance', '__singleton'].includes(p)) {
                return true
            }

            const has = Reflect.get(Class, '__has')
            if (typeof has === 'function') {
                return Reflect.apply(has, ClassProxy, [p]) ?? false
            }

            return false
        },
        deleteProperty(target, p) {
            if (Reflect.has(Class, p)) {
                if (strict) {
                    throw new TypeError(`Cannot delete static property [${p}].`)
                }
                return Reflect.deleteProperty(Class, p)
            }

            if (['__instance', '__singleton'].includes(p)) {
                throw new TypeError(`Cannot delete static property [${p}].`)
            }

            const deleter = Reflect.get(Class, '__delete')
            if (typeof deleter === 'function') {
                return Reflect.apply(deleter, ClassProxy, [p]) ?? true
            }

            return true
        },
        setPrototypeOf(target, v) {
            throw new TypeError(`Cannot change prototype of the class [${Class.name}].`)
        },
        getPrototypeOf() {
            return Reflect.getPrototypeOf(Class)
        },
        defineProperty(target, property, attributes) {
            return Reflect.defineProperty(Class, property, attributes)
        },
        getOwnPropertyDescriptor(target, p) {
            return Reflect.getOwnPropertyDescriptor(Class, p)
        },
        ownKeys() {
            return Reflect.ownKeys(Class)
        },
        preventExtensions() {
            return Reflect.preventExtensions(Class)
        },
        isExtensible() {
            return Reflect.isExtensible(Class)
        },
    })
}

export default function magic(target, strict = true) {
    if (typeof target === 'function') {
        return magicClass(target, strict)
    }
    if (target !== null && typeof target === 'object') {
        return magicInstance(target, strict)
    }
    throw new TypeError('The [target] parameter must be a function or an object.')
}
