import cookie from 'cookie';

const ACCESS_TOKEN_COOKIE = 'access_token__1';

export function read(cookiesString = '') {
	const cookies = cookie.parse(cookiesString);

	return cookies[ACCESS_TOKEN_COOKIE];
}

export function write(token) {
	document.cookie = cookie.serialize(ACCESS_TOKEN_COOKIE, token);
}

export function erase() {
	document.cookie = `${ACCESS_TOKEN_COOKIE}=; Max-Age=-99999999;`;
}
