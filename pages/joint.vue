<template>
	<div id="overload">
		<template>
			<app-header/>
		</template>

		<v-container fluid>
			<div v-if="loading">
				<h3 align="center">Loading...</h3>
			</div>

			<div v-else>
				<table-info
					:title="'Joint id#'+ joint.id"
					:headers="tableHeaders"
					:content="tableJoint"
					:isCollection="true"
					@editItem="'doNothingYet'">
					<tr slot="extra-link">
						<td align=center class="body-2 font-weight-bold">Tests</td>
						<td align=center class="body-2">
							<a :href='"/job?id="+job.id' v-for="job in tableJoint[0].jobs" :key="job.id" class="mr-2">
								{{ job.id }}
							</a>
						</td>
					</tr>
				</table-info>

				<h2 align="center">Graphs</h2>
				<v-flex class="row justify-content-between pl-3">
					<v-flex class="md6 sm12 pr-2">
						<!-- rps -->
						<graph :content="joint.graphs.rps"/>
					</v-flex>
					<v-flex class="md6 sm12">
						<!-- net codes -->
						<graph :content="joint.graphs.netcodes"/>
					</v-flex>
				</v-flex>
				<v-flex class="row justify-content-center pl-3">
					<!-- quantiles -->
					<v-flex class="md6 sm12 pr-2">
						<graph :content="joint.graphs.quantiles"/>
					</v-flex>
					<!-- tank threads -->
					<v-flex class="md6 sm12">
						<graph :content="joint.graphs.threads"/>
					</v-flex>
				</v-flex>
				<v-flex>
					<!-- summary stats -->
					<h2 align="center">Summary stats</h2>
					<table-aggregates
						title="StatsOverall"
						:headers="aggregatesTableHeaders"
						:commonAggregates="overall"
						:detailedAggregates="overallByCode"
						:isOverall="true"/>
					<h3 align="center">Detailed stats</h3>
					<table-aggregates
						title="DetailedStats"
						:headers="aggregatesTableHeaders"
						:commonAggregates="tagged"
						:detailedAggregates="taggedByCode"
						:isOverall="false"/>
				</v-flex>
			</div>
		</v-container>
	</div>
</template>

<script>
import Modal from '../components/Modal';
import TableInfo from '../components/TableInfo';
import TableAggregates from '../components/TableAggregates';
import Graph from '../components/Graph';
import ResourcesPanel from '../components/ResourcesPanel';
import Layout from '@ozonui/layout';
import '@ozonui/layout/src/grid.css';
import Input from '@ozonui/form-input';
import FormSelect from '@ozonui/form-select';
import AppHeader from '../components/AppHeader';
import Accordeon from '../components/Accordeon';

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
			tableJoint: [],
			editedItem: null,
			editedItemLabel: null,
			editedItemKey: null,
			artifacts: [],
			collections: [],
			podsData: {},
			overall: [],
			tagged: [],
			overallByCode: [],
			taggedByCode: [],
			loading: true,
			tag: '',
			tags: [],
			error: null,
			success: null,
			visibilities:{
				editorVisibility: false,
				kubernetesInfoVisibility: false,
				collectionsListVisibility: false,
			},
			selectedTag: '__OVERALL__',
			tableHeaders:
				{
					'Id': 'id',
					'Name': 'name',
				},
			aggregatesTableHeaders: [
				{text: 'label', align: 'center', value: 'label'},
				{text: 'ok', align: 'center', value: 'okCount'},
				{text: 'errors', align: 'center', value: 'errCount'},
				{text: 'q50, ms', align: 'center', value: 'q50'},
				{text: 'q75, ms', align: 'center', value: 'q75'},
				{text: 'q90, ms', align: 'center', value: 'q90'},
				{text: 'q95, ms', align: 'center', value: 'q95'},
				{text: 'q98, ms', align: 'center', value: 'q98'},
				{text: 'q99, ms', align: 'center', value: 'q99'}],
		};
	},
	head: {
		title: 'Overload - нагрузочные тесты',
	},
	components: {
		Accordeon,
		Modal,
		Input,
		Select,
		Option,
		TableInfo,
		TableAggregates,
		Graph,
		AppHeader,
		ResourcesPanel,
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
			await this.getJointInfo(this.test_id);
		},
		updateJob(key, value) {
			let buffer = {id: this.job.id};

			buffer[key] = value;
			this.$store.dispatch('job/updateJob', buffer);
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
		getJointInfo: function(id) {
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
					this.tableJoint.push(joint_json);
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
		getTestAggregates: function(id) {
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
								this.overall.push(agg);
							} if (agg.label !== '__OVERALL__' && agg.responseCode === '__OVERALL__') {
								this.tagged.push(agg);
							} if (agg.label === '__OVERALL__' && agg.responseCode !== '__OVERALL__') {
								this.overallByCode.push(agg);
							} if (agg.label !== '__OVERALL__' && agg.responseCode !== '__OVERALL__') {
								this.taggedByCode.push(agg);
							}
						}
					);
					this.tagged.forEach(
						item => {
							if (this.tags.indexOf(item.label) === -1) {
								this.tags.push(item.label);
							}
						}
					);
				});
		},
		getArtifacts: function(id) {
			return this.$api.get('/list_artifacts/' + id)
				.then(response => {
					return response[0].data.artifacts;
				})
				.then(json => {
					if (!json) {
						return;
					}
					this.artifacts = json;

					// сортируем по имени
					function compare(a, b) {
						if (a.key < b.key) { return -1; }
						if (a.key > b.key) { return 1; }
						return 0;
					}
					this.artifacts.sort(compare);
				});
		},
		stopTest: function() {
			this.updateJob('status', 'stopped');
		},
		editItem: function(jobParamHeader, jobParamKey, jobParamValue) {
			this.toggleVisibility('editorVisibility');
			this.editedItem = jobParamValue;
			this.editedItemLabel = jobParamHeader;
			this.editedItemKey = jobParamKey;
		},
	},
};
</script>


<style scoped>
</style>