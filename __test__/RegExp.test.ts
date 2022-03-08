describe('RegExp', () => {
  test('具名正则', () => {
    const re = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/u;
    expect(re.exec('2022-03-08')?.groups).toEqual({ year: '2022', month: '03', day: '08' });
  });
});
