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
						<a class="navbar-brand" href="/joints">Joints</a>
					</div>
					<!-- Основная часть меню (может содержать ссылки, формы и другие элементы) -->
					<div class="collapse navbar-collapse" id="navbar-main">
						<ul class="nav navbar-nav">
							<li class="active"><a href="/">Last joints</a></li>
						</ul>
					</div>
				</div>
			</nav>

			<div v-if="loading">
				<h3 align="center">Loading...</h3>
			</div>
			<div v-else>
				<!-- test id table -->
				<div>
					<h4 align="center">Joint id#{{ joint.id }}</h4>
				</div>
				<div class="col-md-12">
					<table class="table table-sm table-hover">
						<tbody>
							<tr>
								<td align="center">Id</td>
								<td align="center">{{ joint.id }}</td>
							</tr>
							<tr>
								<td align="center">Tests</td>
								<td align="center">
									<a :href='"/job?id="+job.id' v-for="job in joint.jobs" :key="job.id">
										{{ job.id }}
									</a>
								</td>
							</tr>
							<tr>
								<td align="center">Name</td>
								<td align="center">{{ joint.name }}</td>
							</tr>
						</tbody>
					</table>
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
								:src="joint.graphs.rps"
								class="iframe-graphs"
								scrolling="No"
							/>
						</div>
						<div class="col-md-6 col-sm-12">
							<!-- net codes -->
							<iframe
								:src="joint.graphs.quantiles"
								class="iframe-graphs"
								scrolling="No"
							/>
						</div>
					</div>
					<div class="row justify-content-between" style="height:300px;">
						<div class="col-md-6 col-sm-12">
							<!-- quantiles -->
							<iframe
								:src="joint.graphs.netcodes"
								class="iframe-graphs"
								scrolling="No"
							/>
						</div>
						<div class="col-md-6 col-sm-12">
							<!-- tank threads -->
							<iframe
								:src="joint.graphs.threads"
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
			jobUpdateBuffer: {},
			artifacts: [],
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
				artifactsVisibility: false,
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
		this.refresh();
	},
	methods: {
		async refresh() {
			await this.get_joint_info(this.test_id);
		},
		toggleVisibility: function(param) {
			this.visibilities[param] = !this.visibilities[param];
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
		get_joint_info: function(id) {
			return this.$api.get('/joint/' + id)
				.then(response => {
					return response[0].data.joint;
				})
				.then(joint_json => {
					if (!joint_json) {
						this.loading = false;
						return;
					}
					joint_json['job_ids'] = [];
					joint_json['job_starts'] = [];
					joint_json['job_stops'] = [];
					joint_json['jobs'].forEach(function(item) {
						joint_json['job_ids'].push(item.id);
						joint_json['job_starts'].push(item.testStart);
						joint_json['job_stops'].push(item.testStop);
					});
					joint_json['max_stop'] = Math.max(...joint_json['job_stops']);
					joint_json['min_start'] = Math.min(...joint_json['job_starts']);
					this.joint = joint_json;
					this.joint.graphs = {};
					this.selectGraphs(this.selectedTag);
					this.loading = false;
				});
		},
		selectGraphs: function(tag) {
			this.loading=true;
			if (tag === '__OVERALL__') {
				this.joint.graphs.rps = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=2&from=' + this.joint.min_start * 1000 + '&to=' + this.joint.max_stop * 1000 + '&var-test_id=' + this.joint.job_ids.join('&var-test_id=');
				this.joint.graphs.netcodes = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=4&from=' + this.joint.min_start * 1000 + '&to=' + this.joint.max_stop * 1000 + '&var-test_id=' + this.joint.job_ids.join('&var-test_id=');
				this.joint.graphs.quantiles = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=8&from=' + this.joint.min_start * 1000 + '&to=' + this.joint.max_stop * 1000 + '&var-test_id=' + this.joint.job_ids.join('&var-test_id=');
				this.joint.graphs.threads = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=6&from=' + this.joint.min_start * 1000 + '&to=' + this.joint.max_stop * 1000 + '&var-test_id=' + this.joint.job_ids.join('&var-test_id=');
			} else {
				this.joint.graphs.rps = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=11&from=' + this.joint.min_start * 1000 + '&to=' + this.joint.max_stop * 1000 + '&var-test_id=' + this.joint.job_ids.join('&var-test_id=') + '&var-tag=' + tag;
				this.joint.graphs.quantiles = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=12&from=' + this.joint.min_start * 1000 + '&to=' + this.joint.max_stop * 1000 + '&var-test_id=' + this.joint.job_ids.join('&var-test_id=') + '&var-tag=' + tag;
				this.joint.graphs.netcodes = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=13&from=' + this.joint.min_start * 1000 + '&to=' + this.joint.max_stop * 1000 + '&var-test_id=' + this.joint.job_ids.join('&var-test_id=') + '&var-tag=' + tag;
				this.joint.graphs.threads = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=6&from=' + this.joint.min_start * 1000 + '&to=' + this.joint.max_stop * 1000 + '&var-test_id=' + this.joint.job_ids.join('&var-test_id=');
			}
			this.selectedTag=tag;
			this.loading=false;
		},
		get_test_aggregates: function(id) {
			let aggregatesKeys = ['okCount', 'errCount', 'q50', 'q75', 'q90', 'q95', 'q98', 'q99'];

			return this.$api.get('/aggregates/' + id)
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
				if (a[this.currentSort] > b[this.currentSort]) {return modifier;}
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

	.hidden-rows {
		background-color: #F0EDED;
	}
	.iframe-graphs {
		width: 100%;
		height: 100%;
		overflow: hidden;
		border: none;
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