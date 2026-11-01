// Lance le test de flux compilé en résolvant l'alias « @/ » vers build-domain/src.
const M = require('module');
const orig = M._resolveFilename;
M._resolveFilename = function (r, ...a) {
  if (r.startsWith('@/')) r = require('path').join(__dirname, '..', 'build-domain', 'src', r.slice(2));
  return orig.call(this, r, ...a);
};
require('../build-domain/scripts/flow-smoke.js');
