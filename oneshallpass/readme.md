
### OneShallPass / mypass webtask

An attempt to have a webtask that given a series of parameters would return a password compatible with [OneShallPass](https://oneshallpass.com/) or its Javascript (actually, Coffeescript) counterpart [mypass](http://chenyufei.info/p/mypass/)

Status: blocked, out of reach for a single day task

I was able to extract key algorithms from `mypass` and replace `purepack` with `msgpack-js`, and check the proper crypto library gets used.

But there is some sort of limitation on the acceptable webtask variable scope. At creation, the webtask is accepted and its dependencies are loaded into the container, but when executing I get

Doing `curl https://wt-d6ac4a1e4ee5bda3a80aaf76e506655d-0.run.webtask.io/oneshallpass` gives

```
{
  "code": 400,
  "message": "Compilation failed: Block-scoped declarations (let, const, function, class) not yet supported outside strict mode",
  "error": "Block-scoped declarations (let, const, function, class) not yet supported outside strict mode",
  "stack": "SyntaxError: Block-scoped declarations (let, const, function, class) not yet supported outside strict mode
      at Object.exports.runInThisContext (vm.js:53:16)
      at WebtaskModule.compileWebtask (/data/sandbox/lib/module.js:91:32)
      at defaultJavascriptCompiler (/data/sandbox/lib/compiler.js:123:30)
      at defaultCompiler (/data/sandbox/lib/compiler.js:132:16)
      at /data/sandbox/lib/compiler.js:229:17
      at /data/sandbox/node_modules/async/dist/async.js:3830:24
      at replenish (/data/sandbox/node_modules/async/dist/async.js:946:17)
      at iterateeCallback (/data/sandbox/node_modules/async/dist/async.js:931:17)
      at /data/sandbox/node_modules/async/dist/async.js:906:16
      at /data/sandbox/node_modules/async/dist/async.js:3835:13"
}
```

For untrained souls, that is a showstopper for now.
