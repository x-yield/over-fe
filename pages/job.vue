<template>
	<div id="overload">
		<template>
			<app-header/>
		</template>

		<modal
			:title="'Редактирование теста '+job.id"
			width="400px"
			:modalIsVisible="visibilities.editorVisibility"
			:isEditor="true"
			@saveEditedInfo="updateJob(editedItemKey, editedItem)"
			@close="toggleVisibility('editorVisibility')">
			<div slot="body">
				<v-text-field v-model="editedItem" :label="editedItemLabel"/>
			</div>
		</modal>

		<modal
			:title="'Данные о '+job.target+'из Kubernetes'"
			width="1200px"
			:modalIsVisible="visibilities.kubernetesInfoVisibility"
			:isEditor="false"
			@close="toggleVisibility('kubernetesInfoVisibility')">
			<div slot="body">
				<pre>{{ job.environmentDetails }}</pre>
			</div>
		</modal>

		<modal
			:title="'Список коллекций для теста #'+job.id"
			width="400px"
			:modalIsVisible="visibilities.collectionsListVisibility"
			@close="toggleVisibility('collectionsListVisibility')">
			<div slot="body">
				<div v-for="(collection) in collections" :key="collection.id">
					<a :href='"/collection?id="+collection.id' class="text-link">
						{{ collection.env + ' -> ' + collection.project + ' -> ' + collection.name }}
					</a>
				</div>
			</div>
		</modal>

		<v-container fluid>
			<div v-if="loading">
				<h3 align="center">Loading...</h3>
			</div>
			<div v-else>
				<v-layout class="row justify-content-end">
					<!-- panel with editor buttons -->
					<v-btn
						v-show="job.status !== 'finished'"
						color="red darken-1"
						@click.once="stopTest"
						:disabled="job.status === 'stopped'">Stop test</v-btn>
					<v-btn
						v-if="job.collections"
						color="green"
						@click="toggleVisibility('collectionsListVisibility')">View collections</v-btn>
					<v-btn
						v-if="job.environmentDetails && job.environmentDetails !== 'null'"
						color="primary"
						@click="toggleVisibility('kubernetesInfoVisibility')">View Kubernetes info</v-btn>
					<v-btn color="warning" @click="deleteJob">Delete job</v-btn>
				</v-layout>
				<!-- test id table -->
				<table-info
					:title="'Test #'+job.id"
					:headers="tableHeaders"
					:content="myJob"
					:isCollection="false"
					@editItem="editItem"/>

				<!-- Artifacts btn-->

				<v-expansion-panel v-if="artifacts.length">
					<v-expansion-panel-content>
						<template slot="header">
							<div align="center">artifacts</div>
						</template>
						<v-card>
							<div class="col-md-12 col-sm-12" style="padding-left: 2em;">
								<table class="table table-sm" id="artifactsTable" v-for="a in artifacts" :key="a.id">
									<span><a :href="a.path">{{ a.key }}</a></span><br/>
								</table>
							</div>
						</v-card>
					</v-expansion-panel-content>
				</v-expansion-panel>

				<!-- grafana graphs for resources -->
				<div v-if="job.environmentDetails && job.environmentDetails !== 'null'" align="center">
					<resources-panel
						:content="podsData"
						:jobStart="job.testStart"
						:jobStop="job.testStop"/>
				</div>

				<h2 align="center">Graphs</h2>
				<v-menu v-if="sortedAggregates.length > 1" class="offset-y full-width" align="center">
					<template slot="activator">
						<v-btn color="light-green lighten-1">__OVERALL__</v-btn>
					</template>
					<v-list>
						<v-list-tile
							v-for="tag in sortedAggregates"
							:key="tag.label"
							@click="selectGraphs(tag.label)" >
							<v-list-tile-title>{{ tag.label }}</v-list-tile-title>
						</v-list-tile>
					</v-list>
				</v-menu>
				<v-flex class="row justify-content-center">
					<v-flex class="md6 sm12">
						<!-- rps -->
						<graph :content="job.graphs.rps"/>
					</v-flex>
					<v-flex class="md6 sm12">
						<!-- net codes -->
						<graph :content="job.graphs.netcodes"/>
					</v-flex>
				</v-flex>
				<v-flex class="row justify-content-center">
					<!-- quantiles -->
					<v-flex class="md6 sm12">
						<graph :content="job.graphs.quantiles"/>
					</v-flex>
					<!-- tank threads -->
					<v-flex class="md6 sm12">
						<graph :content="job.graphs.threads"/>
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
						:commonAggregates="sortedAggregates"
						:detailedAggregates="taggedByCode"
						@sortAggregates="sortAggregates($event)"
						:currentSort="currentSort"
						:currentSortDir="currentSortDir"
						:isOverall="false"/>
				</v-flex>
			</div>
		</v-container>
	</div>
