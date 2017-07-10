
### Before we start

Been suggested that a simple webtask concept could be done in a
*couple of hours*

Reality check:
- I consider that I would only do this in just two hours if I have been using the tools, language and frameworks lately. Also, a concrete requirement (a story, maybe?) would help, as otherwise you need to add "creativity brew time" into the equation. And everybody knows creativity usually eludes any kind of strict time constrains.
- I have not been coding lately, my last Javascript project was about two years ago, and was based on nodejs o a cuasi-embedded industrial setup.
- I DO scripting work to setup and adapt existing scripts daily, mostly dealing with infrastructure, and this framework is quite different.
- Webtask.io is clear to understand, but as any new tool requires some learning curve a lots of trial/error cycles. It is quite fun, though.

### Ideas
The concepts I had in mind when getting into this were:
- I wanted to come up with something that is actually useful, at least for me.
- Has to be related to my actual domain (cloud infrastructure, infrastructure as code, virtualization/containerization)
- Some ideas I had:
  - Create a webtask that provided what [1SP](https://oneshallpass.com/) does interactively, maybe with much less options and no persistence at all. Discarded as 1SP is written in IcedCoffeeScript, and while clearly documented would require 3-level indirection (.iced -> .coffee -> .js -> wt.js)
  - Create a webtask that could be used as a Google Authenticator emergency replacement. If you found yourself without your configured 2FA phone, tablet or browser extension, and instead of carrying a set of disposable backup codes, you carry a URL.
    - Storing the {H|T}OTP secret on the webtask?
    - The fact that the URL is disconnected from the actual account where it is setup is kind of a needed security feature (it is like having the backup codes on a piece of paper, but with no reference to what account these belong to)
  - Create a webtask that returns "one time ports": instead of port-knoking with a fixed port sequence as secret material, make a simpler port hopping mechanism based on TOTP, and write a `systemd` pair of `service.socket` and `service.timer` that changes the listening port every 10 minutes. That would be easy to setup on cloud-init and is a simple and nice
  - Returned to the idea of 1SP, as I found a [javascript version](https://github.com/cyfdecyf/mypass) of the same algorithm.

Things I had to (re)learn or investigate:

- Javascript :-) (Checked js references thousands of time!)
- Hashing/hmac concepts, Base32 encoding (understand JS-OTP code) refresh in order to dissect the existing code and assess re-usability.
- HOTP and TOTP concepts
- Port knocking history, existing solutions
