const child = new Worker('./second.js');

child.addEventListener('message', (e) => {
  postMessage(e.data)
  child.terminate();
  close();
});

onmessage = function (e) {
  child.postMessage(e.data + '; hello, im first');
};
