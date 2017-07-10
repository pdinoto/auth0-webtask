
### OneShallPass / mypass webtask

An attempt to have a webtask that given a series of parameters would return a password compatible with [OneShallPass](https://oneshallpass.com/) or its Javascript (actually, Coffeescript) counterpart [mypass](http://chenyufei.info/p/mypass/)

Status: blocked, out of reach for a single day task

I was able to extract key algorithms from `mypass` and replace `purepack` with `msgpack-js`, and check the proper crypto library gets used.

But there is some limitation on the acceptable webtask variable scoping that is a showstopper for now.
