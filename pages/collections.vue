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
						<a class="navbar-brand" href="/collections">Collections</a>
						<a class="navbar-brand" href="/ammo">Ammo</a>
					</div>
					<h4 align="right">
						<form @change="getFilteredCollections(selected={env, project, name}) " >
							<select class="dropbtn" v-model="env">
								<option value="">All</option>
								<option v-for="(env, index) in envs" :key="index">
									{{ env }}
								</option>
							</select>
							<select class="dropbtn" v-model="project">
								<option value="">All</option>
								<option v-for="(project, index) in projects" :key="index" :value="project.projectId">
									{{ project.projectId }}
									<span v-if="project.projectName">({{ project.projectName }})</span>
								</option>
							</select>
							<select class="dropbtn" v-model="name">
								<option value="">All</option>
								<option v-for="(name, index) in names" :key="index">
									{{ name }}
								</option>
							</select>
							<button class="dropbtn flush" @click="flushAllFilters()">Flush all filters</button>
						</form>

					</h4>
				</div>
			</nav>

			<div class="table">
				<div v-if="loading">
					<h3 align="center">Loading...</h3>
				</div>
				<div v-else>
					<table class="table table-sm table-bordered" >
						<caption>Last collections</caption>
						<thead>
							<tr>
								<th scope="col" class="text-center">Collection ID</th>
								<th scope="col" class="text-center">Author</th>
								<th scope="col" class="text-center">Environment</th>
								<th scope="col" class="text-center">Project ID</th>
								<th scope="col" class="text-center">Project name</th>
								<th scope="col" class="text-center">Name</th>
								<th scope="col" class="text-center">Branch</th>
								<th scope="col" class="text-center">Latest jobs</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="collection in collections" :key="collection.id">
								<td align="center">
									<a :href='"/collection?id="+collection.id'>{{ collection.id }}</a>
								</td>
								<td align="center">
									{{ collection.author }}
								</td>
								<td align="center">
									{{ collection.env }}
								</td>
								<td align="center">
									{{ collection.project }}
								</td>
								<td align="center">
									{{ collection.service }}
								</td>
								<td align="center">
									{{ collection.name }}
								</td>
								<td align="center">
									{{ collection.ref }}
								</td>
								<td align="center">
									<a :href='"/job?id="+job.id' v-for="job in collection.latestJobs" :key="job.id">
										{{ job.id }}
									</a>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</template>


<script>
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
		};
	},
	head: {
		title: 'Overload - нагрузочные тесты',
	},
	components: {},
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
	td > * {
		vertical-align : middle;
	}

	.dropbtn {
		background-color: white;
		color: black;
		font-size: 16px;
		border: solid 2px #007bff;
		border-radius: 5px;
		width: auto;
		cursor: pointer;
	}

	.flush {
		color: white;
		background: linear-gradient(#6bbdff, #007bff);
		border: solid 2px #007bff;
		font-weight: bold;
	}
</style>