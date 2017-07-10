// const {config} = require('./config');

// const msgpack = require('./msgpack.codec.js')
const msgpack = require('msgpack-js')
const C = require('crypto-js')

config = {
	options_key: '##mypass_options##',
	salt_key: '##salt##',
	options: {
		default: {
			nsym: 0,
			len: 12,
			gen: 1,
			hashes: 8
		}
	},
	pw: {
		min_size: 8,
		max_size: 20
	}
};

// Some hardcoded input, to test algorithms against original
input = {
  salt: "pdinoto@gmail.com",
  passphrase: "launicasalida",
  itercnt: 1
}

const keymodes = {
  WEB_PW : 0x1,
  LOGIN_PW : 0x2,
  RECORD_AES : 0x3,
  RECORD_HMAC : 0x4
 };

var PasswdGenerator = class PasswdGenerator {
	// input should contain following property
	//     site, generation, num_symbol, length, salt, passphrase, itercnt
	generate(input) {
		const dk = this.derive_web_pw_key(input.salt, input.passphrase, input.itercnt);
		let i = 0;
		let ret = null;

		while (!ret) {
			const a = [ "OneShallPass v2.0", input.salt, input.site, input.generation, i ];
			const wa = pack_to_word_array(a);
			const hash = C.HmacSHA512(wa, dk);
			const b64 = hash.toString(C.enc.Base64);
			if (this.is_ok_pw(b64)) { ret = b64; }
			i++;
		}

		const x = this.add_syms(ret, input.num_symbol);
		return x.slice(0, input.length);
	}

	derive_web_pw_key(salt, passphrase, itercnt) {
		// cache derived key for last salt, passphrase, itercnt tuple
		if ((this.salt !== salt) || (this.passphrase !== passphrase) || (this.itercnt !== itercnt)) {
			this.web_pw_key = this.run_key_derivation(salt, passphrase, itercnt, keymodes.WEB_PW);
			this.salt = salt;
			this.passphrase = passphrase;
			this.itercnt = itercnt;
		}
		return this.web_pw_key;
	}

	// The folloing algorithm is copied from 1SP, which uses key_mode to
	// derive different keys from the same passphrase.
	// The call to run_key_derivation with key_mode 1 has the same effect
	// as calling PBKDF2 from CryptoJS like the following:
	//   C.PBKDF2 passphrase, salt, { keySize: 512/32, iterations: itercnt, hasher: C.algo.SHA512 }
	// Only key_mode WEB_PW is used in mypass, I still use this function
	// to avoid including pbkdf2.js
	run_key_derivation(salt, passphrase, itercnt, key_mode) {
		// The initial setup as per PBKDF2, with salt as the salt
		const hmac = C.algo.HMAC.create(C.algo.SHA512, passphrase);
		const block_index = C.lib.WordArray.create([ key_mode ]);
		const block = hmac.update(salt).finalize(block_index);
		hmac.reset();

		// Make a copy of the original block....
		let intermediate = block.clone();

		let i = 1;
		while (i < itercnt) {
			intermediate = hmac.finalize(intermediate);
			hmac.reset();
			for (let j = 0; j < intermediate.words.length; j++) { const w = intermediate.words[j]; block.words[j] ^= w; }
			i++;
		}

		return block;
	}

	// Rules for 'OK' passwords:
	//    - Within the first 8 characters:
	//       - At least one: uppercase, lowercase, and digit
	//       - No more than 5 of any one character class
	//       - No symbols
	//    - From characters 7 to 16:
	//       - No symbols
	is_ok_pw(pw) {
		let i;
		let asc, end;
		let asc1, end1;
		let caps = 0;
		let lowers = 0;
		let digits = 0;

		for (i = 0, end = config.pw.min_size, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
			const c = pw.charCodeAt(i);
			if (this.is_digit(c)) { digits++;
			} else if (this.is_upper(c)) { caps++;
			} else if (this.is_lower(c)) { lowers++;
			} else { return false; }
		}

		const bad = x => (x === 0) || (x > 5);
		if (bad(digits) || bad(lowers) || bad(caps)) { return false; }

		for (i = config.pw.min_size, end1 = config.pw.max_size, asc1 = config.pw.min_size <= end1; asc1 ? i < end1 : i > end1; asc1 ? i++ : i--) {
			if (!this.is_valid(pw.charCodeAt(i))) { return false; }
		}

		return true;
	}

	// Given a PW, find which class to substitute for symbols.
	// The rules are:
	//    - Pick the class that has the most instances in the first
	//      8 characters.
	//    - Tie goes to lowercase first, and to digits second
	// Return a function that will say yes to the chosen type of character.
	find_class_to_sub(pw) {
		let caps = 0;
		let lowers = 0;
		let digits = 0;

		for (let i = 0, end = config.pw.min_size, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
			const c = pw.charCodeAt(i);
			if (this.is_digit(c)) { digits++;
			} else if (this.is_upper(c)) { caps++;
			} else if (this.is_lower(c)) { lowers++; }
		}

		if ((lowers >= caps) && (lowers >= digits)) { return this.is_lower;
		} else if ((digits > lowers) && (digits >= caps)) { return this.is_digit;
		} else { return this.is_upper; }
	}

	add_syms(input, n) {
		if (n <= 0) { return input; }
		const fn = this.find_class_to_sub(input);
		const indices = [];
		for (let i = 0, end = config.pw.min_size, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
			const c = input.charCodeAt(i);
			if (fn.call(this, c)) {
				indices.push(i);
				n--;
				if (n === 0) { break; }
			}
		}
		return this.add_syms_at_indices(input, indices);
	}

	add_syms_at_indices(input, indices) {
		const _map = "`~!@#$%^&*()-_+={}[]|;:,<>.?/";
		return this.translate_at_indices(input, indices, _map);
	}

	translate_at_indices(input, indices, _map) {
		let last = 0;
		const arr = [];
		for (let index of Array.from(indices)) {
			arr.push(input.slice(last, index));
			let c = input.charAt(index);
			const i = C.enc.Base64._map.indexOf(c);
			c = _map.charAt(i % _map.length);
			arr.push(c);
			last = index + 1;
		}
		arr.push(input.slice(last));
		return arr.join("");
	}

	is_upper(c) { return ("A".charCodeAt(0) <= c) && (c <= "Z".charCodeAt(0)); }
	is_lower(c) { return ("a".charCodeAt(0) <= c) && (c <= "z".charCodeAt(0)); }
	is_digit(c) { return ("0".charCodeAt(0) <= c) && (c <= "9".charCodeAt(0)); }
	is_valid(c) { return this.is_upper(c) || this.is_lower(c) || this.is_digit((c)); }
};

