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


			<div>
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
								<td align="center"
									v-bind:class="{ active: is_in_progress(job.status), warning: !is_in_progress(job.status)}">
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
					<div class="container-fluid">
						<div class="row">
							<div class="col-md-6 col-sm-12">
								<!-- rps -->
								<iframe
										:src="job.graphs.rps"
										width="100%" height="100%" marginheight="0" align="top" scrolling="No" frameborder="0"
										style="overflow: hidden;">
								</iframe>
								<!-- quantiles -->
								<iframe
										:src="job.graphs.netcodes"
										width="100%" height="100%" marginheight="0" align="top" scrolling="No" frameborder="0"
										style="overflow: hidden;">
								</iframe>
							</div>
							<div class="col-md-6 col-sm-12">
								<!-- net codes -->
								<iframe
										:src="job.graphs.quantiles"
										width="100%" height="100%" marginheight="0" align="top" scrolling="No" frameborder="0"
										style="overflow: hidden;">
								</iframe>
								<!-- tank threads -->
								<iframe
										:src="job.graphs.threads"
										width="100%" height="100%" marginheight="0" align="top" scrolling="No" frameborder="0"
										style="overflow: hidden;">
								</iframe>
							</div>
						</div>
					</div>
				</div>

				<!-- summary stats
				<div class="col-md-12">
					<h3 align="center">Summary stats</h3>
					<div class="container-fluid">
						<table id="StatsOverall" class="hover table table-bordered">
							<thead>
							<tr>
								<th class="dt-head-right">label</th>
								<th class="dt-head-right">ok</th>
								<th class="dt-head-right">errors</th>
								<th class="dt-head-right">avg, ms</th>
								<th class="dt-head-right">q50, ms</th>
								<th class="dt-head-right">q75, ms</th>
								<th class="dt-head-right">q90, ms</th>
								<th class="dt-head-right">q95, ms</th>
								<th class="dt-head-right">q98, ms</th>
								<th class="dt-head-right">q99, ms</th>
							</tr>
							</thead>
							<tbody>
							<tr>
								<td class="col-md-3 dt-body-right">OVERALL</td>
								<td class="col-md-1 dt-body-right">{{ overall_aggregates.okCount }}</td>
								<td class="col-md-1 dt-body-right">{{ overall_aggregates.errCount }}</td>
								<td class="col-md-1 dt-body-right">{{ overall_aggregates.avg }}</td>
								<td class="col-md-1 dt-body-right">{{ overall_aggregates.q50 }}</td>
								<td class="col-md-1 dt-body-right">{{ overall_aggregates.q75 }}</td>
								<td class="col-md-1 dt-body-right">{{ overall_aggregates.q90 }}</td>
								<td class="col-md-1 dt-body-right">{{ overall_aggregates.q95 }}</td>
								<td class="col-md-1 dt-body-right">{{ overall_aggregates.q98 }}</td>
								<td class="col-md-1 dt-body-right">{{ overall_aggregates.q99 }}</td>
							</tr>
							</tbody>
							<tfoot>
							</tfoot>
						</table>
					</div>
					<div class="container-fluid">
						<table id="cummulativeStats" class="hover table table-bordered">
							<thead>
							<tr>
								<th class="dt-head-right">label</th>
								<th class="dt-head-right">ok</th>
								<th class="dt-head-right">errors</th>
								<th class="dt-head-right">avg, ms</th>
								<th class="dt-head-right">q50, ms</th>
								<th class="dt-head-right">q75, ms</th>
								<th class="dt-head-right">q90, ms</th>
								<th class="dt-head-right">q95, ms</th>
								<th class="dt-head-right">q98, ms</th>
								<th class="dt-head-right">q99, ms</th>
							</tr>
							</thead>
							<tbody>
							<tr v-for="agg in aggregates">
								<td class="col-md-3 dt-body-right">{{ agg.label }}</td>
								<td class="col-md-1 dt-body-right">{{ agg.okCount }}</td>
								<td class="col-md-1 dt-body-right">{{ agg.errCount }}</td>
								<td class="col-md-1 dt-body-right">{{ agg.avg }}</td>
								<td class="col-md-1 dt-body-right">{{ agg.q50 }}</td>
								<td class="col-md-1 dt-body-right">{{ agg.q75 }}</td>
								<td class="col-md-1 dt-body-right">{{ agg.q90 }}</td>
								<td class="col-md-1 dt-body-right">{{ agg.q95 }}</td>
								<td class="col-md-1 dt-body-right">{{ agg.q98 }}</td>
								<td class="col-md-1 dt-body-right">{{ agg.q99 }}</td>
							</tr>
							</tbody>
							<tfoot>
							</tfoot>
						</table>
					</div>
				</div>
				-->
				<!-- k8s pods

				<div>
					<h3 align="center">k8s pods</h3>
					<div class="container-fluid">
						<div class="row">
							<div class="col-md-6 col-sm-12" v-for="pod in job.pods_data">
								<button class="btn btn-outline-dark btn-sm podsBtns"  data-toggle="collapse"
									v-bind:data-target='"#"+pod.name+"_graphs_collapse"' >
									{{ pod.name }}
								</button>

								<div v-bind:id='pod.name+"_graphs_collapse"' class="collapse out">
									<br>
									<h6>{{ pod_name }}</h6>
									<br>
									<div class="container-fluid">
										<div class="row">
											<div>

												<img
														:src="pod.graphs.cpu"
														width="100%" height="50%" marginheight="0" align="top" scrolling="No" frameborder="0"
														style="overflow: hidden;">
												</img>

												<img
														:src="pod.graphs.mem"
														width="100%" height="50%" marginheight="0" align="top" scrolling="No" frameborder="0"
														style="overflow: hidden;">
												</img>

												<img
														:src="pod.graphs.net"
														width="100%" height="50%" marginheight="0" align="top" scrolling="No" frameborder="0"
														style="overflow: hidden;">
												</img>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				-->
				<!-- test config
				<div>
					<h3 align="center">Test config</h3>
					<pre>
						<code id="code" class="properties">{{ job.config }}</code>
					</pre>
				</div>

				<!-- k8s info
				<div>
					<h3 align="center">k8s configs</h3>
					<pre>
						<code id="code" class="properties">{{ job.environmentDetails }}</code>
					</pre>
				</div>-->
			</div>
		</div>
	</div>