</template>
<div>
</div>

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
			myJob: [],
			editedItem: null,
			editedItemLabel: null,
			editedItemKey: null,
			jobUpdateBuffer: {},
			artifacts: [],
			collections: [],
			podsData: {},
			overall: [],
			tagged: [],
			overallByCode: [],
			taggedByCode: [],
			loading: true,
			error: null,
			success: null,
			currentSort: 'label',
			currentSortDir: 'asc',
			visibilities:{
				editorVisibility: false,
				kubernetesInfoVisibility: false,
				collectionsListVisibility: false,
				resourcesVisibility: false,
				artifactsVisibility: false,
			},
			selectedTag: '__OVERALL__',
			tableHeaders: {
				'Author': 'author',
				'Status': 'status',
				'Test start': 'testStart',
				'Test stop': 'testStop',
				'Target': 'target',
				'Description': 'description',
				'Autostop time': 'autostopTime',
				'Autostop reason': 'autostopMessage',
				'Imbalance': 'imbalance'
			},
			aggregatesTableHeaders: {
				'label': 'label',
				'ok':'okCount',
				'errors':'errCount',
				'q50, ms':'q50',
				'q75, ms':'q75',
				'q90, ms':'q90',
				'q95, ms':'q95',
				'q98, ms':'q98',
				'q99, ms':'q99'
			}
		};
	},
	head: {
		title: 'Overload - нагрузочные тесты',
	},
	components: {
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
		// this.refresh();
		this.getTestInfo(this.test_id);
		this.getArtifacts(this.test_id);
		this.getTestAggregates(this.test_id);
	},
	methods: {
		// async refresh() {
		// 	await this.getTestInfo(this.test_id);
		// 	if (this.job.status === 'finished') {
		// 		await this.getArtifacts(this.test_id);
		// 		await this.getTestAggregates(this.test_id);
		// 		if (Object.keys(this.overall).length === 0) {
		// 			setTimeout(this.refresh, 5000);
		// 		}
		// 	} else {
		// 		setTimeout(this.refresh, 5000);
		// 	}
		// },
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
		toggleResourcesVisibility: function() {
			this.toggleVisibility('resourcesVisibility');
			this.podsData = JSON.parse(this.job.environmentDetails);
		},
		getTestInfo: function(id) {
			return this.$api.get('/job/' + id)
				.then(response => {
					return response[0].data.job;
				})
				.then(job_json => {
					if (!job_json) {
						return;
					}
					this.job = job_json;
					this.myJob.push(this.job);
					// клонируем объект. jobUpdateBuffer нужен чтобы отслеживать изменения при редактировании
					this.jobUpdateBuffer = JSON.parse(JSON.stringify(this.job));
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
				this.job.graphs.rps = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=11&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime + '&var-test_id=' + this.job.id + '&var-tag=' + encodeURIComponent(tag);
				this.job.graphs.quantiles = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=12&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime + '&var-test_id=' + this.job.id + '&var-tag=' + encodeURIComponent(tag);
				this.job.graphs.netcodes = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=13&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime + '&var-test_id=' + this.job.id + '&var-tag=' + encodeURIComponent(tag);
				this.job.graphs.threads = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=6&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime + '&var-test_id=' + this.job.id;
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
		sortAggregates: function(s) {
			if (s === this.currentSort) {
				this.currentSortDir = this.currentSortDir === 'asc' ? 'dsc' : 'asc';
			}
			this.currentSort = s;
		},
		stopTest: function() {
			this.jobUpdateBuffer.status = 'stopped';
			this.updateJob();
		},
		editItem: function(jobParamHeader, jobParamKey, jobParamValue) {
			this.toggleVisibility('editorVisibility');
			this.editedItem = jobParamValue;
			this.editedItemLabel = jobParamHeader;
			this.editedItemKey = jobParamKey;
		}
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
</style>