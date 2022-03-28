describe('test Proxy', () => {
  test('base', () => {
    const getCall = jest.fn();
    const setCall = jest.fn();
    const outGetCall = jest.fn();
    const outSetCall = jest.fn();
    const person = { age: 0, name: 'test' };
    const proxy = new Proxy(person, {
      get(
        target: typeof person,
        p: string | symbol /*, receiver: any // Proxy或者继承Proxy的对象 */,
      ): any {
        getCall();
        if (p in target) {
          return target[p];
        }
        outGetCall();
        return 0;
      },
      set(target: typeof person, p: string | symbol, value: any /*, receiver: any*/): boolean {
        setCall();
        if (!(p in target)) {
          outSetCall();
        }
        target[p] = value;
        return true;
      },
    });

    // get
    expect(getCall.mock.calls.length).toBe(0);
    expect(setCall.mock.calls.length).toBe(0);
    expect(proxy.age).toBe(0);
    expect(getCall.mock.calls.length).toBe(1);
    expect(setCall.mock.calls.length).toBe(0);

    // set
    proxy.age = 20;
    expect(proxy.age).toBe(20);
    expect(getCall.mock.calls.length).toBe(2);
    expect(setCall.mock.calls.length).toBe(1);

    // get不存在person中的key
    // proxy['test'] = 20;
    expect(outGetCall.mock.calls.length).toBe(0);
    expect(outSetCall.mock.calls.length).toBe(0);
    expect(proxy['test']).toBe(0);
    expect(getCall.mock.calls.length).toBe(3);
    expect(setCall.mock.calls.length).toBe(1);
    expect(outGetCall.mock.calls.length).toBe(1);
    expect(outSetCall.mock.calls.length).toBe(0);

    // set不存在person中的key
    proxy['test'] = 20;
    expect(outSetCall.mock.calls.length).toBe(1);
    expect(proxy['test']).toBe(20);
    expect(setCall.mock.calls.length).toBe(2);
    expect(outGetCall.mock.calls.length).toBe(1);

    proxy['test'] = 30;
    expect(outSetCall.mock.calls.length).toBe(1);

    expect(getCall.mock.calls.length).toBe(4);
    expect(Reflect.get(proxy, 'test')).toBe(30);
    expect(getCall.mock.calls.length).toBe(5);
  });
  test('test sub object', () => {
    const obj = { name: 'obj', sub: { name: 'sub' } };
    const getCall = jest.fn();
    const setCall = jest.fn();
    const proxy = new Proxy(obj, {
      get(
        target: typeof obj,
        p: string | symbol /*, receiver: any // Proxy或者继承Proxy的对象 */,
      ): any {
        getCall(p);
        if (p in target) {
          return target[p];
        }
        return 0;
      },
      set(target: typeof obj, p: string | symbol, value: any /*, receiver: any*/): boolean {
        setCall(p);
        target[p] = value;
        return true;
      },
    });

    expect(proxy.sub.name).toBe('sub');
    expect(getCall.mock.calls.length).toBe(1);
    expect(getCall.mock.calls[0][0]).toBe('sub');

    const sub = proxy.sub;
    expect(getCall.mock.calls.length).toBe(2);
    expect(getCall.mock.calls[1][0]).toBe('sub');

    sub.name = "test";
    // 未触发get
    expect(getCall.mock.calls.length).toBe(2);
    expect(getCall.mock.calls[1][0]).toBe('sub');
    // 未触发set
    // 取出来以后就不会再触发proxy的钩子，也就是说不会递归proxy
    // vue3的可以(见vue3Proxy.test.html)，可能是递归proxy了
    expect(setCall.mock.calls.length).toBe(0);
  });
  test('array', () => {
    const arr = [1, 2, 3];

    const getCall = jest.fn();
    const setCall = jest.fn();

    function callParams(fn: jest.Mock): () => string[] {
      return () => fn.mock.calls.map((item) => item[0]);
    }
    const getCallParams = callParams(getCall);
    const setCallParams = callParams(setCall);

    const setParamsArr: string[] = [];
    const getParamsArr: string[] = [];

    const proxy = new Proxy(arr, {
      get(target: typeof arr, p: string | symbol): any {
        getCall(`get ${p as string}`);
        return target[p];
      },
      set(target: typeof arr, p: string | symbol, value: any): boolean {
        setCall(`set ${p as string}`);
        target[p] = value;
        return true;
      },
    });

    expect(getCall.mock.calls.length).toBe(0);
    expect(setCall.mock.calls.length).toBe(0);

    // 操作：设置数组长度
    proxy.length = 1;
    expect(getCall.mock.calls.length).toBe(0);
    expect(setCall.mock.calls.length).toBe(1);
    setParamsArr.push('set length');
    expect(setCallParams()).toEqual(setParamsArr);
    expect(getCallParams()).toEqual(getParamsArr);

    // 操作：使用map生成一个数组
    // expect(proxy).toEqual([1]); // toEqual遍历次数有点多
    expect(proxy.map((v) => v)).toEqual([1]);
    getParamsArr.push('get map', 'get length', 'get constructor', 'get 0');
    expect(setCallParams()).toEqual(setParamsArr);
    expect(getCallParams()).toEqual(getParamsArr);

    // 操作：set proxy[0]
    proxy[0] = 0;
    setParamsArr.push('set 0');
    expect(setCall.mock.calls.length).toBe(2);
    expect(setCallParams()).toEqual(setParamsArr);
    expect(getCallParams()).toEqual(getParamsArr);

    // 操作：get proxy[0]
    expect(proxy[0]).toBe(0);
    getParamsArr.push('get 0');
    expect(setCallParams()).toEqual(setParamsArr);
    expect(getCallParams()).toEqual(getParamsArr);

    // 操作：push(2)
    proxy.push(2);
    getParamsArr.push('get push', 'get length');
    setParamsArr.push('set 1', 'set length');

    // 操作：proxy[0]++
    proxy[0]++;
    getParamsArr.push('get 0');
    setParamsArr.push('set 0');

    // 操作：get proxy[0]
    expect(proxy[0]).toBe(1);
    getParamsArr.push('get 0');

    expect(setCallParams()).toEqual(setParamsArr);
    expect(getCallParams()).toEqual(getParamsArr);
  });
  describe('bind this', () => {
    class Name {
      constructor(public firstName: string, public lastName: string) {}

      get fullName() {
        return this.firstName + ' ' + this.lastName;
      }

      this() {
        return this;
      }
    }

    test('指向proxy', () => {
      const name = new Name('hello', 'world');
      expect(name.fullName).toBe('hello world');

      // this指向proxy
      const nameProxy = new Proxy(name, {});
      expect(nameProxy.this()).toBe(nameProxy);
      expect(nameProxy.this()).not.toBe(name);

      // 由于nameProxy代理了name，所以name.firstName name.lastName和nameProxy的是一样的
      expect(nameProxy.fullName).toBe('hello world');
    });

    test('指向原对象', () => {
      const name = new Name('Bill', 'Gates');
      // 绑定this
      const nameProxy = new Proxy(name, {
        get(target: Name, p: string | symbol): any {
          const value = target[p];
          if (typeof value === 'function') {
            return value.bind(target);
          }
          return value;
        },
      });
      expect(nameProxy.this()).toBe(name);
      expect(nameProxy.this()).not.toBe(nameProxy);

      expect(nameProxy.fullName).toBe('Bill Gates');
    });
  });
});
