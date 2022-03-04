// 参考文档 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
describe('test defineProperty', () => {
  test('基础用法get set', () => {
    const person: { name?: string } = {};
    let personName = 'a';

    const mockGet = jest.fn();
    const mockSet = jest.fn();
    //在person对象上添加属性name,值为personName
    Object.defineProperty(person, 'name', {
      //但是默认是不可枚举的(for in打印打印不出来)，可：enumerable: true
      //默认不可以修改，可：writable：true
      //默认不可以删除，可：configurable：true
      get: function () {
        mockGet();
        return personName;
      },
      set: function (val) {
        mockSet();
        personName = val;
      },
    });

    // 初始时为set和get的次数都为0
    expect(mockGet.mock.calls.length).toBe(0);
    expect(mockSet.mock.calls.length).toBe(0);

    // get一次
    expect(person.name).toBe('a');
    expect(mockGet.mock.calls.length).toBe(1);
    expect(mockSet.mock.calls.length).toBe(0);

    // set一次，再get一次
    person.name = 'b';
    expect(person.name).toBe('b');
    expect(mockGet.mock.calls.length).toBe(2);
    expect(mockSet.mock.calls.length).toBe(1);
  });
  test('writable', () => {
    //  不可修改
    const person: { name?: string } = {};
    Object.defineProperty(person, 'name', {
      writable: false, // 设为false后和set不能同在
      value: 'a',
    });
    expect(person.name).toEqual('a');

    expect(() => {
      person.name = 'b';
    }).toThrowError();
  });
  test('enumerable', () => {
    //  不可枚举
    const person: { name?: string } = {};
    let personName = 'a';
    Object.defineProperty(person, 'name', {
      get: function () {
        return personName;
      },
      set: function (val) {
        personName = val;
      },
    });
    expect(Object.keys(person)).toEqual([]);

    //  可枚举
    const person2: { name?: string } = {};
    let personName2 = 'a';
    Object.defineProperty(person2, 'name', {
      enumerable: true,
      get: function () {
        return personName2;
      },
      set: function (val) {
        personName2 = val;
      },
    });
    expect(Object.keys(person2)).toEqual(['name']);
  });
  test('configurable', () => {
    //  可删除
    const person: { name?: string } = {};
    Object.defineProperty(person, 'name', {
      configurable: true,
      value: 'a',
    });
    expect(person.name).toEqual('a');
    delete person.name;
    expect(person.name).toBeUndefined();

    //  不可删除
    const person2: { name?: string } = {};
    Object.defineProperty(person2, 'name', {
      configurable: false,
      value: 'a',
    });
    expect(person2.name).toEqual('a');
    expect(() => {
      delete person2.name;
    }).toThrowError();
  });
});