var pack_to_word_array = function(obj) {
  // const ui8a = msgpack.pack(obj);
	const ui8a = msgpack.encode(obj);
	// use following code to use msgpack.
	// ui8a = msgpack.pack(obj)
	const i32a = Ui8a.to_i32a(ui8a);
	const v = (Array.from(i32a));
	return C.lib.WordArray.create(v, ui8a.length);
};

var Ui8a = {
	stringify(wa) {
		const [v,n] = Array.from([wa.words, wa.sigBytes]);
		const out = new Uint8Array(n);
		for (let i = 0, end = n, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) { out[i] = ((v[i >>> 2] >>> (24 - ((i % 4) * 8))) & 0xff); }
		return out;
	},

	to_i32a(uia) {
		let i;
		let asc, end;
		const n = uia.length;
		const nw = (n >>> 2) + ((n & 0x3) ? 1 : 0);
		const out = new Int32Array(nw);
		for (i = 0, end = nw, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) { out[i] = 0; }
		for (i = 0; i < uia.length; i++) {
			const b = uia[i];
			out[i >>> 2] |= (b << ((3 - (i & 0x3)) << 3));
		}
		return out;
	}
};

const passwdgen = new PasswdGenerator;
p = passwdgen.generate(input);
console.log(JSON.stringify(p));


module.exports = function (context, cb) {
  var result = '';
  if (context.query['debug'] == '1') {
    result += JSON.stringify(context.query)
  };
  cb(null, JSON.stringify(result));

 }
