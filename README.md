# coap-test-tool
Deadly-simple node.js CLI-tool for testing embedded CoAP servers.

### Requirements

* `node.js`, version ~0.10
* `npm`

### Launching

```
npm install

npm run launch-get

# or

npm run launch-observe
```

### Configuration

* `serverHostname` - address of target CoAP server, default is 'localhost';
*	`serverPort` - port of target CoAP server, default is 5683;
*	`serverPath` - path of target CoAP server, default is '/';
*	`heartbeat` - delay between GET requests;
*	`count` - number of simultaneous requests .




