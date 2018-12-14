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
					<!-- Основная часть меню (может содержать ссылки, формы и другие элементы) -->
					<div class="collapse navbar-collapse" id="navbar-main">
						<ul class="nav navbar-nav">
							<li class="active"><a href="">Last tests</a></li>
						</ul>
					</div>
				</div>
			</nav>

			<div class="table">
				<table class="table table-sm table-bordered">
					<caption>Last tests</caption>
					<thead>
						<tr>
							<th scope="col" class="text-center">Test id</th>
							<th scope="col" class="text-center">Author</th>
							<th scope="col" class="text-center">Status</th>
							<th scope="col" class="text-center">Start → Stop</th>
							<th scope="col" class="text-center">Target</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="job in last_jobs">
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
								:class="{active: is_in_progress(job.status), warning: !is_in_progress(job.status)}"
							>
								{{ job.status }}
							</td>
							<td align="center">
								{{ ts_to_date(job.testStart) }} → {{ ts_to_date(job.testStop) }}
							</td>
							<td align="center">
								{{ job.target }}
							</td>
						</tr>
					</tbody>
				</table>
				<button class="btn-lg" @click="more_tests(last_jobs.length)">I need more tests</button>
			</div>
		</div>
	</div>
</template>

<script>

export default {
	data() {
		return {
			last_jobs: [],
		};
	},
	head: {
		title: 'Overload - нагрузочные тесты',
	},
	components: {
	},
	created() {
		this.$api.get('/lastjobs/0')
			.then(response => {
				const jobs = this.last_jobs;

				const resp_data = response[0].data.jobs;

				resp_data.forEach(function(item){
					jobs.push(item);
				});
			});
	},
	mounted() {
	},
	methods: {
		more_tests: function (from_) {
			this.$api.get('/lastjobs/' + from_)
				.then(response => {
					const jobs = this.last_jobs;

					const resp_data = response[0].data.jobs;

					resp_data.forEach(function(item){
						jobs.push(item);
					});
				});
		},
		ts_to_date: function (ts) {
			const from_ts = new Date(ts * 1000);

			const today = new Date();

			const from_ts_hour = from_ts.getHours();

			const from_ts_min = from_ts.getMinutes() < 10 ? '0' + from_ts.getMinutes() : from_ts.getMinutes();

			const from_ts_sec = from_ts.getSeconds() < 10 ? '0' + from_ts.getSeconds() : from_ts.getSeconds();

			const from_ts_year = from_ts.getFullYear();

			if (isNaN(from_ts.getDate())) {
				return 'not yet';
			}
			else if (today.getDate() === from_ts.getDate()) {
				return from_ts_hour + ':' + from_ts_min;
			}
			else if (today.getFullYear() === from_ts_year) {
				const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

				const month = months[from_ts.getMonth()];

				const date = from_ts.getDate();

				return date + ' ' + month + ' ' + from_ts_hour + ':' + from_ts_min + ':' + from_ts_sec;
			}
			else {
				const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

				const month = months[from_ts.getMonth()];

				const date = from_ts.getDate();

				return date + ' ' + month + ' ' + from_ts_year + ' ' + from_ts_hour + ':' + from_ts_min + ':' + from_ts_sec;
			}
		},
		is_in_progress: function (status) {
			if (status != 'finished') {
				return false;
			}
			else {
				return true;
			}
		}
	},
};
</script>


<style scoped>
	.overload-fe {
		padding-top: 20px;
		margin: auto;
		padding-left: 20px;
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

