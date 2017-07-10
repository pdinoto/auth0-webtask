
module.exports = function(context, cb) {

  var OTP = require('otp.js');
  var HOTP = OTP.hotp;
  var GA = OTP.googleAuthenticator;
  var response = '';
  var secret = '';

  if (typeof context.secrets.GAsecret !== 'undefined') {
    secret = context.secrets.GAsecret
    console.log("Got secret from webtask secret.")
  } else if (typeof context.query['GApassword'] !== 'undefined') {
    secret = GA.encode(context.query['GApassword']);
    console.log("Got password from query.")
  } else if (typeof context.query['GAsecret'] !== 'undefined') {
    secret = context.query['GAsecret'];
    console.log("Got secret from query.")
  } else {
    secret = GA.encode('caramba!');
    console.log("Using default password/secret from webtask code.")
  }

  try {
    // generate otp for base 32 encoded user secret
    var code = GA.gen(secret);
    var today = new Date();
    console.log('Code: ', code);
    cb(null, { code: code, date: today.toISOString() });
  }
  catch(ex) {
    console.error(ex);
    cb(ex, { error: JSON.stringify(ex) });
  }

}

exports.express = function (options, cb) {
  options.nodejsCompiler(options.script, function (error, func) {
    if (error) return cb(error);
    try {
      func = fromConnect(func); // this is where adaptation happens
    }
    catch (e) {
      return cb(e);
    }
    return cb(null, func);
  });
};



// Code Verification
// try {
//   // verify otp 'XXXXXX' for base 32 encoded user secret
//   var result = GA.verify(code, GA.encode('caramba!'));
//   console.log(result); // print result => {delta:#}
// }
// catch(ex) {
//   console.error(ex); // print error occurred during OTP verification process
// }

// Simple HOTP test
// try {
//   // generate otp for key '12345678901234567890' in string format
//   var code = HOTP.gen({string:'12345678901234567890'});
//   console.log(code); // print otp result => 755224
// }
// catch(ex) {
//   console.error(ex); // print error occurred during OTP generation process
// }

// try {
//   // verify otp '755224' for key '12345678901234567890' in string format
//   var result = HOTP.verify('755224', {string:'12345678901234567890'});
//   console.log(result); // print result => {delta:{int:0}}
// }
// catch(ex) {
//   console.error(ex); // print error occurred during OTP verification process
// }

// Google Authenticator
// get GoogleAuthenticator object
// hardcode secret for console testing


// // QRCode Generation
// try {
//   // generate base32 secret
//   var secret = GA.encode('caramba!') || GA.secret();
//   // get QRCode in SVG format
//   var qrCode = GA.qrCode('Auth0 webtask test', 'webtask.io+otp.js', secret);
//   console.log(qrCode); // print svg => <svg xmlns="http://www.w3.org/2000/svg" width="215" height="215" viewBox="0 0 43 43">...</svg>
// }
// catch(ex) {
//   console.error(ex); // print error occurred during QRCode generation
// }
