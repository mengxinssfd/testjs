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
        // 用person.name会无限循环
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

  // 类似Vue.$set()
  function $set(obj: any, key: string | number, value: any, getMock: Function, setMock: Function) {
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        getMock(key, value);
        return value;
      },
      set(val) {
        value = val;
        setMock(key, value);
      },
    });
  }

  describe('监听对象', () => {
    const origin = { a: 1, b: 2, c: 3 };

    describe('use defineProperty', () => {
      test('不添加额外的key', () => {
        const obj = { ...origin };
        const getMock = jest.fn();
        const setMock = jest.fn();

        Object.keys(obj).forEach((key) => {
          $set(obj, key, obj[key], getMock, setMock);
        });

        // 初始次数
        expect(getMock.mock.calls.length).toBe(0);
        expect(setMock.mock.calls.length).toBe(0);

        // 遍历一次
        const objCopy: any = {};
        Object.keys(obj).forEach((k) => {
          objCopy[k] = obj[k];
        });
        expect(objCopy).toEqual(origin);
        // get调用了3次
        expect(getMock.mock.calls.length).toBe(3);
        expect(
          getMock.mock.calls.reduce((pre, [key, value]) => {
            pre[key] = value;
            return pre;
          }, {} as any),
        ).toEqual(origin);

        // expect(obj).toEqual( origin);
        // expect(getMock.mock.calls.length).toBe(9); // jest的toEqual可能多遍历了几次
        for (const k in obj) {
          expect(obj[k]).toEqual(origin[k]);
        }
        expect(getMock.mock.calls.length).toBe(6);

        expect(setMock.mock.calls.length).toBe(0);
        obj.a++;
        expect(obj.a).toBe(2);
        expect(getMock.mock.calls.length).toBe(8);
        expect(setMock.mock.calls.length).toBe(1);
      });

      test('添加额外的key', () => {
        const obj = { ...origin };
        const getMock = jest.fn();
        const setMock = jest.fn();

        Object.keys(obj).forEach((key) => {
          $set(obj, key, obj[key], getMock, setMock);
        });

        expect(setMock.mock.calls.length).toBe(0);
        expect(getMock.mock.calls.length).toBe(0);

        $set(obj, 'd', 'd', getMock, setMock);

        expect(setMock.mock.calls.length).toBe(0);
        expect(getMock.mock.calls.length).toBe(0);

        obj['d'] = 'dd';
        expect(setMock.mock.calls.length).toBe(1);
        expect(getMock.mock.calls.length).toBe(0);

        expect(obj['d']).toBe('dd');
        expect(getMock.mock.calls.length).toBe(1);
      });
    });
    test('use defineProperties', () => {
      const obj = { ...origin };
      const getMock = jest.fn();
      const setMock = jest.fn();

      const props: PropertyDescriptorMap = {};
      Object.keys(obj).forEach((key) => {
        let value = obj[key];
        props[key] = {
          enumerable: true,
          configurable: true,
          get() {
            getMock(key, value);
            return value;
          },
          set(val) {
            value = val;
            setMock(key, value);
          },
        } as PropertyDescriptor;
      });
      Object.defineProperties(obj, props);

      // 初始次数
      expect(getMock.mock.calls.length).toBe(0);
      expect(setMock.mock.calls.length).toBe(0);

      // 遍历一次
      const objCopy: any = {};
      Object.keys(obj).forEach((k) => {
        objCopy[k] = obj[k];
      });
      expect(objCopy).toEqual(origin);
      // get调用了3次
      expect(getMock.mock.calls.length).toBe(3);
      expect(
        getMock.mock.calls.reduce((pre, [key, value]) => {
          pre[key] = value;
          return pre;
        }, {} as any),
      ).toEqual(origin);

      // expect(obj).toEqual( origin);
      // expect(getMock.mock.calls.length).toBe(9); // jest的toEqual可能多遍历了几次
      for (const k in obj) {
        expect(obj[k]).toEqual(origin[k]);
      }
      expect(getMock.mock.calls.length).toBe(6);
    });
  });

  describe('监听数组', () => {
    const origin = [1, 2, 3, 4, 5];

    let arr: number[] = [];
    let getMock = jest.fn();
    let setMock = jest.fn();

    beforeEach(() => {
      arr = [...origin];
      getMock = jest.fn();
      setMock = jest.fn();
      arr.forEach((v, k) => {
        $set(arr, k, v, getMock, setMock);
      });
    });

    test('base', () => {
      expect(getMock.mock.calls.length).toBe(0);
      expect(arr[0]).toBe(1);
      expect(getMock.mock.calls.length).toBe(1);

      // 遍历一次
      arr.forEach((v, k) => {
        expect(v).toEqual(origin[k]);
      });
      expect(getMock.mock.calls.length).toBe(6);
    });
    test('push', () => {
      expect(getMock.mock.calls.length).toBe(0);
      expect(setMock.mock.calls.length).toBe(0);
      // const push = arr.push;
      arr.push = function (...args) {
        const index = arr.length;

        args.forEach((v, k) => {
          setMock(index + k, v);
          $set(arr, index + k, v, getMock, setMock);
        });

        return arr.length;
      };
      arr.push(6);
      expect(getMock.mock.calls.length).toBe(0);
      expect(setMock.mock.calls.length).toBe(1);
      expect(arr[5]).toBe(6);
      expect(arr.length).toBe(6);
      expect(getMock.mock.calls.length).toBe(1);
      expect(setMock.mock.calls.length).toBe(1);
    });

    // defineProperty无法设置数组的length
    // Cannot redefine property: length
    // TypeError: Cannot redefine property: length
    /* test('length', () => {
      $set(arr, 'length', arr.length, getMock, setMock);
      expect(getMock.mock.calls.length).toBe(0);
      expect(setMock.mock.calls.length).toBe(0);

      arr.length = 0;
      expect(getMock.mock.calls.length).toBe(0);
      expect(arr).toEqual([]);
    }); */

  });
});
