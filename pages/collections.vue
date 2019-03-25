<template>
	<div id="overload">
		<v-app id="inspire">
			<template>
				<v-toolbar
					class="mb-2"
					color="cyan darken-2"
					dark
					flat>
					<v-toolbar-title class="headline font-weight-bold">Overload</v-toolbar-title>
					<v-spacer/>
					<v-toolbar-items class="hidden-sm-and-down">
						<v-btn flat href="/">Jobs</v-btn>
						<v-btn flat href="/collections">Collections</v-btn>
						<v-btn flat href="/ammo">Ammo</v-btn>
					</v-toolbar-items>
				</v-toolbar>
			</template>
			<v-menu class="offset-y">
				<template slot="activator">
					<v-flex xs6 sm3>
						<v-overflow-btn
							class="ml-2"
							v-on="on"
							label="All envs"/>
					</v-flex>
					<v-flex xs6 sm3>
						<v-overflow-btn
							class="ml-2"
							v-on="on"
							label="All projects"/>
					</v-flex>
					<v-flex xs6 sm3>
						<v-overflow-btn
							class="ml-2"
							v-on="on"
							label="All names"/>
					</v-flex>
					<v-btn @click="flushAllFilters()" color="primary" left>Flush all filters</v-btn>
				</template>
				<v-list>
					<v-list-tile v-for="(model, index) in names" :key="index" @click="rew">
						<v-list-tile-title>{{ model }}</v-list-tile-title>
					</v-list-tile>
				</v-list>
			</v-menu>
			<v-card>
				<v-data-table
					:headers="tableHeaders"
					:items="collections"
					rows-per-page="10">
					<template slot="items" slot-scope="props">
						<td class="text-md-right body-2">
							<a :href='"/collection?id="+props.item.id'>{{ props.item.id }}</a>
						</td>
						<td class="text-lg-right body-2">{{ props.item.author }}</td>
						<td class="text-lg-right body-2">{{ props.item.env }}</td>
						<td class="text-lg-right body-2">{{ props.item.service }}</td>
						<td class="text-lg-right body-2">{{ props.item.project }}</td>
						<td class="text-lg-right body-2">{{ props.item.ref }}</td>
						<td class="text-lg-right body-2">
							<a :href='"/collection?id="+props.item.id'>{{ props.item.id }}</a>
						</td>
					</template>
				</v-data-table>
			</v-card>
		</v-app>
	</div>
	<!--<v-app>-->
		<!--<v-container class="fluid grid-list-md">-->
			<!--<div class="overload-fe-container">-->
				<!--<nav class="navbar navbar-default">-->
					<!--&lt;!&ndash; Контейнер (определяет ширину Navbar) &ndash;&gt;-->
					<!--<div class="container-fluid">-->
						<!--&lt;!&ndash; Заголовок &ndash;&gt;-->
						<!--<app-header :navigationLinks="routes"/>-->
					<!--</div>-->
				<!--</nav>-->
				<!--<h4 align="right">-->
					<!--<form @change="getFilteredCollections(selected={env, project, name}) " >-->
						<!--<dropdown-menu :array="envs" v-model="env" @option="$event"/>-->
						<!--<dropdown-menu :array="projects" v-model="project"/>-->
						<!--<dropdown-menu :array="names" v-model="name"/>-->
						<!--<v-btn @click="flushAllFilters()">Flush all filters</v-btn>-->
					<!--</form>-->
				<!--</h4>-->

				<!--<div v-if="loading">-->
					<!--<h3 align="center">Loading...</h3>-->
				<!--</div>-->
				<!--<div v-else>-->
					<!--<table-list caption="Last Collections" :headers="tableHeaders" :content="collections" :isJobs="false"/>-->
				<!--</div>-->
			<!--</div>-->
		<!--</v-container>-->
	<!--</v-app>-->
</template>

<script>
import TableList from '../components/TableList';
import DropdownMenu from '../components/DropdownMenu';
import AppHeader from '../components/AppHeader';

export default {
	data() {
		return {
			selected: {},
			env: '',
			project: '',
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
			pagination: {
				rowsPerPage: 10
			},
		};
	},
	head: {
		title: 'Overload - нагрузочные тесты',
	},
	components: {
		TableList,
		DropdownMenu,
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
								this.projects.push({projectId: item.project, projectName: item.service});
							}
						}
					);
					projectId =[];
					this.loading = false;
				});
		},
		flushAllFilters() {
			this.selected = {};
		}
	},
	computed: {
		routes() {
			return [
				{
					title: 'Collections',
					to: '/collections',
					isVisible: true
				},
				{
					title: 'Ammo',
					to: '/ammo',
					isVisible: true
				},
			];
		}
	}
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

	.flush {
		font-size: 16px;
		border-radius: 5px;
		width: auto;
		cursor: pointer;
		color: white;
		background: linear-gradient(#6bbdff, #007bff);
		border: solid 2px #007bff;
		font-weight: bold;
	}
</style>