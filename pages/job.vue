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

		<modal
			:title="'Resources utilization'"
			width="1500px"
			:modalIsVisible="visibilities.resourcesUtilization"
			@close="toggleVisibility('resourcesUtilization')"
		>
			<div slot="body">
				<resources-panel
					:content="podsData"
					:jobStart="job.testStart"
					:jobStop="job.testStop"/>
			</div>
		</modal>

		<modal
			:title="'Artifacts'"
			width="400px"
			:modalIsVisible="visibilities.artifactsVisibility"
			@close="toggleVisibility('artifactsVisibility')"
		>
			<div slot="body">
				<ul id="art">
					<li v-for="art in artifacts" :key="art.key">
						<span><a :href="art.path">{{ art.key }}</a></span>
					</li>
				</ul>
			</div>
		</modal>

		<v-container fluid v-if="loading">
			<v-layout justify-center row fill-height align-center>
				<v-progress-circular
					:size="150"
					:width="9"
					color="primary"
					indeterminate
				/>
			</v-layout>
		</v-container>

		<v-container fluid v-else>
			<v-layout>
				<v-flex xs9>
					<!-- graphs -->
					<v-toolbar dark color="primary">
						<v-toolbar-title>Graphs</v-toolbar-title>
						<v-spacer/>
					</v-toolbar>
					<v-flex md4 xs12 v-if="tagged.length > 1">
						<v-select
							color="cyan darken-1"
							v-model="selectedTag"
							:items="tags"
							label="Tags"
							@change="selectGraphs(selectedTag)"/>
					</v-flex>
					<v-layout alignSpaceAround justifySpaceAround row>
						<v-flex xs6 row>
							<!-- rps -->
							<v-flex>
								<graph :content="job.graphs.rps"/>
								<graph :content="job.graphs.netcodes"/>
							</v-flex>
						</v-flex>
						<v-flex xs6>
							<!-- net codes -->
							<v-flex xs12>
								<graph :content="job.graphs.quantiles"/>

								<graph :content="job.graphs.threads"/>
							</v-flex>
						</v-flex>
					</v-layout>

					<v-flex class="col-sm-vert-offset-1">
						<!-- summary stats -->
						<v-toolbar
							dark
							color="primary"
						>
							<v-toolbar-title>Summary stats</v-toolbar-title>
							<v-spacer/>
						</v-toolbar>
						<table-aggregates
							title="StatsOverall"
							:headers="aggregatesTableHeaders"
							:commonAggregates="overall"
							:detailedAggregates="overallByCode"
							:isOverall="true"/>
					</v-flex>
					<v-flex class="col-sm-vert-offset-1">
						<v-toolbar
							dark
							color="primary"
						>
							<v-toolbar-title>Detailed stats</v-toolbar-title>
							<v-spacer/>
						</v-toolbar>
						<table-aggregates
							title="DetailedStats"
							:headers="aggregatesTableHeaders"
							:commonAggregates="tagged"
							:detailedAggregates="taggedByCode"
							:isOverall="false"/>
					</v-flex>
				</v-flex>


				<v-flex
					xs3
					class="col-sm-offset-1 postition-relative"
				>
					<v-flex>
						<v-toolbar
							dark
							color="primary"
						>
							<v-toolbar-title>Test info #{{ job.id }}</v-toolbar-title>
							<v-spacer/>
						</v-toolbar>
						<!-- test info table -->
						<table-info
							:title="'Test #'+job.id"
							:headers="tableHeaders"
							:content="tableJob"
							:isCollection="false"
							@editItem="editItem"/>
					</v-flex>

					<v-flex class="col-sm-vert-offset-1">
						<!-- actions -->
						<v-flex>
							<!-- panel with editor buttons -->
							<v-btn
								v-show="job.status !== 'finished'"
								color="red darken-1"
								@click.once="stopTest"
								:disabled="job.status === 'stopped'"
							>
								<v-icon dark right>stop</v-icon>Stop test
							</v-btn>
							<v-btn
								color="warning"
								@click="deleteJob"
							>
								<v-icon dark left>delete_forever</v-icon>Delete job
							</v-btn>
							<v-btn
								v-if="job.collections"
								color="primary"
								@click="toggleVisibility('collectionsListVisibility')"
							>
								<v-icon dark left>view_list</v-icon>Collections
							</v-btn>
							<v-btn
								v-if="job.environmentDetails && job.environmentDetails !== 'null'"
								color="primary"
								@click="toggleVisibility('kubernetesInfoVisibility')"
							>
								<v-icon dark left>view_list</v-icon>k8s info
							</v-btn>
							<v-btn
								v-if="job.environmentDetails && job.environmentDetails !== 'null'"
								color="primary"
								@click="toggleVisibility('resourcesUtilization')"
							>
								<v-icon dark left>view_list</v-icon>Resources
							</v-btn>
							<v-btn
								v-if="artifacts"
								color="primary"
								@click="toggleVisibility('artifactsVisibility')"
							>
								<v-icon dark left>cloud_download</v-icon>Artifacts
							</v-btn>
						</v-flex>
					</v-flex>

				</v-flex>
			</v-layout>
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
import AppHeader from '../components/AppHeader';
import Accordeon from '../components/Accordeon';

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
			tableJob: [],
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
			selectedTag: 'Overall',
			tags: [],
			error: null,
			success: null,
			visibilities:{
				editorVisibility: false,
				kubernetesInfoVisibility: false,
				collectionsListVisibility: false,
				resourcesUtilization: false,
				artifactsVisibility: false,
			},
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
	components: {
		Accordeon,
		Modal,
		TableInfo,
		TableAggregates,
		Graph,
		AppHeader,
		ResourcesPanel,
	},
	created() {
		this.test_id = this.$route.query.id;
	},
	mounted() {
		this.refresh();
	},
	methods: {
		async refresh() {
			await this.getTestInfo(this.test_id);
			if (this.job.status === 'finished') {
				await this.getArtifacts(this.test_id);
				await this.getTestAggregates(this.test_id);
				if (Object.keys(this.overall).length === 0) {
					setTimeout(this.refresh, 5000);
				}
			} else {
				setTimeout(this.refresh, 5000);
			}
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
					//fix this
					if (this.tableJob.length !== 0) {
						this.tableJob.length = 0;
					}
					this.tableJob.push(this.job);
					this.job.graphs = {};
					if (isNaN(this.job.testStop)) {
						this.job.finishedTime = 'now';
					} else {
						this.job.finishedTime = this.job.testStop * 1000;
					}
					this.collections = this.job.collections;
					this.selectGraphs(this.selectedTag);
					this.parseKubernetesInfo();
					this.loading = false;
				});
		},
		parseKubernetesInfo() {
			if (this.job.environmentDetails && this.job.environmentDetails !== 'null') {
				this.podsData = JSON.parse(this.job.environmentDetails);
			}
		},
		selectGraphs: function(tag) {
			this.loading=true;
			if (tag === 'Overall') {
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
					this.tags.push('Overall');
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
	.col-sm-offset-1{
		margin-left: 1em;
	}
	.col-sm-vert-offset-1{
		margin-top: 1em;
	}
	.postition-relative{
		position: fixed;
		right:0.5%;
		overflow-y: scroll;
		max-height: 85%;
	}
</style>