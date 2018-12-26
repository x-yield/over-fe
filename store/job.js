function initialState(state) {
	state.success = false;
}

export const state = () => {
	const result = {
		job: {
			id: null,
			graphs: {
				rps: null,
				netcodes: null,
				quantiles: null,
				threads: null,
			},
			status: null,
		},
		success: null,
		error: null,
		loading: null,
	};

	initialState(result);
	return result;
};

export const mutations = {
	setJob(state, job) {
		state.job = job;
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
	async getJob({commit}, id_) {
		const [response, error] = await this.$api.get('/job/'+id_);

		if (error) {
			if (error.response.status === 404) {
				// TODO handle 404
			} else {
				// TODO error handling
				commit('reset');
			}
		} else {
			commit('setJob', response.data.job);
		}
	},
	async updateJob({commit}, job) {
		const [, error] = await this.$api.post('/update_job', job);

		if (error) {
			// TODO error handling
		} else {
			commit('reset');
		}

	}
};

