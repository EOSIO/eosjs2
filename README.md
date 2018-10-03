*Important*: eosjs is under active development and should be considered beta. Improvements and enhancements may break or remove existing functionality. Be sure to lock your dependencies.

If you are looking for the old version of `eosjs` you can [find it here](https://github.com/EOSIO/eosjs/tree/v16.0.9).

## eosjs

Library for talking to an EOSIO RPC API. `transact()` is used to sign and push transactions onto the blockchain with an optional configuration object parameter.  This parameter can override the default value of `broadcast: true`, and can be used to fill TAPOS fields given `blocksBehind` and `expireSeconds`.  Given no configuration options, transactions are expected to be unpacked with TAPOS fields (`expiration`, `ref_block_num`, `ref_block_prefix`) and will automatically be broadcast onto the chain.

## Running Tests

### Automated Test Suite
`npm run test` or `yarn test`

### Integration Tests
1. `npm run build-web` or `yarn build-web`
1. Open `test.html` in your browser of choice

*The integration tests assume that you have a local node for EOS set up at localhost:8000. The test.html file should run through 5 test cases with the final showing an exception on the screen for missing required TAPOS.*

## Basic Usage

### NodeJS
```js
const eosjs = require('eosjs');
const fetch = require('node-fetch');                            // node only; not needed in browsers
const { TextDecoder, TextEncoder } = require('text-encoding');  // node, IE11 and IE Edge Browsers
```

### SignatureProvider
SignatureProvider holds private keys and is responsible for signing transactions
```js
const defaultPrivateKey = "5JtUScZK2XEp3g9gh7F8bwtPTRAkASmNrrftmx4AxDKD5K4zDnr"; // useraaaaaaaa
const signatureProvider = new eosjs.SignatureProvider([defaultPrivateKey]);
```

### JSON-RPC
Open a connection to JSON-RPC, include `fetch` when on NodeJS
```js
const rpc = new eosjs.Rpc.JsonRpc('http://127.0.0.1:8000', { fetch });
```

### API Constructor
Include textDecoder and textEncoder when using in browser.
```js
const api = new eosjs.Api({ rpc, signatureProvider, textDecoder: new TextDecoder, textEncoder: new TextEncoder });
```

### Sending a transaction
```js
(async () => {
  const result = await api.transact({
    actions: [{
      account: 'eosio.token',
      name: 'transfer',
      authorization: [{
        actor: 'useraaaaaaaa',
        permission: 'active',
      }],
      data: {
        from: 'useraaaaaaaa',
        to: 'useraaaaaaab',
        quantity: '0.0001 SYS',
        memo: '',
      },
    }]
  });
  console.dir(result);
})();
```

### Error handling
use `eosjs_jsonrpc.RpcError` for handling JSON-RPC Errors
```js
...
try {
  const result = await api.transact({
  ...
} catch (e) {
  console.log('\nCaught exception: ' + e);
  if (e instanceof eosjs_jsonrpc.RpcError)
    console.log(JSON.stringify(e.json, null, 2);
}
...
```

## Browsers
Browser distribution is located in `dist`

Permalink for eosjs documentation is [http://eosio.github.io/eosjs](http://eosio.github.io/eosjs)
