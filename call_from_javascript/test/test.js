var fs = require('fs');
var yaml  = require('yaml');
var assert = require('assert');
var transition = require('../transition.js');

const testsPath = "../test_cases"

const file = fs.readFileSync(testsPath+'/_tests.yaml', 'utf8')
test_cases = yaml.parse(file);

test_cases.forEach(test => {
    describe(test.description , () => {
        test.scripts.forEach( script => {
            it(script, function() {                
                const wasmSource = new Uint8Array(fs.readFileSync( testsPath+"/"+script ));
                let {exitCode, postState, deposits} = transition(
                    wasmSource, 
                    parseHexString(test.pre_state),
                    parseHexString(test.block),
                );

                assert.equal(test.error || 0, exitCode || 0, "test.error != exitCode");
                assert.deepEqual(parseHexString(test.post_state), postState, "incorrected postState");

                assert.equal((test.deposits || []).length , (deposits || []).length, "deposits.length");
                if ((test.deposits || []).length>0) {
                    test.deposits.forEach(deposit => {
                        deposit.pubKey = parseHexString(deposit.pubKey)
                        deposit.withdrawalCredentials = parseHexString(deposit.withdrawalCredentials)
                    });

                    assert.deepEqual(test.deposits, deposits, "incorrected postState");
                }
            });
        });
    });
});

function parseHexString(str) { 
    if (!str) return [];
    return Uint8Array.from(Buffer.from(str, 'hex'));
}
