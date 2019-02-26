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
						<form @change="get_filtered_collections(selected_env, selected_project, selected_name) " >
							<select class="dropbtn" v-model="selected_env">
								<option/>
								<option v-for="parameter in envs" :key="parameter">
									{{ parameter }}
								</option>
							</select>
							<select class="dropbtn" v-model="selected_project">
								<option/>
								<option v-for="parameter in projects" :key="parameter">
									{{ parameter }}
								</option>
							</select>
							<select class="dropbtn" v-model="selected_name">
								<option/>
								<option v-for="parameter in names" :key="parameter">
									{{ parameter }}
								</option>
							</select>
							<button class="btn" @click="flush_all_filters()">Flush all filters</button>
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
								<th scope="col" class="text-center">Collection Id</th>
								<th scope="col" class="text-center">Author</th>
								<th scope="col" class="text-center">Environment</th>
								<th scope="col" class="text-center">Project name</th>
								<th scope="col" class="text-center">Service</th>
								<th scope="col" class="text-center">Name</th>
								<th scope="col" class="text-center">Branch</th>
								<th scope="col" class="text-center">Latest jobs</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="collection in collections" :key="collection.id">
								<td
									align="center"
								>
									<a :href='"/collection?id="+collection.id'>{{ collection.id }}</a>
								</td>
								<td
									align="center"
								>
									{{ collection.author }}
								</td>
								<td
									align="center"
								>
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
			selected_env: '',
			selected_project: '',
			selected_name: '',
			collections: [],
			parameters: [],
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

		this.get_filtered_collections('', '', '', '');
	},
	methods: {
		get_filtered_collections(env, project, name) {

			this.loading = true;
			let params = {env, project, name};

			let queryString = Object.keys(params).map(key => key + '=' + params[key]).join('&');

			this.collections = [];
			this.envs = [];
			this.projects = [];
			this.names = [];

			this.$api.get('/collections?'+ queryString)
				.then(response => {

					const resp_data = response[0].data.collections;

					resp_data.forEach(
						item => {
							this.collections.push(item);
						}
					);

					this.loading = false;

					this.collections.forEach(
						item => {
							if (this.envs.indexOf(item.env) === -1) {
								this.envs.push(item.env);
							}
							if (this.projects.indexOf(item.project) === -1) {
								this.projects.push(item.project);
							}
							if (this.names.indexOf(item.name) === -1) {
								this.names.push(item.name);
							}

						}
					);
				});

		},
		flush_all_filters() {
			this.selected_env, this.selected_name, this.selected_project = '';
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
		border-radius: 18px;
		width: auto;
		cursor: pointer;
	}

</style>