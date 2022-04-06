importScripts('https://cdn.jsdelivr.net/npm/@mxssfd/ts-utils@3.0.15/lib-umd/index.min.js');
// importScripts('foo.js', 'bar.js'); /* 引入两个脚本 */
console.log(tsUtils); // 能加载出来
// tsUtils.createHiddenHtmlElement(); // document is not defined
console.log(tsUtils.isObject({})); // true
close();
