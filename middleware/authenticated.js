import redirectToLogin from '../utils/login/redirectToLogin';

export default function authenticatedMiddleware({store, redirect, route}) {
	if (!store.getters['authentication/authenticated']) {
		return redirect(redirectToLogin(route));
	}
}