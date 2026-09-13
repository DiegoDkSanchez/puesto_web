const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const script = fs.readFileSync('download.js', 'utf8');
const cases = [
  ['', null], ['?establishmentId=', null], ['?establishmentId=%20%09', null],
  ['?other=abc', null], ['?establishmentId=abc123', 'abc123'],
  ['?establishmentId=%20caf%C3%A9%2F%3F%23%26%25%2B%20', ' café/?#&%+ '],
  ['?establishmentId=%252F', '%2F'], ['?establishmentId=a+b', 'a b'],
  ['?establishmentId=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E', '<img src=x onerror=alert(1)>'],
  ['?establishmentId=first&establishmentId=second', 'first'],
];
for (const [search, expected] of cases) {
  const link = {};
  const section = {hidden: true};
  vm.runInNewContext(script, {
    URLSearchParams, window: {location: {search}},
    document: {getElementById: id => id === 'open-establishment' ? link : section},
  });
  assert.equal(section.hidden, expected === null, search);
  if (expected === null) assert.equal(link.href, undefined);
  else {
    assert.equal(link.href, `puesto://app/establishment/${encodeURIComponent(expected)}`);
    assert.equal(decodeURIComponent(link.href.split('/establishment/')[1]), expected);
  }
}
console.log(`${cases.length} download link cases passed`);
