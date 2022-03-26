//

// 可以使用Object.create实现继承
describe('create', () => {
  test('基础用法', () => {
    const prototype1 = {
      getThis() {
        return this;
      },
    };
    const object1 = Object.create(prototype1);

    // 复制的object没有prototype
    expect(object1.prototype).toBeUndefined();

    // __proto__指向prototype1
    expect(object1.__proto__).toBe(prototype1);

    // 可通过Object.getPrototypeOf获取原型
    expect(Object.getPrototypeOf(object1)).toBe(prototype1);

    // 继承的函数返回的this指向复制后的object
    expect(object1.getThis()).toBe(object1);
  });
  // 第二个参数和Object.defineProperties的第二个参数一样
  test('第二个参数', () => {
    const prototype1 = {
      getThis() {
        return this;
      },
    };
    const getMock = jest.fn();
    const setMock = jest.fn();
    const p = Object.create(prototype1, {
      value: {
        get() {
          getMock();
          return 10;
        },
        set(v) {
          setMock(v);
        },
      },
    });

    expect(p.value).toBe(10);
    p.value = 20;
    expect(p.value).toBe(10);
    expect(getMock.mock.calls.length).toBe(2);
    expect(setMock.mock.calls.length).toBe(1);
    expect(p.getThis()).toBe(p);
  });
  test('如果proto参数不是 null 或非原始包装对象，则抛出一个 TypeError 异常。', () => {
    expect(() => Object.create(1 as any)).toThrow();
    expect(() => Object.create(true as any)).toThrow();
    expect(() => Object.create('1' as any)).toThrow();
    expect(() => Object.create(/123/ as any)).toThrow();
  });
});