import loginRedirect from '../utils/login/loginRedirect';

export default function anonymousMiddleware({store, redirect, route}) {
	if (store.getters['authentication/authenticated']) {
		return redirect(loginRedirect(route));
	}
}
