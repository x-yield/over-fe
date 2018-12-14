const DEFAULT_URL = '/';

/**
 * @param {object} route
 * @return {string}
 */
export default function loginRedirect(route) {
	const {query: {redirect: redirectUrl}} = route;

	return redirectUrl || DEFAULT_URL;
}
