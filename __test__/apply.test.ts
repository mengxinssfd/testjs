describe('apply', () => {
  // 基础用法不写了
  // 用法跟Array.from类似,接收的是个伪数组
  test('接收一个类数组', () => {
    const fn = jest.fn();
    function applyTest() {
      // eslint-disable-next-line prefer-rest-params
      fn(...arguments);
    }
    // eslint-disable-next-line prefer-spread
    applyTest.apply(null, { length: 10 } as any);
    // 接收到了10个undefined参数
    expect(fn.mock.calls[0].length).toBe(10);
    fn.mock.calls[0].forEach((param) => {
      expect(param).toBeUndefined();
    });
  });
});
