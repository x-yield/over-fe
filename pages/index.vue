<template>
	<div id="overload">
		<template>
			<app-header/>
		</template>
		<v-container>
			<div class="table">
				<div v-if="loading">
					<h3 align="center">Loading...</h3>
				</div>
				<div v-else>
					<table-list caption="Last Tests" :headers="tableHeaders" :content="last_jobs" :isJobs="true"/>
					<v-btn @click="moreTests(last_jobs[last_jobs.length-1].id)">I need more tests</v-btn>
				</div>
			</div>
		</v-container>
	</div>
</template>

<script>

import TableList from '../components/TableList';
import AppHeader from '../components/AppHeader';

export default {
	data() {
		return {
			last_jobs: [],
			tableHeaders: ['Test id', 'Author', 'Status', 'Start → Stop', 'Target', 'Description'],
			loading: true,
		};
	},
	head: {
		title: 'Overload - нагрузочные тесты',
	},
	components: {
		TableList,
		AppHeader
	},
	created() {
		this.$api.get('/lastjobs/0')
			.then(response => {
				const jobs = this.last_jobs;

				const resp_data = response[0].data.jobs;

				resp_data.forEach(function(item) {
					jobs.push(item);
				});
				this.loading = false;
			});
	},
	mounted() {
	},
	methods: {
		moreTests: function(from_) {
			this.$api.get('/lastjobs/' + from_)
				.then(response => {
					const jobs = this.last_jobs;

					const resp_data = response[0].data.jobs;

					resp_data.forEach(function(item) {
						jobs.push(item);
					});
				});
		},
	},
};
</script>

<style scoped>
	.overload-fe {
		padding-top: 20px;
		width: 90%;
		margin: auto;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}

	.overload-fe-container {
		flex: 1;
	}
	td > * {
		vertical-align : middle;
	}
</style>