</template>

<script>
import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify);


export default {
	//middleware: 'authenticated',
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
            aggregates: [],
            pods_data: {},
            dt_initialized: false,
		};
	},
	head: {
		title: 'Overload - нагрузочные тесты',
	},
	components: {
	},
	created() {
		this.test_id = this.$route.query.id;
		this.$api.get('/job/' + this.test_id)
			.then(response => {
				return response[0].data;
			})
			.then(job_json => {
				this.job = job_json;
				this.job.graphs = {};
				this.job.graphs.rps = "http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=2&from="+this.job.testStart*1000+"&to="+this.job.testStop*1000+"&var-test_id="+this.job.id;
				this.job.graphs.netcodes = "http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=4&from="+this.job.testStart*1000+"&to="+this.job.testStop*1000+"&var-test_id="+this.job.id;
				this.job.graphs.quantiles = "http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=8&from="+this.job.testStart*1000+"&to="+this.job.testStop*1000+"&var-test_id="+this.job.id;
				this.job.graphs.threads = "http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=6&from="+this.job.testStart*1000+"&to="+this.job.testStop*1000+"&var-test_id="+this.job.id;
				this.job.pods_data = JSON.parse(JSON.parse(this.job.environmentDetails));
				if (this.job.pods_data) {
					Object.keys(this.job.pods_data).forEach(
						pod => {
							this.job.pods_data[pod].graphs = {};
							var env = this.job.pods_data[pod].labels.env.toUpperCase();
							var container = this.job.pods_data[pod].labels.release;
							this.job.pods_data[pod].graphs.cpu = "http://grafana.o3.ru/render/d-solo/WdGUX7vmk/pod?orgId=1&refresh=5s&var-datasource=%5B"+env+"%5D%20K8S%20Prometheus&var-Pod="+pod+"&from="+this.job.testStart*1000+"&to="+this.job.testStop*1000+"&var-phase=Failed&var-container="+container+"&theme=light&panelId=17";
							this.job.pods_data[pod].graphs.net = "http://grafana.o3.ru/render/d-solo/WdGUX7vmk/pod?orgId=1&refresh=5s&var-datasource=%5B"+env+"%5D%20K8S%20Prometheus&var-Pod="+pod+"&from="+this.job.testStart*1000+"&to="+this.job.testStop*1000+"&var-phase=Failed&var-container="+container+"&theme=light&panelId=32";
							this.job.pods_data[pod].graphs.mem = "http://grafana.o3.ru/render/d-solo/WdGUX7vmk/pod?orgId=1&refresh=5s&var-datasource=%5B"+env+"%5D%20K8S%20Prometheus&var-Pod="+pod+"&from="+this.job.testStart*1000+"&to="+this.job.testStop*1000+"&var-phase=Failed&var-container="+container+"&theme=light&panelId=25";
						}
					);
				}
			});
		this.$api.get('/aggregates/' + this.test_id)
			.then(response => {
				return response[0].data;
			})
			.then(json => {
				json.aggregates.forEach(
					agg => {
						if (agg.label == '__OVERALL__') {
							this.overall_aggregates = agg
						}
						else {
							this.aggregates.push(agg)
						}
					}
				)
			});
	},
	mounted() {
	},
	methods: {
		highlight: function (e) {
			$('pre code').each(function(i, block) {
				hljs.highlightBlock(block);
			});
		},
		ts_to_date: function (ts) {
			var from_ts = new Date(ts * 1000);
			var from_ts_hour = from_ts.getHours();
			var from_ts_min = from_ts.getMinutes() < 10 ? '0' + from_ts.getMinutes() : from_ts.getMinutes();
			var from_ts_sec = from_ts.getSeconds() < 10 ? '0' + from_ts.getSeconds() : from_ts.getSeconds();
			var from_ts_year = from_ts.getFullYear();
			if (isNaN(from_ts.getDate())) {
				return 'not yet'
			}
			else {
				var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
				var month = months[from_ts.getMonth()];
				var date = from_ts.getDate();
				return date + ' ' + month + ' ' + from_ts_year + ' ' + from_ts_hour + ':' + from_ts_min + ':' + from_ts_sec;
			}
		},
		is_in_progress: function (status) {
			if (status != 'finished') {
				return false
			}
			else {
				return true
			}
		},
		is_empty: function (list_of_elements) {
			if (list_of_elements == null || list_of_elements == undefined || list_of_elements == "null") {
				return false
			}
			if (list_of_elements.length != 0) {
				return true
			}
			else {
				return false
			}
		},
		create_datatable: function () {
			if (this.dt_initialized) {
				return
			}
			else {
				$('#cummulativeStats').DataTable({
					"paging": false,
					"info": false,
					"autoWidth": true,
					"searching": false,
				});
				this.dt_initialized = true;
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
    .podsBtns {
        font-size: 9pt;
        background-color: #94e88a;
    }
</style>