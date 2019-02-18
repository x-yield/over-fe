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

			<modal v-show="editorVisibility" @close="toggleEditor">
				<h3 slot="header">Редактирование теста {{ job.id }}</h3>
				<h3 slot="body">
					<div class="overload-fe-container job-editor">
						<Container fluid>
							<Row>
								<Column>
									<Input
										label="Author"
										:value="job.author"
										v-model="job.author"
									/>
								</Column>
							</Row>
							<Row>
								<Column>
									<Input
										label="Description"
										:value="job.description"
										v-model="job.description"
									/>
								</Column>
							</Row>
							<Row>
								<Column>
									<Input
										label="Status"
										v-model="job.status"
										:value="job.status"
									/>
								</Column>
							</Row>
							<Row>
								<Column>
									<Input
										label="Tank"
										v-model="job.tank"
										:value="job.tank"
									/>
								</Column>
							</Row>
							<Row>
								<Column>
									<Input
										label="Target"
										v-model="job.target"
										:value="job.target"
									/>
								</Column>
							</Row>
						</Container>
					</div>
				</h3>
				<h3 slot="footer">
					<div class="overload-fe-container buttons">
						<Row>
							<Column>
								<Button
									theme="primary"
									@click="updateJob"
									:icon="loading ? 'actions-spinner' : ''"
								>
									Сохранить
								</Button>
							</Column>
							<Column>
								<Button
									theme="secondary"
									@click="toggleEditor"
								>
									Отмена
								</Button>
							</Column>
						</Row>
					</div>

				</h3>
			</modal>

			<modal v-show="kubernetesInfoVisibility" @close="toggleKubernetesInfo">
				<h3 slot="header">Данные о {{ job.target }} из Kubernetes </h3>
				<h3 slot="body" class="job-kubernetes-info">
					<div class="overload-fe-container">
						<pre>{{ job.environmentDetails }}</pre>
					</div>
				</h3>
				<h3 slot="footer">
					<div class="overload-fe-container buttons">
						<Row>
							<Column>
								<Button
									theme="secondary"
									@click="toggleKubernetesInfo"
								>
									Закрыть
								</Button>
							</Column>
						</Row>
					</div>

				</h3>
			</modal>


			<div v-if="loading">
				<h3 align="center">Loading...</h3>
			</div>
			<div v-else>
				<!-- test id table -->
				<div>
					<h4 align="center">Test #{{ job.id }}</h4>
					<h4 align="right">
						<a :href='"/regressions?id="+test_id'>
							<img
								v-if="job.collectionIds"
								alt="edit"
								width="35px"
								height="40px"
								src="~/assets/icons/regression.png"
							/>
						</a>
						<img
							v-if="job.environmentDetails"
							alt="edit"
							width="40px"
							height="40px"
							src="~/assets/icons/kubernetes.png"
							@click="toggleKubernetesInfo"
						/>
						<img
							alt="edit"
							width="30px"
							height="30px"
							src="~/assets/icons/edit.png"
							@click="toggleEditor"
						/>
						<img
							alt="delete"
							width="30px"
							height="30px"
							src="~/assets/icons/delete.png"
							@click="deleteJob"
						/>
					</h4>
				</div>
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
							<tr>
								<td align="center">Description</td>
								<td align="center">{{ job.description }}</td>
							</tr>
							<tr v-if="job.autostopTime">
								<td align="center">Autostop time</td>
								<td align="center">{{ ts_to_date(job.autostopTime) }}</td>
							</tr>
							<tr v-if="job.autostopMessage">
								<td align="center">Autostop reason</td>
								<td align="center">{{ job.autostopMessage }}</td>
							</tr>
							<tr v-if="job.imbalance">
								<td align="center">Imbalance</td>
								<td align="center">{{ job.imbalance }}</td>
							</tr>
						</tbody>
					</table>
				</div>

				<!-- grafana graphs for resources -->
				<h4
					v-if="job.environmentDetails"
					align="center"
					@click="get_resources_graphs"
					class="resources-graphs"
					:class="{ collapsed: resourcesVisibility }">
					resources utilization
				</h4>
				<div v-show="resourcesVisibility" class="col-md-12">
					<div class="row justify-content-between">
						<div class="col-md-4 col-sm-12">
							<img
								src="resources.graphs.cpu"
								width="100%"
								height="100%"
								align="top"
								frameborder="0"
								style="overflow: hidden;"
							/>
						</div>
						<div class="col-md-4 col-sm-12">
							<!-- Memory -->
							<iframe
								:src="resources.graphs.memory"
								width="100%"
								height="100%"
								marginheight="0"
								align="top"
								scrolling="No"
								frameborder="0"
								style="overflow: hidden;"
							/>
						</div>
						<div class="col-md-4 col-sm-12">
							<!-- Network -->
							<iframe
								:src="resources.graphs.network"
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
					@click="toggleVisibility">
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
									<td @click="toggleOverallCodeVisibility" class="plus" :class="overallCodeVisibility === true ? 'collapsed' : ''">Overall
									</td>
									<td>{{ overall.okCount }}</td>
									<td>{{ overall.errCount }}</td>
									<td>{{ overall.q50 }}</td>
									<td>{{ overall.q75 }}</td>
									<td>{{ overall.q90 }}</td>
									<td>{{ overall.q95 }}</td>
									<td>{{ overall.q98 }}</td>
									<td>{{ overall.q99 }}</td>
								</tr>
								<tr v-show="overallCodeVisibility" v-for="aggregate in overallByCode" :key="aggregate.responseCode" class="hidden">
									<td>{{ aggregate.responseCode }}</td>
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
									<th
										v-for="agg_header in agg_headers"
										@click="sort_aggregates(agg_header)"
										:key="agg_header">{{ agg_header }}
										<div class="arrow" v-if="agg_header === currentSort" :class="currentSortDir === 'asc' ? 'asc' : 'dsc'"/>
									</th>
								</tr>
							</thead>
							<tbody>
								<template v-for="tag in sortedAggregates" >
									<tr :key="tag.label">
										<td @click.stop="toggleResponseCodeVisibility(tag.label)" class="plus" :class="{ collapsed: openedTag.includes(tag.label) }">{{ tag.label }}</td>
										<td>{{ tag.okCount }}</td>
										<td>{{ tag.errCount }}</td>
										<td>{{ tag.q50 }}</td>
										<td>{{ tag.q75 }}</td>
										<td>{{ tag.q90 }}</td>
										<td>{{ tag.q95 }}</td>
										<td>{{ tag.q98 }}</td>
										<td>{{ tag.q99 }}</td>
									</tr>
									<template v-if="openedTag.includes(code.label)" v-for="code in taggedByCode">
										<tr :key="code.responseCode" v-if="code.label === tag.label" class="hidden">
											<td>{{ code.responseCode }}</td>
											<td>{{ code.okCount }}</td>
											<td>{{ code.errCount }}</td>
											<td>{{ code.q50 }}</td>
											<td>{{ code.q75 }}</td>
											<td>{{ code.q90 }}</td>
											<td>{{ code.q95 }}</td>
											<td>{{ code.q98 }}</td>
											<td>{{ code.q99 }}</td>
										</tr>
									</template>
								</template>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Modal from '../components/Modal';
