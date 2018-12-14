import Axios from 'axios';
import {write, erase} from '../utils/cookie';

export const state = () => ({
	accessToken: null,
	login: '',
	password: '',
	loading: false
});

export const mutations = {
	setLogin(state, login) {
		state.login = login;
	},
	setPassword(state, password) {
		state.password = password;
	},
	setLoading(state, value) {
		state.loading = value;
	},
	logout(state) {
		state.accessToken = null;
	},
	resetForm(state) {
		state.password = '';
		state.login = '';
	},
	authenticate(state, accessToken) {
		state.accessToken = accessToken;
		state.loading = false;
	}
};

export const getters = {
	login(state) {
		return state.login;
	},
	password(state) {
		return state.password;
	},
	loading(state) {
		return state.loading;
	},
	authenticated(state) {
		return !!state.accessToken;
	}
};

export const actions = {
	async login({commit}) {
		const username = this.state.authentication.login;
		const password = this.state.authentication.password;
		const {CASendpoint} = this.$env;

		if (username && password) {
			const formData = new FormData();

			formData.append('client_id', 'web');
			formData.append('grant_type', 'password');
			formData.append('username', username);
			formData.append('password', password);

			commit('setLoading', true);

			try {
				const response = await Axios.post(`http://${CASendpoint}/token`, formData);
				const {access_token: token, token_type: tokenType} = response.data;

				if (tokenType === 'bearer') {
					commit('authenticate', token);
					write(token);
				}
			} catch (error) {
				commit('setLoading', false);
				//TODO handle error
			}
		}
	},
	logout({commit}) {
		commit('logout');
		erase();
	}
};
