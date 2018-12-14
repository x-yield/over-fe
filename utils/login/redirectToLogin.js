const DEFAULT_ROUTE='/login';
const REDIRECT_QUERY_PARAM='redirect';

/**
 * @param {object} route
 * @return {string}
 */
export default function redirectToLogin(route) {
	const {fullPath} = route;

	return `${DEFAULT_ROUTE}?${REDIRECT_QUERY_PARAM}=${encodeURIComponent(fullPath)}`;
}
