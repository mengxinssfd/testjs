self.addEventListener(
  'message',
  function (e) {
    // console.log('You said', e.data);
    self.postMessage('You said ' + e.data);
    // 可以调用close关闭该worker
    // close();
  },
  false,
);
