/**
 The MQTT npm package uses the keyword 'const' in one location within the distributable.  While this should not
 cause a problem for Phantomjs, it is currently causing PhantomJS to throw an 'Unexpected Token' error.
 As a result, the keyword must be replaced with 'var' for end-to-end testing to function properly.

 Note that this does not occur in standard browsers.
 */

const fs = require('fs');
const path = require('path');

const indexFile = fs.readFileSync(path.resolve(__dirname, '../index.js')).toString('utf-8');
const revised = indexFile.replace(/const\s/g, 'var ');

fs.writeFileSync(path.resolve(__dirname, './e2e.js'), revised);