<template>
	<div id="overload">
		<template>
			<app-header/>
		</template>

		<div v-if="loading">
			<h3 align="center">Loading...</h3>
		</div>
		<v-container v-else class="fluid">
			<v-layout wrap>
				<v-flex md3 xs12 class="pr-3">
					<v-combobox
						v-model="env"
						:items="envs"
						label="Select env"
						multiple
						chips
						deletableChips
						color="cyan darken-1"
						@change="getFilteredCollections({env, project, name, ref})"/>
				</v-flex>
				<v-flex md3 xs12 class="pr-3">
					<v-combobox
						v-model="project"
						:items="projects"
						itemText="`${data.item.project}, ${data.item.service}`"
						itemValue="project"
						label="Select project"
						:returnObject="false"
						multiple
						chips
						deletableChips
						color="cyan darken-1"
						@change="getFilteredCollections({env, project, name, ref})">
						<template slot="selection" slot-scope="data">
							{{ data.item.project }} {{ data.item.service }}
						</template>
						<template slot="item" slot-scope="data">
							{{ data.item.project }} {{ data.item.service }}
						</template>
					</v-combobox>
				</v-flex>
				<v-flex md3 xs12 class="pr-3">
					<v-combobox
						v-model="name"
						:items="names"
						label="Select name of collection"
						multiple
						chips
						deletableChips
						color="cyan darken-1"
						@change="getFilteredCollections({env, project, name, ref})"/>
				</v-flex>
				<v-flex md3 xs12>
					<v-combobox
						v-model="ref"
						:items="refs"
						label="Select branch"
						multiple
						chips
						deletableChips
						color="cyan darken-1"
						@change="getFilteredCollections({env, project, name, ref})"/>
				</v-flex>
			</v-layout>
			<v-card class="justify-space-between">
				<v-data-table
					:headers="tableHeaders"
					:items="collections"
					:totalItems="pagination.totalItems"
					:pagination.sync="pagination"
					:loading="loading"
					:rowsPerPageItems="[25]"
					sortIcon=""
					hideActions>
					<template slot="items" slot-scope="props">
						<td class="text-lg-center body-2">
							<a :href='"/collection?id="+props.item.id'>{{ props.item.id }}</a>
						</td>
						<td class="text-lg-center body-2">{{ props.item[tableHeaders[1].value] }}</td>
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
			<div class="text-xs-center pt-2">
				<v-pagination
					color="cyan darken-1"
					totalVisible="7"
					v-model="pagination.page"
					:length="pages"
					@input="getFilteredCollections({env, project, name, ref})"/>
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
			env: [],
			project: [],
			name: [],
			ref: [],
			collections: [],
			envs: [],
			projects: [],
			names: [],
			refs: [],
			pagination: {},
			loading: false,
			tableHeaders: [
				{text: 'Collection ID', align: 'center', value: 'id'},
				{text: 'Author', align: 'center', value: 'author'},
				{text: 'Environment', align: 'center', value: 'env'},
				{text:'Project ID', align: 'center', value: 'project'},
				{text:'Project name', align: 'center', value: 'service'},
				{text:'Name', align: 'center', value: 'name'},
				{text:'Branch', align: 'center', value: 'ref'},
				{text:'Latest jobs', align: 'center', value: 'latestJobs'}],
		};
	},
	components: {
		TableList,
		AppHeader
	},
	mounted() {
		this.getFilteredCollections({});
	},
	methods: {
		getFilteredCollections(params) {
			// const querystring = require('querystring');
			//
			// let queryString = querystring.stringify(params);
			let queryString = Object.keys(params).map(key => key + '=' + encodeURIComponent(params[key])).join('&');


			this.loading = true;

			this.collections = [];
			this.envs = [];
			this.projects = [];
			this.names = [];

			this.$api.get('/collections?page=' + this.pagination.page + '&limit=' + this.pagination.rowsPerPage+'&'+queryString)
				.then(response => {
					const respData = response[0].data.collections;

					this.collections = respData;
					this.pagination.totalItems = response[0].data.count;
					this.getFilters();
					this.loading = false;
				});
		},
		getFilters: function() {
			this.$api.get('/collection_params')
				.then(response => {
					const resp_data = response[0].data;

					this.envs = resp_data.envs;
					this.refs = resp_data.refs;
					this.projects = resp_data.projects;
					this.names = resp_data.names;
				});
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