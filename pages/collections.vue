<template>
	<div id="overload">
		<template>
			<app-header/>
		</template>

		<div v-if="loading">
			<h3 align="center">Loading...</h3>
		</div>
		<v-container v-else class="fluid">
			<div align="right">
				<v-form class="d-inline-flex">
					<v-select
						color="cyan darken-1"
						:items="envs"
						v-model="env"
						@change="getFilteredCollections(selected={env, project, name})"
						label="All envs"
						class="mr-2"
					/>
					<v-select
						color="cyan darken-1"
						v-model="project"
						:items="projects"
						itemText="projectName"
						itemValue="projectId"
						label="All projects"
						@change="getFilteredCollections(selected={env, project, name})"
						class="mr-2"
					/>
					<v-select
						color="cyan darken-1"
						:items="names"
						v-model="name"
						@change="getFilteredCollections(selected={env, project, name})"
						label="All names"
						class="mr-2"
					/>
					<v-btn @click="flushAllFilters()" color="cyan darken-1" dark>Flush all filters</v-btn>
				</v-form>
			</div>
			<v-card class="justify-space-between">
				<v-data-table
					:headers="tableHeaders"
					:items="collections"
					:rowsPerPageItems="[10, 25, 50]"
					hideActions
					sortIcon="">
					<template slot="items" slot-scope="props">
						<td class="text-lg-center body-2">
							<a :href='"/collection?id="+props.item.id'>{{ props.item.id }}</a>
						</td>
						<td class="text-lg-center body-2">{{ props.item.author }}</td>
						<td class="text-lg-center body-2">{{ props.item.env }}</td>
						<td class="text-lg-center body-2">{{ props.item.project }}</td>
						<td class="text-lg-center body-2">{{ props.item.service }}</td>
						<td class="text-lg-center body-2">{{ props.item.name }}</td>
						<td class="text-lg-center body-2">{{ props.item.ref }}</td>
						<td class="text-lg-center body-2">
							<a :href='"/job?id="+job.id' v-for="job in props.item.latestJobs" :key="job.id" class="mr-2">
								{{ job.id }}
							</a>
						</td>
					</template>
				</v-data-table>
			</v-card>
		</v-container>
	</div>
</template>

<script>
import TableList from '../components/TableList';
import AppHeader from '../components/AppHeader';

export default {
	data() {
		return {
			selected: {},
			env: '',
			project: {
				projectId: '',
				projectName: ''
			},
			name: '',
			collections: [],
			envs: [],
			projects: [],
			names: [],
			loading: true,
			tableHeaders: [
				{text: 'Collection ID', align: 'center'},
				{text: 'Author', align: 'center'},
				{text: 'Environment', align: 'center'},
				{text:'Project ID', align: 'center'},
				{text:'Project name', align: 'center'},
				{text:'Name', align: 'center'},
				{text:'Branch', align: 'center'},
				{text:'Latest jobs', align: 'center'}],
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
		this.getFilteredCollections(this.selected);
	},
	methods: {
		getFilteredCollections(params) {
			this.loading = true;
			let queryString = Object.keys(params).map(key => key + '=' + params[key]).join('&');

			this.collections = [];
			this.envs = [];
			this.projects = [];
			this.names = [];
			let projectId =[];

			this.$api.get('/collections?'+ queryString)
				.then(response => {
					const respData = response[0].data.collections;

					respData.forEach(
						item => {
							this.collections.push(item);
						}
					);
					this.collections.forEach(
						item => {
							if (this.envs.indexOf(item.env) === -1) {
								this.envs.push(item.env);
							}
							if (this.names.indexOf(item.name) === -1) {
								this.names.push(item.name);
							}
							if (projectId.indexOf(item.project) === -1) {
								projectId.push(item.project);
								if (!item.service) { item.service = '';}
								this.projects.push({projectId: item.project, projectName: item.project+' '+item.service});
							}
						}
					);
					projectId =[];
					this.loading = false;
				});
		},
		flushAllFilters() {
			this.selected = {};
			this.env = '';
			this.project = '';
			this.name = '';
			this.getFilteredCollections(this.selected);

		},
	},
};
</script>

<style scoped>

</style>