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
					<!-- Основная часть меню (может содержать ссылки, формы и другие элементы) -->
					<div class="collapse navbar-collapse" id="navbar-main">
						<ul class="nav navbar-nav">
							<li class="active"><a href="/">Last tests</a></li>
						</ul>
					</div>
				</div>
			</nav>

			<modal v-show="visibilities.editorVisibility" @close="toggleVisibility('editorVisibility')">
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
									@click="toggleVisibility('editorVisibility')"
								>
									Отмена
								</Button>
							</Column>
						</Row>
					</div>

				</h3>
			</modal>

			<modal v-show="visibilities.kubernetesInfoVisibility" @close="toggleVisibility('kubernetesInfoVisibility')">
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
									@click="toggleVisibility('kubernetesInfoVisibility')"
								>
									Закрыть
								</Button>
							</Column>
						</Row>
					</div>

				</h3>
			</modal>

			<modal v-show="visibilities.collectionsListVisibility" @close="toggleVisibility('collectionsListVisibility')">
				<h3 slot="header">Список доступных коллекций для теста #{{ job.id }}</h3>
				<h3 slot="body">
					<div v-for="(collection) in collections" :key="collection.id">
						<a :href='"/collection?id="+collection.id' class="text-link">{{ collection.env + ' -> ' + collection.project + ' -> ' + collection.name }}
						</a>
					</div>
				</h3>
				<h3 slot="footer">
					<div class="overload-fe-container buttons">
						<Row>
							<Column>
								<Button
									theme="secondary"
									@click="toggleVisibility('collectionsListVisibility')">
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
						<img
							v-if="job.collections"
							alt="edit"
							width="35px"
							height="40px"
							src="~/assets/icons/regression.png"
							@click="toggleVisibility('collectionsListVisibility')"
						/>
						<img
							v-if="job.environmentDetails && job.environmentDetails !== 'null'"
							alt="edit"
							width="40px"
							height="40px"
							src="~/assets/icons/kubernetes.png"
							@click="toggleVisibility('kubernetesInfoVisibility')"
						/>
						<img
							alt="edit"
							width="30px"
							height="30px"
							src="~/assets/icons/edit.png"
							@click="toggleVisibility('editorVisibility')"
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
								<td align="center">{{ job.status }}</td>
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
				<div
					v-if="job.environmentDetails && job.environmentDetails !== 'null'"
					align="left"
					@click="toggleResourcesVisibility">
					<span class="resources-util-link">resources utilization</span>
					<div class="resources-graphs-arrow" :class="{ expanded: visibilities.resourcesVisibility }"/>
				</div>

				<div v-show="visibilities.resourcesVisibility">
					<div class="row justify-content-between">
						<div class="col-md-12 col-sm-12" >
							<div v-for="value in podsData" :key="value.name" class="col-md-3 col-sm-6 pod-btns-location">
								<button @click=get_resources_graphs(value.name,value.labels.env) class="pod-btn" :class="{ expanded: openedGraphs.includes(value.name) }">{{ value.name }}</button>
							</div>
						</div>
					</div>
					<div v-show="openedGraphs.length > 0" class="row justify-content-between" style="height: 250px;">
						<div class="col-md-4 col-sm-12">
							<!-- rps -->
							<iframe
								:src="resources.graphs.cpu"
								class="iframe-graphs"
								scrolling="No"
							/>
						</div>
						<div class="col-md-4 col-sm-12">
							<!-- memory -->
							<iframe
								:src="resources.graphs.memory"
								class="iframe-graphs"
								scrolling="No"
							/>
						</div>
						<div class="col-md-4 col-sm-12">
							<!-- net codes -->
							<iframe
								:src="resources.graphs.network"
								class="iframe-graphs"
								scrolling="No"
							/>
						</div>
					</div>
					<div align="center" v-show="openedGraphs.length > 0" style="padding: 1em 0 2em 0;">
						<a :href="resources.link" class="text-link" target="_blank">More info in Grafana</a>
					</div>
				</div>


				<!-- grafana graphs -->
				<div class="col-md-12">
					<h3 align="center">graphs</h3>
					<div v-if="sortedAggregates.length > 1">
						<h4	align="left">
							<form @change="selectGraphs(selectedTag) " >
								<select v-model="selectedTag">
									<option>
										__OVERALL__
									</option>
									<option v-for="tag in sortedAggregates" :key="tag.label">
										{{ tag.label }}
									</option>
								</select>
							</form>
						</h4>
					</div>
					<div class="row justify-content-between" style="height:300px;">
						<div class="col-md-6 col-sm-12">
							<!-- rps -->
							<iframe
								:src="job.graphs.rps"
								class="iframe-graphs"
								scrolling="No"
							/>
						</div>
						<div class="col-md-6 col-sm-12">
							<!-- net codes -->
							<iframe
								:src="job.graphs.quantiles"
								class="iframe-graphs"
								scrolling="No"
							/>
						</div>
					</div>
					<div class="row justify-content-between" style="height:300px;">
						<div class="col-md-6 col-sm-12">
							<!-- quantiles -->
							<iframe
								:src="job.graphs.netcodes"
								class="iframe-graphs"
								scrolling="No"
							/>
						</div>
						<div class="col-md-6 col-sm-12">
							<!-- tank threads -->
							<iframe
								:src="job.graphs.threads"
								class="iframe-graphs"
								scrolling="No"
							/>
						</div>
					</div>
				</div>

				<!-- summary stats -->
				<h3
					align="center"
					@click="toggleVisibility('isSummaryVisible')">
					Summary stats
				</h3>
				<div v-show="visibilities.isSummaryVisible" class="col-md-12">
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
									<td @click="toggleVisibility('overallCodeVisibility')" class="plus-table-label" :class="{ expanded: visibilities.overallCodeVisibility }">Overall
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
								<tr v-show="visibilities.overallCodeVisibility" v-for="aggregate in overallByCode" :key="aggregate.responseCode" class="hidden-rows">
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
					@click="toggleVisibility('isSummaryVisible')">
					Detailed stats
				</h4>
				<div v-show="visibilities.isSummaryVisible" class="col-md-12">
					<div class="row justify-content-between">
						<table id="StatsDetails" class="hover table table-bordered">
							<thead>
								<tr>
									<th @click="sort_aggregates('label')">label
										<div v-if="'label'=== currentSort" class="arrow-table-sort" :class="currentSortDir === 'asc' ? 'asc' : 'dsc'"/>
									</th>
									<th @click="sort_aggregates('okCount')">ok
										<div v-if="'okCount'=== currentSort" class="arrow-table-sort" :class="currentSortDir === 'asc' ? 'asc' : 'dsc'"/>
									</th>
									<th @click="sort_aggregates('errCount')">errors
										<div v-if="'errCount'=== currentSort" class="arrow-table-sort" :class="currentSortDir === 'asc' ? 'asc' : 'dsc'"/>
									</th>
									<th @click="sort_aggregates('q50')">q50, ms
										<div v-if="'q50'=== currentSort" class="arrow-table-sort" :class="currentSortDir === 'asc' ? 'asc' : 'dsc'"/>
									</th>
									<th @click="sort_aggregates('q75')">q75, ms
										<div v-if="'q75'=== currentSort" class="arrow-table-sort" :class="currentSortDir === 'asc' ? 'asc' : 'dsc'"/>
									</th>
									<th @click="sort_aggregates('q90')">q90, ms
										<div v-if="'q90'=== currentSort" class="arrow-table-sort" :class="currentSortDir === 'asc' ? 'asc' : 'dsc'"/>
									</th>
									<th @click="sort_aggregates('q95')">q95, ms
										<div v-if="'q95'=== currentSort" class="arrow-table-sort" :class="currentSortDir === 'asc' ? 'asc' : 'dsc'"/>
									</th>
									<th @click="sort_aggregates('q98')">q98, ms
										<div v-if="'q98'=== currentSort" class="arrow-table-sort" :class="currentSortDir === 'asc' ? 'asc' : 'dsc'"/>
									</th>
									<th @click="sort_aggregates('q99')">q99, ms
										<div v-if="'q99'=== currentSort" class="arrow-table-sort" :class="currentSortDir === 'asc' ? 'asc' : 'dsc'"/>
									</th>
								</tr>
							</thead>
							<tbody>
								<template v-for="tag in sortedAggregates" >
									<tr :key="tag.label">
										<td @click.stop="toggleResponseCodeVisibility(tag.label)" class="plus-table-label" :class="{ expanded: openedTag.includes(tag.label) }">{{ tag.label }}</td>
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
										<tr :key="code.responseCode" v-if="code.label === tag.label" class="hidden-rows">
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
<div>
</div>

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
				link: null,
			},
			collections: [],
			podsData: {},
			overall: {},
			tagged: [],
			overallByCode: [],
			taggedByCode: [],
			sortedTaggedByCode: [],
			openedTag: [],
			openedGraphs: [],
			loading: true,
			error: null,
			success: null,
			visibilities:{
				isSummaryVisible: true,
				editorVisibility: false,
				overallCodeVisibility: false,
				kubernetesInfoVisibility: false,
				collectionsListVisibility: false,
				resourcesVisibility: false,
			},
			podGraphsVisibility: false,
			currentSort: 'label',
			currentSortDir: 'asc',
			selectedTag: '__OVERALL__'
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
			this.toggleVisibility('editorVisibility');
		},
		deleteJob() {
			if (confirm('Удалить '+this.job.id+'?')) {
				this.$store.dispatch('job/deleteJob', this.job.id);
				this.$router.push('/');
			}
		},
		toggleVisibility: function(param) {
			this.visibilities[param] = !this.visibilities[param];
		},
		toggleResourcesVisibility: function() {
			this.toggleVisibility('resourcesVisibility');
			this.podsData = JSON.parse(this.job.environmentDetails);
		},
		toggleResponseCodeVisibility(name) {
			const index = this.openedTag.indexOf(name);

			if (index > -1) {
				this.openedTag.splice(index, 1);
			} else {
				this.openedTag.push(name);
			}
		},
		toggleGraphsVisibility(pod_button) {
			if (this.openedGraphs.includes(pod_button)) {
				this.openedGraphs.splice(pod_button);
			} else {
				this.openedGraphs = [];
				this.openedGraphs.push(pod_button);
			}
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
					this.collections = this.job.collections;
					this.selectGraphs(this.selectedTag);
					this.loading = false;
				});
		},
		selectGraphs: function(tag) {
			this.loading=true;
			if (tag === '__OVERALL__') {
				this.job.graphs.rps = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=2&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime + '&var-test_id=' + this.job.id;
				this.job.graphs.netcodes = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=4&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime + '&var-test_id=' + this.job.id;
				this.job.graphs.quantiles = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=8&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime + '&var-test_id=' + this.job.id;
				this.job.graphs.threads = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=6&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime + '&var-test_id=' + this.job.id;
			} else {
				this.job.graphs.rps = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=11&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime + '&var-test_id=' + this.job.id + '&var-tag=' + tag;
				this.job.graphs.netcodes = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=12&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime + '&var-test_id=' + this.job.id + '&var-tag=' + tag;
				this.job.graphs.quantiles = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=13&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime + '&var-test_id=' + this.job.id + '&var-tag=' + tag;
				this.job.graphs.threads = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=6&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime + '&var-test_id=' + this.job.id;
			}
			this.selectedTag=tag;
			this.loading=false;
		},
		get_test_aggregates: function(id) {
			let aggregatesKeys = ['okCount', 'errCount', 'q50', 'q75', 'q90', 'q95', 'q98', 'q99'];

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
							aggregatesKeys.forEach(
								aggKey => {
									if (!(aggKey in agg)) {
										agg[aggKey] = 0;
									} else {
										agg[aggKey] = parseInt(agg[aggKey]);
									}
								}
							);
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

		get_resources_graphs: function(name, env) {
			this.resources.graphs = {};
			if (isNaN(this.job.testStop)) {
				this.job.finishedTime = 'now';
			} else {
				this.job.finishedTime = this.job.testStop * 1000;
			}
			env = env.toUpperCase();
			this.resources.graphs.cpu = 'http://grafana.o3.ru/d-solo/WdGUX7vmk/pod?orgId=1&refresh=5s&var-datasource=%5B' + env + '%5D%20K8S%20Prometheus&var-Pod=' + name + '&var-phase=Failed&theme=light&panelId=17&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime;
			this.resources.graphs.memory = 'http://grafana.o3.ru/d-solo/WdGUX7vmk/pod?orgId=1&refresh=5s&var-datasource=%5B' + env + '%5D%20K8S%20Prometheus&var-Pod=' + name + '&var-phase=Failed&theme=light&panelId=25&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime;
			this.resources.graphs.network = 'http://grafana.o3.ru/d-solo/WdGUX7vmk/pod?orgId=1&refresh=5s&var-datasource=%5B' + env + '%5D%20K8S%20Prometheus&var-Pod=' + name + '&var-phase=Failed&theme=light&panelId=65&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime;
			this.resources.link = 'http://grafana.o3.ru/d/WdGUX7vmk/pod?orgId=1&refresh=5s&var-datasource=%5B' + env + '%5D%20K8S%20Prometheus&var-Pod=' + name + '&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime;
			this.toggleGraphsVisibility(name);
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

	.plus-table-label:after {
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

	.plus-table-label.expanded:after {
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

	.arrow-table-sort.asc{
		margin-left: 5px;
		display: inline-block;
		border-left: 7px solid transparent;
		border-right: 7px solid transparent;
		border-bottom: 8px solid #31b131;
	}

	.arrow-table-sort.dsc {
		margin-left: 5px;
		display: inline-block;
		border-left: 7px solid transparent;
		border-right: 7px solid transparent;
		border-top: 8px solid #31b131;
	}

	.resources-util-link {
		font-size: 18px;
		font-weight: bold;
		border-bottom: 1px black dotted;
		margin: 5px 0 0 18px;
		cursor:pointer;
	}

	.resources-graphs-arrow {
		display: inline-block;
		cursor: pointer;
		border: solid #000;
		border-width: 3px 0 0 3px;
		width: 12px;
		height: 12px;
		margin-left: 5px;
		transform: rotate(-135deg);
	}

	.resources-graphs-arrow.expanded {
		border-width: 0 3px 3px 0;
	}

	.pod-btn {
		background-color: #d1e7bc;
		border-radius: 5px;
		font-size: 13px;
		text-align: center;
		border: 1px solid black;
		box-shadow: 0 0 1px #444;
		cursor: pointer;
	}

	.pod-btn.expanded {
		background-color: #71875d;
		color: white;
		border-radius: 5px;
		font-size: 13px;
		text-align: center;
		border: 1px solid black;
		box-shadow: 0 0 3px #444;
		cursor: pointer;
	}

	.pod-btns-location {
		margin: 10px 0 15px 0;
		display: inline;
		float: left;
	}

	.hidden-rows {
		background-color: #F0EDED;
	}
	.iframe-graphs {
		width: 100%;
		height: 100%;
		overflow: hidden;
		border: none;
	}
	.text-link{
		text-decoration: underline;
	}

	select {
		background-color: white;
		border: thin solid black;
		display: inline-block;
		font-size: 14px;
		line-height: 1.5em;
		padding: 0.5em 3.5em 0.5em 1em;
}

	/*select.minimal {*/
		/*background-image:*/
			/*linear-gradient(45deg, transparent 50%, gray 50%),*/
			/*linear-gradient(135deg, gray 50%, transparent 50%),*/
			/*linear-gradient(to right, #ccc, #ccc);*/
		/*background-position:*/
			/*calc(100% - 20px) calc(1em + 2px),*/
			/*calc(100% - 15px) calc(1em + 2px),*/
			/*calc(100% - 2.5em) 0.5em;*/
		/*background-size:*/
		/*5px 5px,*/
		/*5px 5px,*/
		/*1px 1.5em;*/
		/*background-repeat: no-repeat;*/
/*}*/

</style>