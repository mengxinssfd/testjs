onmessage = function (e) {
  postMessage(e.data + '; hello, im second');
};