<template>
	<div class="overload-fe">
		<div class="overload-fe-container">
			<nav class="navbar navbar-default">
				<!-- Контейнер (определяет ширину Navbar) -->
				<div class="container-fluid">
					<!-- Заголовок -->
					<div class="navbar-header">
						<!-- Бренд или название сайта (отображается в левой части меню) -->
						<a class="navbar-brand" href="/">Overload</a>
					</div>
					<h4 align="right">
						<form @change="getFilteredCollections(selected={env, project, name}) " >
							<dropdown-menu :array="envs" v-model="env"/>
							<dropdown-menu :array="projects" v-model="project"/>
							<dropdown-menu :array="names" v-model="name"/>
							<button class="flush" @click="flushAllFilters()">Flush all filters</button>
						</form>

					</h4>
				</div>
				<div>
					<a class="navbar-brand" href="/collections">Collections</a>
					<a class="navbar-brand" href="/ammo">Ammo</a>
				</div>
			</nav>

			<div v-if="loading">
				<h3 align="center">Loading...</h3>
			</div>
			<div v-else>
				<table-list caption="Last Collections" :headers="tableHeaders" :content="collections" :isJobs="false"/>
			</div>
		</div>
	</div>
</template>


<script>
import TableList from '../components/TableList';
import DropdownMenu from '../components/DropdownMenu';

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
			tableHeaders: ['Collection ID', 'Author', 'Environment', 'Project ID', 'Project name', 'Name', 'Branch', 'Latest jobs']
		};
	},
	head: {
		title: 'Overload - нагрузочные тесты',
	},
	components: {
		TableList,
		DropdownMenu
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