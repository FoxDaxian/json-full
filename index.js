/*
 * @Author: fox 
 * @Date: 2018-09-27 14:54:02 
 * @Last Modified by: fox
 * @Last Modified time: 2018-09-27 17:37:16
 */
/**
 * JSON.stringify特点：
 * 不能保证输出后的顺序和之前是一致的
 * undefined、任意函数、symbol会被忽略，在数组中会变成null
 * 所有以symbol为属性建的属性都会被完全忽略掉，即使replacer参数中做了处理
 * 不可枚举的属性会被忽略
 */

!(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['./json.js', 'lodash', 'chalk', './package.json'], factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS
        module.exports = factory(
            require('./json.js'),
            require('lodash'),
            require('chalk'),
            require('./package.json')
        );
    } else {
        // not support browser
    }
})(this, function(json, _, chalk, pk) {
    // is native?
    var isNativeMethod = (function() {
        var toString = Function.prototype.toString;
        return function(fn, name) {
            // Function.prototype.toString 只能用在 function 上，否则会抛 TypeError
            if (typeof fn != 'function') return false;
            // 若 function.name 与实参 name 不同则无需正则检查，但 IE 浏览器不支持 function.name
            if (typeof fn.name != 'undefined' && name !== fn.name) return false;
            var matches = toString
                .apply(fn)
                .match(
                    /^\s*function\s+([\w\$]+)\([^)]*\)\s*\{\s*\[native code\]\s*\}\s*$/
                );
            if (!matches) return false;
            return name === matches[1];
        };
    })();
    // 遍历 + 处理 不可枚举对象，对原对象做了修改!!
    function recursion(obj, prefix) {
        var type = Object.prototype.toString.call(obj);
        if (type !== '[object Object]') {
            return obj;
        }
        Object.getOwnPropertyNames(obj).forEach(function(item) {
            var type = Object.prototype.toString.call(obj[item]);

            if (type === '[object Object]') {
                obj[item] = recursion(obj[item], prefix);
            }
            if (!Object.prototype.propertyIsEnumerable.call(obj, item)) {
                obj[
                    `${prefix || 'not enumerable or configurable key: '}${item}`
                ] = obj[item];
            }
        });
        return obj;
    }

    // 处理key为symbol的情况
    function handleSymbol(obj, prefix) {
        var symbol_keys = Object.getOwnPropertySymbols(obj);
        for (var i = 0, len = symbol_keys.length; i < len; i++) {
            obj[`${prefix || 'Symbol key: '}${symbol_keys[i].toString()}`] =
                obj[symbol_keys[i]];
        }
    }

    function stringify(target, opt) {
        target = target || {};
        opt = opt || {};
        var indent = opt.indent || 4;
        var funcType = opt.funcType || 'short';
        var prefix = opt.prefix;
        target = _.cloneDeepWith(target, function(value) {
            recursion(value, prefix);
        });
        handleSymbol(target, prefix);
        // 处理value为函数、undefined、symbol的情况
        var res = json.stringify(
            target,
            function(k, v) {
                const typeStr = Object.prototype.toString.call(v);
                const type = typeStr.slice(8, -1);
                switch (typeStr) {
                    case '[object Function]':
                        const funcName = v.name || 'anonymous';
                        if (funcType === 'short') {
                            const isNative = isNativeMethod(v, funcName);
                            try {
                                v();
                                v = isNative
                                    ? `[Native Function: ${funcName}]`
                                    : `[Function: ${funcName}]`;
                            } catch (e) {
                                v = isNative
                                    ? `[Native Function(class): ${funcName}]`
                                    : `[Function(class): ${funcName}]`;
                            }
                        } else if (funcType === 'long') {
                            v = v.toString();
                        }
                        break;
                    case '[object Undefined]':
                        v = `${prefix || `${type} key: `}undefined`;
                        break;
                    case '[object Symbol]':
                        v = `${prefix || `${type} key: `}${v.toString()}`;
                        break;
                    case '[object RegExp]':
                        v = `${prefix || `${type} key: `}${v.toString()}`;
                        break;
                }

                // TODO: 取色器+附着颜色
                return v;
            },
            indent
        );
        return res;
    }

    // 暴露公共方法
    return { stringify, parse: json.parse, __v: pk.version };
});
