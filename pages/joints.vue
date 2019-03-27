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
				<table class="table table-sm table-bordered" id="jointsTable">
					<thead>
						<tr>
							<th scope="col" class="text-center">Id</th>
							<th scope="col" class="text-center">Tests</th>
							<th scope="col" class="text-center">Name</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="joint in joints" :key="joint.id">
							<td align="center">
								<a :href='"/joint?id="+joint.id' :key="joint.id"> {{ joint.id }}</a>
							</td>
							<td align="center">
								<a :href='"/job?id="+job_id' v-for="job_id in joint.job_ids" :key="job_id">
									{{ job_id }}
								</a>
							</td>
							<td align="center">
								{{ joint.name }}
							</td>
						</tr>
					</tbody>
				</table>
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
			joints: {},
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