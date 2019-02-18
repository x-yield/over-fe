function initialState(state) {
	state.success = false;
}

export const state = () => {
	const result = {
		regression: {
			id: null,
			graphs: {
				imbalance: null,
			},
		},
		success: null,
		error: null,
		loading: null,
	};

	initialState(result);
	return result;
};

export const mutations = {
	setRegression(state, regression) {
		state.regression = regression;
	},
	setLoading(state) {
		state.loading = true;
		state.success = null;
		state.error = null;
	},
};

export const getters = {
	loading(state) {
		return state.loading;
	},
	success(state) {
		return state.success;
	},
	error(state) {
		return state.error;
	},
	job(state) {
		return state.job;
	},
};


export const actions = {
	async getRegression({commit}, id_) {
		const [response, error] = await this.$api.get('/job/'+id_);

		if (error) {
			if (error.response.status === 404) {
				// TODO handle 404
			} else {
				// TODO error handling
				commit('reset');
			}
		} else {
			commit('setRegression', response.data.job);
		}
	}
};

