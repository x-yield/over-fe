import {read} from '../utils/cookie';

export default ({store, req}) => {
	let token;

	if (!process.server) {
		token = read(document.cookie);
	} else {
		token = read(req.headers['cookie']);
	}

	if (token) {
		store.commit('authentication/authenticate', token);
	}
};
