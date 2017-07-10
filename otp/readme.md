
### OTP webtask

An attempt to have a webtask that given a series of a secret will provide a proper [TOPT](https://en.wikipedia.org/wiki/Time-based_One-time_Password_Algorithm) code to be used as 2FA

Reviewed many Javascript TOTP libraries, settled with [github.com/njl07/otp.js](github.com/njl07/otp.js) since it very simple.

### Install

On a linux computer with node.js and npm, clone the repository. Then
```
~ $ git clone git@github.com:pdinoto/auth0-webtask.git
~ $ cd auth0-webtask/otp
auth0-webtask/otp $ npm install -g
auth0-webtask/otp $ npm install -g wt-cli
auth0-webtask/otp $ wt create --name <choose-a-name> otp.js
```
and then use the URL that will be provided to acesss it, setting either an encoded secret or a base32 password. For instance:
```
curl https://wt-d6ac4a1e4ee5bda3a80aaf76e506655d-0.run.webtask.io/otp/?GApassword=caramba!
```

if you want the webtask to be permanently related to a particular account, then install the webtask with a secret. Replace last command with:
```
auth0-webtask/otp $ wt create --name <choose-a-name> --secret GAencsecret=ZM5GA6GLI2OABWFO otp.js
```


### Usage

After the webtask is installed/loaded, the required secret material (what is shared with the authenticating party) can be set in two ways:

- Added to the webtask secrets as `GAencsecret` (needs to be in base32 encoding)
- Sent with the request as query parameter `GAencsecret` (also in base32 encoding) or as parameter `GApassword`, which will be converted to base32.

If no secret is available, a hardcoded one for testing is set: `caramba!` as password, and its base32 equivalent `ZM5GA6GLI2OABWFO`. To test this functionality, Google Authenticator for [Android](https://itunes.apple.com/us/app/google-authenticator/id388497605?mt=8) or [iOS](https://itunes.apple.com/us/app/google-authenticator/id388497605?mt=8) or similar can be configured using [this QR code](./code.svg)
