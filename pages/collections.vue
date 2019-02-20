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
						<select class="dropbtn" @change="get_filtered_collections(selected)" v-model="selected">
							<option v-for="collection in collections" :key="collection">
								{{ collection.env }}
							</option>
						</select>
						<select class="dropbtn" @change="get_filtered_collections(selected)" v-model="selected">
							<option v-for="collection in collections" :key="collection">
								{{ collection.service }}
							</option>
						</select>
						<select class="dropbtn" @change="get_filtered_collections(selected)" v-model="selected">
							<option v-for="collection in collections" :key="collection">
								{{ collection.name }}
							</option>
						</select>
					</h4>
					<!-- Основная часть меню (может содержать ссылки, формы и другие элементы) -->
					<div class="collapse navbar-collapse" id="navbar-main">
						<ul class="nav navbar-nav">
							<li class="active"><a href="">Last tests</a></li>
						</ul>
					</div>
				</div>
			</nav>

			<div class="table">
				<div v-if="loading">
					<h3 align="center">Loading...</h3>
				</div>
				<div v-else>
					<table class="table table-sm table-bordered" >
						<caption>Last tests</caption>
						<thead>
							<tr>
								<th scope="col" class="text-center">Collection id</th>
								<th scope="col" class="text-center">Author</th>
								<th scope="col" class="text-center">Environment</th>
								<th scope="col" class="text-center">Service</th>
								<th scope="col" class="text-center">Name</th>
								<th scope="col" class="text-center">Branch</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="job in last_jobs" :key="job.id">
								<td
									align="center"
								>
									<a :href='"/job?id="+job.id'>{{ job.id }}</a>
								</td>
								<td
									align="center"
								>
									{{ job.author }}
								</td>
								<td
									align="center"
								>
									prod
								</td>
								<td align="center">
									k8s imbalance
								</td>
								<td align="center">
									{{ job.target }}
								</td>
								<td align="center">
									master
								</td>
							</tr>
						</tbody>
					</table>
					<button class="btn-lg" @click="more_tests(last_jobs[last_jobs.length-1].id)">I need more tests</button>
				</div>
			</div>
		</div>
	</div>
</template>


<script>
export default {
	data() {
		return {
			last_jobs: [],
			loading: true,
			collections: [{
				env: 'prod',
				service: 'item',
				name: 'k8s imbalance'
			}, {
				env: 'stg',
				service: 'pdp',
				name: 'marketing imbalance'
			}
			]
		};
	},
	head: {
		title: 'Overload - нагрузочные тесты',
	},
	components: {},
	created() {
		this.$api.get('/lastjobs/0')
			.then(response => {
				const jobs = this.last_jobs;

				const resp_data = response[0].data.jobs;

				resp_data.forEach(function(item) {
					jobs.push(item);
				});
				this.loading = false;
			});
	},
	methods: {
		more_tests: function(from_) {
			this.$api.get('/lastjobs/' + from_)
				.then(response => {
					const jobs = this.last_jobs;

					const resp_data = response[0].data.jobs;

					resp_data.forEach(function(item) {
						jobs.push(item);
					});
				});
		},
		get_filtered_collections(param) {
			this.api.get('/collections?env=' + param)
				.then(response => {
					const collections = this.collections
					const resp_data = response[0].data.collections;

					resp_data.forEach(function(item) {
						collections.push(item);
					});
				});
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