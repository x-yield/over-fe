import Axios from 'axios';
import redirectToLogin from '../utils/login/redirectToLogin';

const INJECTION_NAME = 'api';

export default async function api({app: {$env: {endpoint}}, store, redirect, route}, inject) {
	const headers = {
		'Accept': 'application/json',
		'Content-type': 'application/json'
	};

	const axiosInstance = Axios.create({
		baseURL: `http://${endpoint}/`,
		headers
	});

	axiosInstance.interceptors.request.use(config => {
		if (store.state.authentication.accessToken) {
			config.headers['Authorization'] = 'Bearer ' + store.state.authentication.accessToken;
		}

		return config;
	}, Promise.reject);

	axiosInstance.interceptors.response.use(response => Promise.resolve([response]), error => {
		if (error.response && error.response.status === 401) {
			redirect(redirectToLogin(route));
		}
		if (error.response && error.response.status === 403) {
			redirect('/403');
		}
		return [null, error];
	});

	inject(INJECTION_NAME, axiosInstance);
}
