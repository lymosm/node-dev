import crypto from 'crypto';

/**
 * @typedef {Object} CustomerAddress
 * @property {string} address1
 * @property {string} city
 * @property {string} country
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} phone
 * @property {string} province
 * @property {string} zip
 * @property {string} province_code
 * @property {string} country_code
 * @property {boolean} default
 */

/**
 * @typedef {Object} CustomerData
 * @property {string} email
 * @property {string} [created_at]
 * @property {string} [first_name]
 * @property {string} [last_name]
 * @property {string} [tag_string]
 * @property {string} [identifier]
 * @property {string} [remote_ip]
 * @property {string} [return_to]
 * @property {CustomerAddress[]} [addresses]
 */

export class ShopifyMultipass {
	/** @type {Buffer} */
	encryptionKey;

	/** @type {Buffer} */
	signatureKey;

	/** @type {URL} */
	storeUrl;

	/**
	 * @param {string} multipassSecret
	 * @param {string} storeUrl
	 */
	constructor(multipassSecret, storeUrl) {
		if (typeof multipassSecret !== 'string' || !multipassSecret.length) {
			throw new Error('Invalid multipassSecret');
		}

		if (typeof storeUrl !== 'string' || !storeUrl.length) {
			throw new Error('Invalid storeUrl');
		}

		// Use the Multipass multipassSecret to derive two cryptographic keys,
		// one for encryption, one for signing
		const hash = crypto.createHash('sha256').update(multipassSecret).digest();

		this.encryptionKey = hash.subarray(0, 16);
		this.signatureKey = hash.subarray(16, 32);

		this.storeUrl = new URL(storeUrl);
	}

	/** @param {Buffer} ciphertext */
	sign(ciphertext) {
		return crypto
			.createHmac('SHA256', this.signatureKey)
			.update(ciphertext)
			.digest();
	}

	/** @param {CustomerData} customerData */
	encrypt(customerData) {
		// Use a random IV
		const iv = crypto.randomBytes(16);
		const cipher = crypto.createCipheriv('aes-128-cbc', this.encryptionKey, iv);

		// Use IV as first block of ciphertext
		return Buffer.concat([
			iv,
			cipher.update(JSON.stringify(customerData), 'utf8'),
			cipher.final(),
		]);
	}

	/** @param {CustomerData} customerData */
	generateToken(customerData) {
		if (!customerData.created_at) {
			// Store the current time in ISO8601 format.
			// The token will only be valid for a small timeframe around this timestamp.
			customerData.created_at = new Date().toISOString();
		}

		// Encrypt the customer data
		const ciphertext = this.encrypt(customerData);

		// Create a signature (message authentication code) of the ciphertext
		// and encode everything using URL-safe Base64 (RFC 4648)
		const token = Buffer.concat([ciphertext, this.sign(ciphertext)]).toString(
			'base64'
		);

		// Replace `+` with `-` and replace `/` with `_`
		return token.replace(/\+/g, '-').replace(/\//g, '_');
	}

	/** @param {CustomerData} customerData */
	generateUrl(customerData) {
		const path = `/account/login/multipass/${this.generateToken(customerData)}`;

		return new URL(path, this.storeUrl).toString();
	}
}