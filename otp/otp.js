
module.exports = function(context, cb) {

  var OTP = require('otp.js');
  var HOTP = OTP.hotp;
  var GA = OTP.googleAuthenticator;
  var response = '';
  var encoded_secret, secret = '';

  if (typeof context.secrets.GAencsecret !== 'undefined') {
    encoded_secret = context.secrets.GAencsecret
    console.log("Got encoded secret from webtask secret.")
  } else if (typeof context.query['GApassword'] !== 'undefined') {
    encoded_secret = GA.encode(context.query['GApassword']);
    console.log("Got password from query.")
  } else if (typeof context.query['GAencsecret'] !== 'undefined') {
    encoded_secret = context.query['GAencsecret'];
    console.log("Got encoded secret from query.")
  } else {
    encoded_secret = GA.encode('caramba!');
    console.log("Using default secret from webtask code.")
  }

  try {
    // generate otp for base 32 encoded user secret
    var code = GA.gen(encoded_secret);
    var today = new Date();
    console.log('Code: ', code);
    cb(null, { code: code, date: today.toISOString() });
  }
  catch(ex) {
    console.error(ex);
    cb(ex, { error: JSON.stringify(ex) });
  }

}
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
