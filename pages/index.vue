<template>
	<div id="overload">
		<template>
			<app-header/>
		</template>
		<v-container fluid>
			<div v-if="loading">
				<h3 align="center">Loading...</h3>
			</div>
			<div v-else>
				<v-layout wrap>
					<v-flex md3 xs12 class="pr-3">
						<v-combobox
							v-model="author"
							:items="authors"
							label="Select author"
							multiple
							chips
							@change="getJobs(1, pagination.rowsPerPage, {author, status, target, description})"/>
					</v-flex>
					<v-flex md3 xs12 class="pr-3">
						<v-combobox
							v-model="status"
							:items="statuses"
							label="Select status"
							multiple
							chips
							@change="getJobs(1, pagination.rowsPerPage, {author, status, target, description})"/>
					</v-flex>
					<v-flex md3 xs12 class="pr-3">
						<v-combobox
							v-model="target"
							:items="targets"
							label="Select target"
							multiple
							chips
							@change="getJobs(1, pagination.rowsPerPage, {author, status, target, description})"/>
					</v-flex>
					<v-flex md3 xs12>
						<v-combobox
							v-model="description"
							:items="descriptions"
							label="Select description"
							multiple
							chips
							@change="getJobs(1, pagination.rowsPerPage, {author, status, target, description})"/>
					</v-flex>
				</v-layout>
				<v-card class="justify-space-between">
					<v-data-table
						:headers="tableHeaders"
						:items="lastJobs"
						:pagination.sync="pagination"
						class="elevation-1"
						:rowsPerPageItems="[50, 100, 150]"
						sortIcon=""
						hideActions>
						<template slot="items" slot-scope="props">
							<td class="text-lg-center body-2">
								<a :href='"/job?id="+props.item.id'>{{ props.item.id }}</a>
							</td>
							<td class="text-lg-center body-2">{{ props.item.author }}</td>
							<td class="text-lg-center body-2">{{ props.item.status }}</td>
							<td class="text-lg-center body-2">{{ tsToDate(props.item.testStart) + '→' + tsToDate(props.item.testStop) }}</td>
							<td class="text-lg-center body-2">{{ props.item.target }}</td>
							<td class="text-lg-center body-2">{{ props.item.description }}</td>
						</template>
					</v-data-table>
				</v-card>
				<div class="text-xs-center pt-2">
					<v-pagination
						color="cyan darken-1"
						totalVisible="5"
						v-model="pagination.page"
						:length="pages"/>
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
			lastJobs: [],
			author: '',
			status: '',
			target: '',
			description: '',
			authors: [],
			statuses: [],
			targets: [],
			descriptions: [],
			tableHeaders: [
				{text: 'Test id', align: 'center'},
				{text: 'Author', align: 'center'},
				{text: 'Status', align: 'center'},
				{text:'Start → Stop', align: 'center'},
				{text:'Target', align: 'center'},
				{text:'Description', align: 'center'}],
			totalJobs: 0,
			loading: true,
			pagination: {
				rowsPerPage: 20,
				totalItems: 0,
			},
		};
	},
	head: {
		title: 'Overload - нагрузочные тесты',
	},
	components: {
		TableList,
		AppHeader
	},
	// watch: {
	// 	pagination: {
	// 		handler() {
	// 			this.moreTests()
	// 				.then(data => {
	// 					this.lastJobs = data.items;
	// 					this.totalJobs = data.total;
	// 				});
	// 		},
	// 		deep: true
	// 	}
	// },
	mounted() {
		this.getJobs(1, this.pagination.rowsPerPage, {});
		this.loading = false;
	},
	methods: {
		moreTests: function(page, limit) {
			return new Promise((resolve) => {
				const {page, rowsPerPage} = this.pagination;

				console.log('PPPP', this.pagination);

				let items = this.getJobs(page, limit);

				console.log('AAAAAA', items);
				const total = items.length;

				if (rowsPerPage > 0) {
					items = items.slice((page - 1) * rowsPerPage, page * rowsPerPage);
				}

				setTimeout(() => {
					this.loading = false;
					resolve({
						items,
						total
					});
				}, 1000);
			});
		},
		getJobs: function(page, limit, params) {
			let queryString = Object.keys(params).map(key => key + '=' + params[key]).join('&');

			this.$api.get('/lastjobs?page=' + page + '&limit='+limit + '&'+queryString)
				.then(response => {
					const jobs = this.lastJobs;

					const resp_data = response[0].data.jobs;

					resp_data.forEach(function(item) {
						jobs.push(item);
					});
					this.pagination.totalItems = response[0].data.count;
				});
			this.getFilters();
		},
		getFilters: function() {
			this.$api.get('/job_params')
				.then(response => {
					const resp_data = response[0].data;

					this.authors = resp_data.authors;
					this.statuses = resp_data.statuses;
					this.targets = resp_data.targets;
					this.descriptions = resp_data.descriptions;
				});
		},
		tsToDate: function(ts) {
			const from_ts = new Date(ts * 1000);

			const from_ts_hour = from_ts.getHours();

			const from_ts_min = from_ts.getMinutes() < 10 ? '0' + from_ts.getMinutes() : from_ts.getMinutes();

			const from_ts_sec = from_ts.getSeconds() < 10 ? '0' + from_ts.getSeconds() : from_ts.getSeconds();

			const from_ts_year = from_ts.getFullYear();

			if (isNaN(from_ts.getDate())) {
				return 'not yet received';
			} else {
				const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

				const month = months[from_ts.getMonth()];

				const date = from_ts.getDate();

				return date + ' ' + month + ' ' + from_ts_year + ' ' + from_ts_hour + ':' + from_ts_min + ':' + from_ts_sec;
			}
		},
	},
	computed: {
		pages() {
			if (this.pagination.rowsPerPage == null ||
				this.pagination.totalItems == null
			) {return 0;}

			return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage);
		}
	}

};
</script>

<style scoped>
</style>