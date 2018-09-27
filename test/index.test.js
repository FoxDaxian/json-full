import jsonf from 'json-full';

var ff = function() {
    return '你好';
};
var aa = Symbol('foo123');
var obj = {
    one: ff,
    tow: {
        name: 'fox',
        test: Object.create(null, {
            x: { value: '我是不不可枚举的', enumerable: false },
            z: {
                value: '我不可枚举，但是可以配置',
                enumerable: false,
                configurable: true
            },
            y: { value: '我是可以枚举的', enumerable: true }
        })
    },
    three: Symbol(21),
    regepx: /23/,
    [Symbol('foo')]: Object.create(null, {
        ssssss: { value: '我是不可枚举的', enumerable: false },
        z: {
            value: '我不可枚举，但是可以配置',
            enumerable: false,
            configurable: true
        },
        y: { value: '我是可以枚举的', enumerable: true }
    }),
    [aa]: 111,
    cla: class {
        constructor() {
            this.a = 'liming';
        }
    },
    [function() {}]: 123,
    last: undefined,
    but: null,
    22222: 0b111,
    [0b111]: '二进制字面量',
    date1: new Date(),
    date2: new Date(null),
    date3: new Date(undefined),
    date4: Date
};

console.log(jsonf);
console.log(jsonf.stringify(obj));

test('adds 1 + 2 to equal 3', () => {
    expect(3).toBe(3);
});
