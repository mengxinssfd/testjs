// 测试js生成器
// 参考 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Generator
describe('Generator', () => {
  test('base', () => {
    function* gen() {
      yield 'hello';
      yield 'world';
      return 'ending';
    }
    const t = gen();

    expect(t.next()).toEqual({ done: false, value: 'hello' });
    expect(t.next()).toEqual({ done: false, value: 'world' });
    expect(t.next()).toEqual({ done: true, value: 'ending' }); // return 'ending'
    // 后续无论再调多少次next value都是undefined
    expect(t.next()).toEqual({ done: true, value: undefined });
    expect(t.next()).toEqual({ done: true, value: undefined });
    expect(t.next()).toEqual({ done: true, value: undefined });
  });
  test('next', () => {
    const value = jest.fn();
    function* gen(init = 0) {
      const res1 = yield init + 10; // 相当于: return init + 10; const res1 = next(x);
      value(res1);
      const res2 = yield res1 + 20; // 相当于: return res1 + 20;  const res2 = next(x);
      value(res2);
      return res2;
    }
    const g = gen(10);

    // 相当于: return init(10) + 10; // 第一个next只是启动，传的值没有意义，会被丢弃
    expect(g.next(1)).toEqual({ done: false, value: 20 });
    expect(value.mock.calls.length).toBe(0);

    // 相当于: const res1 = next(2); return 2 + 20;
    expect(g.next(2)).toEqual({ done: false, value: 22 });
    expect(value.mock.calls[0][0]).toBe(2); // res1 = 2;

    // 相当于: const res2 = next(8); return res2;
    expect(g.next(8)).toEqual({ done: true, value: 8 });
    expect(value.mock.calls[1][0]).toBe(8); // res1 = 2;

    expect(g.next(10)).toEqual({ done: true, value: undefined });
    expect(g.next(10)).toEqual({ done: true, value: undefined });
    expect(g.next(10)).toEqual({ done: true, value: undefined });
  });
  test('next2', () => {
    const fn = jest.fn();
    function* base() {
      fn(`1.${yield}`);
      fn(`2.${yield}`);
      return 'end';
    }
    const g = base();
    expect(g.next()).toEqual({ done: false, value: undefined });
    expect(g.next('hello')).toEqual({ done: false, value: undefined });
    expect(g.next('world')).toEqual({ done: true, value: 'end' });

    expect(fn.mock.calls.map((it) => it[0])).toEqual(['1.hello', '2.world']);
  });
  test('return', () => {
    function* gen(): Generator<number> {
      yield 1;
      yield 2;
      yield 3;
    }
    const g = gen();
    expect(g.next()).toEqual({ done: false, value: 1 });
    expect(g.next()).toEqual({ done: false, value: 2 });
    expect(g.return(5)).toEqual({ done: true, value: 5 });
    expect(g.next()).toEqual({ done: true, value: undefined });
    expect(g.next()).toEqual({ done: true, value: undefined });
    expect(g.next()).toEqual({ done: true, value: undefined });
    expect(g.return(7)).toEqual({ done: true, value: 7 });
    expect(g.next()).toEqual({ done: true, value: undefined });
  });
  test('throw', () => {
    const cc = jest.fn();
    function* gen() {
      while (true) {
        try {
          yield 1;
        } catch (e) {
          cc('Error caught!', e);
        }
      }
    }

    const g = gen();
    expect(g.next()).toEqual({ done: false, value: 1 });
    g.throw(new Error('Something went wrong')); // "Error caught!"
    expect(cc.mock.calls[0][0]).toBe('Error caught!');
    expect(cc.mock.calls[0][1]).toEqual(new Error('Something went wrong'));
  });
  test('yield*', () => {
    function* yieldGen(list: number[]) {
      for (let i = 0; i < list.length; i++) {
        yield list[i];
      }
    }
    function* gen(list: number[][]) {
      for (let i = 0; i < list.length; i++) {
        yield* yieldGen(list[i]);
      }
    }

    const list = [
      [1, 2, 3, 4, 5],
      [1, 2, 3, 4, 5],
      [1, 2, 3, 4, 5],
    ];
    const g = gen(list);

    const res: number[] = [];
    for (const v of g) {
      res.push(v);
    }
    expect(res).toEqual(list.flat(2));
  });
  describe('iterator', () => {
    function* gen(list: number[]) {
      let i = 0;
      while (i < list.length) {
        yield list[i++];
      }
    }
    test('foreach', () => {
      const list = [1, 2, 3];
      const g = gen(list);

      const res: number[] = [];
      for (const v of g) {
        res.push(v);
      }
      expect(res).toEqual(list);
    });

    test('...', () => {
      const list = [1, 2, 3];
      const g = gen(list);
      expect([...g]).toEqual(list);
    });
    test('Array.from', () => {
      const list = [1, 2, 3];
      const g = gen(list);
      expect(Array.from(g)).toEqual(list);
    });
  });
});
