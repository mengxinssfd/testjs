describe('test Proxy', () => {
  test('base', () => {
    const getCall = jest.fn();
    const setCall = jest.fn();
    const outGetCall = jest.fn();
    const outSetCall = jest.fn();
    const person = { age: 0, name: 'test' };
    const proxy = new Proxy(person, {
      get(target: typeof person, p: string | symbol /*, receiver: any*/): any {
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