import Layout from '@ozonui/layout';
import '@ozonui/layout/src/grid.css';
import Input from '@ozonui/form-input';
import FormSelect from '@ozonui/form-select';
import Button from '@ozonui/custom-button';

const {FormSelect: Select, FormSelectOption: Option} = FormSelect;

const {
	container,
	row,
	column,
} = Layout;


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
				status: null,
			},
			resources: {
				graphs: {
					cpu: null,
					memory: null,
					network: null,
				},
			},
			isSummaryVisible: true,
			overall: {},
			tagged: [],
			overallByCode: [],
			taggedByCode: [],
			sortedTaggedByCode: [],
			openedTag: [],
			loading: true,
			error: null,
			success: null,
			editorVisibility: false,
			kubernetesInfoVisibility: false,
			resourcesVisibility: false,
			currentSort: 'label',
			currentSortDir: 'asc',
			overallCodeVisibility: false,
			agg_headers: ['label', 'ok', 'errors', 'q50', 'q75', 'q90', 'q95', 'q98', 'q99']
		};
	},
	head: {
		title: 'Overload - нагрузочные тесты',
	},
	components: {
		Modal,
		Button,
		Input,
		Select,
		Option,
		Row: row,
		Column: column,
		Container: container
	},
	created() {
		this.test_id = this.$route.query.id;
	},
	mounted() {
		this.get_test_info(this.test_id);
		this.get_test_aggregates(this.test_id);

		if (this.job.status === 'finished') {
			// test finished, we dont need to update the page anymore
		} else {
			this.watcher = setInterval(function() {
				this.get_test_info(this.test_id);
				if (this.job.status === 'finished') {
					clearInterval(this.watcher);
				}
			}.bind(this), 5000);
		}
	},
	methods: {
		updateJob() {
			this.$store.dispatch('job/updateJob', this.job);
			this.toggleEditor();
		},
		deleteJob() {
			if (confirm('Удалить '+this.job.id+'?')) {
				this.$store.dispatch('job/deleteJob', this.job.id);
				this.$router.push('/');
			}
		},
		toggleEditor: function() {
			clearInterval(this.watcher);
			this.editorVisibility = !this.editorVisibility;
		},
		toggleKubernetesInfo: function() {
			clearInterval(this.watcher);
			this.kubernetesInfoVisibility = !this.kubernetesInfoVisibility;
		},
		toggleResourcesVisibility: function() {
			this.resourcesVisibility = !this.resourcesVisibility;
		},
		toggleVisibility: function() {
			this.isSummaryVisible = !this.isSummaryVisible;
		},
		toggleResponseCodeVisibility(name) {
			const index = this.openedTag.indexOf(name);

			if (index > -1) {
				this.openedTag.splice(index, 1);
			} else {
				this.openedTag.push(name);
			}
		},
		toggleOverallCodeVisibility() {
			this.overallCodeVisibility = !this.overallCodeVisibility;
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
					return response[0].data.job;
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
		get_resources_graphs: function() {
			this.resources.graphs = {};
			if (isNaN(this.job.testStop)) {
				this.job.finishedTime = 'now';
			} else {
				this.job.finishedTime = this.job.testStop * 1000;
			}
			this.resources.graphs.cpu = 'http://grafana.o3.ru/render/d-solo/WdGUX7vmk/pod?refresh=5s&orgId=1&panelId=17&from=1550231733779&to=1550242533779&var-datasource=%5BPROD%5D%20K8S%20Prometheus&var-Pod=ab-controller-api-76979755cf-wmh5w&theme=light';
			//this.resources.graphs.cpu = 'http://grafana.o3.ru/render/d-solo/WdGUX7vmk/pod?orgId=1&refresh=5s&var-datasource=&' + this.env + '%5D%20K8S%20Prometheus&var-Pod=' + pods_data + '&var-phase=Failed&var-container=cpu&theme=light&panelId=17&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime;
			//this.resources.graphs.memory = 'http://grafana.o3.ru/render/d-solo/WdGUX7vmk/pod?orgId=1&refresh=5s&var-datasource=&' + this.env + '%5D%20K8S%20Prometheus&var-Pod=' + pods_data + '&var-phase=Failed&var-container=cpu&theme=light&panelId=17&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime;
			//this.resources.graphs.network = 'http://grafana.o3.ru/render/d-solo/WdGUX7vmk/pod?orgId=1&refresh=5s&var-datasource=&' + this.env + '%5D%20K8S%20Prometheus&var-Pod=' + pods_data + '&var-phase=Failed&var-container=cpu&theme=light&panelId=17&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime;
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
							if (agg.label === '__OVERALL__' && agg.responseCode === '__OVERALL__') {
								this.overall = (agg);
							} if (agg.label !== '__OVERALL__' && agg.responseCode === '__OVERALL__') {
								this.tagged.push(agg);
							} if (agg.label === '__OVERALL__' && agg.responseCode !== '__OVERALL__') {
								this.overallByCode.push(agg);
							} if (agg.label !== '__OVERALL__' && agg.responseCode !== '__OVERALL__') {
								this.taggedByCode.push(agg);
							}
						}
					);
				});
		},
		sort_aggregates: function(s) {
			if (s === this.currentSort) {
				this.currentSortDir = this.currentSortDir === 'asc' ? 'dsc' : 'asc';
			}
			this.currentSort = s;
		},
	},
	computed: {
		sortedAggregates:function() {
			return this.tagged.slice().sort((a, b) => {
				let modifier =1;

				if (this.currentSortDir === 'dsc') {modifier = -1;}
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
		width: 90%;
		margin: auto;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}

	.overload-fe-container {
		flex: 1;
		horiz-align: center;
	}

	td > * {
		vertical-align : middle;
	}

	.buttons {
		padding-top: 10px;
	}

	.job-editor * {
		padding-top: 10px;
	}

	.job-kubernetes-info * {
		padding-top: 10px;
		font-size: 14px;
		max-height: 350px;
		overflow-y: scroll;
		color: black;
	}

	.plus:after {
		height: 14px;
		width: 14px;
		margin-left: 3px;
		box-sizing: content-box;
		display: inline-block;
		vertical-align: middle;
		color: white;
		border: 1px solid white;
		border-radius: 18px;
		box-shadow: 0 0 3px #444;
		text-align: center;
		text-indent: 0 !important;
		font-family: 'Courier New', Courier, monospace;
		line-height: 14px;
		background-color: #31b131;
		content: '+';
	}

	.plus.collapsed:after {
		height: 14px;
		width: 14px;
		margin-left: 3px;
		box-sizing: content-box;
		display: inline-block;
		vertical-align: middle;
		color: white;
		border: 1px solid white;
		border-radius: 18px;
		box-shadow: 0 0 3px #444;
		text-align: center;
		text-indent: 0 !important;
		font-family: 'Courier New', Courier, monospace;
		line-height: 14px;
		background-color: #D85B5B;
		content: '-';
	}

	.arrow.asc{
		margin-left: 5px;
		display: inline-block;
		border-left: 7px solid transparent;
		border-right: 7px solid transparent;
		border-bottom: 8px solid #31b131;
	}

	.arrow.dsc {
		margin-left: 5px;
		display: inline-block;
		border-left: 7px solid transparent;
		border-right: 7px solid transparent;
		border-top: 8px solid #31b131;
	}

	.resources-graphs.expanded :after {
		display: inline-block;
		border-left: 30px solid transparent;
		border-right: 30px solid transparent;
		border-bottom: 30px solid #000000;
	}

	.resources-graphs.collapsed :after {
		display: inline-block;
		border-left: 30px solid transparent;
		border-right: 30px solid transparent;
		border-top: 30px solid #000000;
	}
	.hidden {
		background-color: #F0EDED;
	}
</style>