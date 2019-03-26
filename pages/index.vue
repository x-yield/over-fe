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
				<!--<table-list :headers="tableHeaders" :content="lastJobs" :isJobs="true"/>-->
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
							<td class="text-lg-center body-2">{{ props.item.testStart + '→' + props.item.testStop }}</td>
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
						:length="10"
						@next="getJobs(lastJobs[lastJobs.length-1].id)"/>
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
			tableHeaders: [
				{text: 'Test id', align: 'center'},
				{text: 'Author', align: 'center'},
				{text: 'Status', align: 'center'},
				{text:'Start → Stop', align: 'center'},
				{text:'Target', align: 'center'},
				{text:'Description', align: 'center'}],
			totalJobs: 0,
			loading: true,
			pagination: {},
		};
	},
	head: {
		title: 'Overload - нагрузочные тесты',
	},
	components: {
		TableList,
		AppHeader
	},
	watch: {
		pagination: {
			handler() {
				this.moreTests()
					.then(data => {
						this.lastJobs = data.items;
						this.totalJobs = data.total;
					});
			},
			deep: true
		}
	},
	mounted() {
		console.log('mounted');
		this.moreTests(0)
			.then(data => {
				this.lastJobs = data.items;
				this.totalJobs = data.total;
			});
		this.loading = false;
	},
	methods: {
		moreTests: function(from_) {
			return new Promise((resolve) => {
				const {page, rowsPerPage} = this.pagination;

				console.log('PPPP', this.pagination);

				let items = this.getJobs(from_);

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
		getJobs: function(from_) {
			this.$api.get('/lastjobs/' + from_)
				.then(response => {
					const jobs = this.lastJobs;

					const resp_data = response[0].data.jobs;

					resp_data.forEach(function(item) {
						jobs.push(item);
					});
				});
		}
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