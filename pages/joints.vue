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
				<v-card class="justify-space-between">
					<v-data-table
						:headers="tableHeaders"
						:items="joints"
						class="elevation-1"
						:rowsPerPageItems="[50, 100, 150]"
						sortIcon=""
						hideActions>
						<template slot="items" slot-scope="props">
							<td class="text-lg-center body-2">
								<a :href='"/joint?id="+props.item.id' :key="props.item.id">{{ props.item.id }}</a>
							</td>
							<td class="text-lg-center body-2">
								<a :href='"/job?id="+job_id' v-for="job_id in props.item.job_ids" :key="job_id" class="mr-2">
									{{ job_id }}
								</a>
							</td>
							<td class="text-lg-center body-2">{{ props.item.name }}</td>
						</template>
					</v-data-table>
				</v-card>
			</div>
		</v-container>
	</div>
</template>

<script>
import '@ozonui/layout/src/grid.css';
import '@ozonui/form-input';
import '@ozonui/custom-button';
import AppHeader from '../components/AppHeader';

export default {
	data() {
		return {
			joints: [],
			tableHeaders: [
				{text: 'Id', align: 'center'},
				{text: 'Tests', align: 'center'},
				{text: 'Name', align: 'center'}],
			loading: true,
			error: null,
			success: null,
		};
	},
	head: {
		title: 'Overload - нагрузочные тесты',
	},
	components: {
		AppHeader,
	},
	created() {
		this.get_joints_info();
	},
	methods: {
		get_joints_info: function() {
			this.$api.get('/list_joints')
				.then(response => {
					return response[0].data.joints;
				})
				.then(json => {
					if (!json) {
						this.loading = false;
						return;
					}
					json.forEach(function(item) {
						item['job_ids'] = [];

						item['jobs'].forEach(function(pending_job) {
							item['job_ids'].push(pending_job.id);
						});
					});
					this.joints = json;
					this.loading = false;
				});
		},
	},
};
</script>

<style scoped>
</style>