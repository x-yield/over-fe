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
							<li class="active"><a href="/">Last tests</a></li>
						</ul>
					</div>
				</div>
			</nav>


			<div v-if="loading">
				<h3 align="center">Loading...</h3>
			</div>
			<div v-else>
				<!-- test id table -->
				<h3 align="center">Test #{{ job.id }}</h3>
				<div class="col-md-12">
					<table class="table table-sm table-hover">
						<tbody>
							<tr>
								<td align="center">Author</td>
								<td align="center">{{ job.author }}</td>
							</tr>
							<tr>
								<td align="center">Status</td>
								<td
									align="center"
								>
									{{ job.status }}
								</td>
							</tr>
							<tr>
								<td align="center">Test start</td>
								<td align="center">{{ ts_to_date(job.testStart) }}</td>
							</tr>
							<tr>
								<td align="center">Test stop</td>
								<td align="center">{{ ts_to_date(job.testStop) }}</td>
							</tr>
							<tr>
								<td align="center">Target</td>
								<td align="center">{{ job.target }}</td>
							</tr>
						</tbody>
					</table>
				</div>

				<!-- grafana graphs -->
				<div class="col-md-12">
					<h3 align="center">graphs</h3>
					<div class="row justify-content-between" style="height:300px;">
						<div class="col-md-6 col-sm-12">
							<!-- rps -->
							<iframe
								:src="job.graphs.rps"
								width="100%"
								height="100%"
								marginheight="0"
								align="top"
								scrolling="No"
								frameborder="0"
								style="overflow: hidden;"
							/>
						</div>
						<div class="col-md-6 col-sm-12">
							<!-- net codes -->
							<iframe
								:src="job.graphs.quantiles"
								width="100%"
								height="100%"
								marginheight="0"
								align="top"
								scrolling="No"
								frameborder="0"
								style="overflow: hidden;"
							/>
						</div>
					</div>
					<div class="row justify-content-between" style="height:300px;">
						<div class="col-md-6 col-sm-12">
							<!-- quantiles -->
							<iframe
								:src="job.graphs.netcodes"
								width="100%"
								height="100%"
								marginheight="0"
								align="top"
								scrolling="No"
								frameborder="0"
								style="overflow: hidden;"
							/>
						</div>
						<div class="col-md-6 col-sm-12">
							<!-- tank threads -->
							<iframe
								:src="job.graphs.threads"
								width="100%"
								height="100%"
								marginheight="0"
								align="top"
								scrolling="No"
								frameborder="0"
								style="overflow: hidden;"
							/>
						</div>
					</div>
				</div>

				<!-- summary stats -->
				<h3
					align="center"
					@click="toggleVisibility"
				>
					Summary stats
				</h3>
				<div v-show="isSummaryVisible" class="col-md-12">
					<div class="row justify-content-between">
						<table id="StatsOverall" class="hover table table-bordered">
							<thead>
								<tr>
									<th>label</th>
									<th>ok</th>
									<th>errors</th>
									<th>q50, ms</th>
									<th>q75, ms</th>
									<th>q90, ms</th>
									<th>q95, ms</th>
									<th>q98, ms</th>
									<th>q99, ms</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>Overall</td>
									<td>{{ overall_aggregates.okCount }}</td>
									<td>{{ overall_aggregates.errCount }}</td>
									<td>{{ overall_aggregates.q50 }}</td>
									<td>{{ overall_aggregates.q75 }}</td>
									<td>{{ overall_aggregates.q90 }}</td>
									<td>{{ overall_aggregates.q95 }}</td>
									<td>{{ overall_aggregates.q98 }}</td>
									<td>{{ overall_aggregates.q99 }}</td>
								</tr>
							</tbody>
							<tfoot/>
							<tfoot/>
						</table>
					</div>
				</div>
				<h4
					align="center"
					@click="toggleVisibility"
				>
					Detailed stats
				</h4>
				<div v-show="isSummaryVisible" class="col-md-12">
					<div class="row justify-content-between">
						<table id="StatsDetails" class="hover table table-bordered">
							<thead>
								<tr>
									<th @click="sort_aggregates('label')">label</th>
									<th @click="sort_aggregates('ok')">ok</th>
									<th @click="sort_aggregates('errors')">errors</th>
									<th @click="sort_aggregates('q50, ms')">q50, ms</th>
									<th @click="sort_aggregates('q75, ms')">q75, ms</th>
									<th @click="sort_aggregates('q90, ms')">q90, ms</th>
									<th @click="sort_aggregates('q95, ms')">q95, ms</th>
									<th @click="sort_aggregates('q98, ms')">q98, ms</th>
									<th @click="sort_aggregates('q99, ms')">q99, ms</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="aggregate in sortedAggregates" :key="aggregate.label">
									<td>{{ aggregate.label }}</td>
									<td>{{ aggregate.okCount }}</td>
									<td>{{ aggregate.errCount }}</td>
									<td>{{ aggregate.q50 }}</td>
									<td>{{ aggregate.q75 }}</td>
									<td>{{ aggregate.q90 }}</td>
									<td>{{ aggregate.q95 }}</td>
									<td>{{ aggregate.q98 }}</td>
									<td>{{ aggregate.q99 }}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			test_id: null,
			job: {
				graphs: {
					rps: null,
					netcodes: null,
					quantiles: null,
					threads: null,
				},
			},
			overall_aggregates: {},
			isSummaryVisible: true,
			aggregates: [],
			pods_data: {},
			loading: true,
			currentSort: 'label',
			currentSortDir: 'asc'
		};
	},
	head: {
		title: 'Overload - нагрузочные тесты',
	},
	components: {},
	created() {
		this.test_id = this.$route.query.id;
	},
	mounted() {
		this.get_test_info(this.test_id);
		this.get_test_aggregates(this.test_id);

		if (this.job.status === 'finished') {
			// test finished, we dont need to update the page anymore
		} else {
			setInterval(function () {
				this.get_test_info(this.test_id);
			}.bind(this), 5000);
		}
	},
	methods: {
		toggleVisibility: function() {
			this.isSummaryVisible = !this.isSummaryVisible;
		},
		ts_to_date: function(ts) {
			const from_ts = new Date(ts * 1000);

			const from_ts_hour = from_ts.getHours();

			const from_ts_min = from_ts.getMinutes() < 10 ? '0' + from_ts.getMinutes() : from_ts.getMinutes();

			const from_ts_sec = from_ts.getSeconds() < 10 ? '0' + from_ts.getSeconds() : from_ts.getSeconds();

			const from_ts_year = from_ts.getFullYear();

			if (isNaN(from_ts.getDate())) {
				return 'not yet received';
			} else {
				const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

				const month = months[from_ts.getMonth()];

				const date = from_ts.getDate();

				return date + ' ' + month + ' ' + from_ts_year + ' ' + from_ts_hour + ':' + from_ts_min + ':' + from_ts_sec;
			}
		},
		get_test_info: function(id) {
			this.$api.get('/job/' + id)
				.then(response => {
					return response[0].data;
				})
				.then(job_json => {
					if (!job_json) {
						return;
					}
					this.job = job_json;
					this.job.graphs = {};
					if (isNaN(this.job.testStop)) {
						this.job.finishedTime = 'now';
					} else {
						this.job.finishedTime = this.job.testStop * 1000;
					}
					this.job.graphs.rps = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=2&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime + '&var-test_id=' + this.job.id;
					this.job.graphs.netcodes = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=4&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime + '&var-test_id=' + this.job.id;
					this.job.graphs.quantiles = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=8&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime + '&var-test_id=' + this.job.id;
					this.job.graphs.threads = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=6&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime + '&var-test_id=' + this.job.id;
					this.loading = false;
				});
		},
		get_test_aggregates: function(id) {
			this.$api.get('/aggregates/' + id)
				.then(response => {
					return response[0].data;
				})
				.then(json => {
					if (!json.aggregates) {
						return;
					}
					json.aggregates.forEach(
						agg => {
							if (agg.label === '__OVERALL__') {
								this.overall_aggregates = agg;
							} else {
								this.aggregates.push(agg);
							}
						}
					);
				});
		},
		sort_aggregates: function(s) {
			if (s === this.currentSort) {
				this.currentSortDir = this.currentSortDir === 'asc' ? 'desc' : 'asc';
			}
			this.currentSort = s;
		}
	},
	computed: {
		sortedAggregates:function() {
			return this.aggregates.slice().sort((a, b) => {
				let modifier =1;

				if (this.currentSortDir === 'desc') {modifier = -1;}
				if (a[this.currentSort] < b[this.currentSort]) {return -1 * modifier;}
				if (a[this.currentSort] > b[this.currentSort]) {return 1 * modifier;}
				return 0;
			});
		}
	}

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
    .podsBtns {
        font-size: 9pt;
        background-color: #94e88a;
    }
</style>