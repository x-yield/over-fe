<template>
	<div id="overload">
		<template>
			<app-header/>
		</template>
		<modal v-show="visibilities.editorVisibility" @close="toggleVisibility('editorVisibility')">
			<h3 slot="header">Редактирование теста {{ job.id }}</h3>
			<h3 slot="body">
				<div class="overload-fe-container job-editor">
					<Container fluid>
						<Row>
							<Column>
								<Input
									label="Author"
									v-model="jobUpdateBuffer.author"
								/>
							</Column>
						</Row>
						<Row>
							<Column>
								<Input
									label="Description"
									v-model="jobUpdateBuffer.description"
								/>
							</Column>
						</Row>
						<Row>
							<Column>
								<Input
									label="Status"
									v-model="jobUpdateBuffer.status"
								/>
							</Column>
						</Row>
						<Row>
							<Column>
								<Input
									label="Tank"
									v-model="jobUpdateBuffer.tank"
								/>
							</Column>
						</Row>
						<Row>
							<Column>
								<Input
									label="Target"
									v-model="jobUpdateBuffer.target"
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
		<v-container fluid>
			<div v-if="loading">
				<h3 align="center">Loading...</h3>
			</div>
			<div v-else>
				<v-layout class="row justify-content-end">
					<!-- panel with editor buttons -->
					<panel-item
						:status="job.status"
						:hasCollections="job.collections !== null"
						@toggleModalVisibility="toggleVisibility($event)"
					/>
				</v-layout>
				<!-- test id table -->
				<table-info :title="'Test #'+job.id" :headers="tableHeaders" :content="job" :isCollection="false"/>

				<!-- Artifacts accordeon-->
				<accordeon
					v-if="artifacts.length"
					title="artifacts"
					:isVisible="visibilities.artifactsVisibility"
					@toggleAccordeonVisibility="toggleArtifactsVisibility"/>

				<div v-show="visibilities.artifactsVisibility">
					<div class="col-md-12 col-sm-12" style="padding-left: 2em;">
						<table class="table table-sm" id="artifactsTable" v-for="a in artifacts" :key="a.id">
							<span><a :href="a.path">{{ a.key }}</a></span><br/>
						</table>
					</div>
				</div>
				<!-- Resources accordeon -->
				<accordeon
					v-if="job.environmentDetails && job.environmentDetails !== 'null'"
					title="resources utilization"
					:isVisible="visibilities.resourcesVisibility"
					@toggleAccordeonVisibility="toggleResourcesVisibility"/>

				<!-- grafana graphs for resources -->
				<div v-show="visibilities.resourcesVisibility">
					<resources-panel
						:content="podsData"
						:jobStart="job.testStart"
						:jobStop="job.testStop"/>
				</div>

				<!--<v-layout>-->
					<!--<v-card-title>Graphs</v-card-title>-->
					<!--<v-flex class="xs-12 sm-6">-->
						<!--&lt;!&ndash;<div v-if="sortedAggregates.length > 1">&ndash;&gt;-->
							<!--&lt;!&ndash;<h4	align="left">&ndash;&gt;-->
								<!--&lt;!&ndash;<form @change="selectGraphs(selectedTag) " >&ndash;&gt;-->
									<!--&lt;!&ndash;<select v-model="selectedTag">&ndash;&gt;-->
										<!--&lt;!&ndash;<option>__OVERALL__</option>&ndash;&gt;-->
										<!--&lt;!&ndash;<option v-for="tag in sortedAggregates" :key="tag.label">&ndash;&gt;-->
											<!--&lt;!&ndash;{{ tag.label }}&ndash;&gt;-->
										<!--&lt;!&ndash;</option>&ndash;&gt;-->
									<!--&lt;!&ndash;</select>&ndash;&gt;-->
								<!--&lt;!&ndash;</form>&ndash;&gt;-->
							<!--&lt;!&ndash;</h4>&ndash;&gt;-->
						<!--&lt;!&ndash;</div>&ndash;&gt;-->
						<!--&lt;!&ndash; grafana graphs &ndash;&gt;-->
						<!--<div class="row justify-content-between" style="height:300px;">-->
							<!--<div class="col-md-6 col-sm-12">-->
								<!--&lt;!&ndash; rps &ndash;&gt;-->
								<!--<graph :content="job.graphs.rps"/>-->
							<!--</div>-->
							<!--<div class="col-md-6 col-sm-12">-->
								<!--&lt;!&ndash; net codes &ndash;&gt;-->
								<!--<graph :content="job.graphs.netcodes"/>-->
							<!--</div>-->
						<!--</div>-->
						<!--<div class="row justify-content-between" style="height:300px;">-->
							<!--<div class="col-md-6 col-sm-12">-->
								<!--&lt;!&ndash; quantiles &ndash;&gt;-->
								<!--<graph :content="job.graphs.quantiles"/>-->
							<!--</div>-->
							<!--<div class="col-md-6 col-sm-12">-->
								<!--&lt;!&ndash; tank threads &ndash;&gt;-->
								<!--<graph :content="job.graphs.threads"/>-->
							<!--</div>-->
						<!--</div>-->
					<!--</v-flex>-->
				<!--</v-layout>-->

				<v-layout>
					<!-- summary stats -->
					<h3 align="center">Summary stats</h3>
					<div class="align-center justify-space-between row fill-height">
						<table-aggregates
							title="StatsOverall"
							:headers="aggregatesTableHeaders"
							:commonAggregates="overall"
							:detailedAggregates="overallByCode"
							:isOverall="true"/>
					</div>
					<h4 align="center">Detailed stats</h4>
					<div class="align-center justify-space-between row fill-height">
						<table-aggregates
							title="DetailedStats"
							:headers="aggregatesTableHeaders"
							:commonAggregates="sortedAggregates"
							:detailedAggregates="taggedByCode"
							@sortAggregates="sortAggregates($event)"
							:currentSort="currentSort"
							:currentSortDir="currentSortDir"
							:isOverall="false"/>
					</div>
				</v-layout>
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
import Button from '@ozonui/custom-button';
import PanelItem from '../components/PanelItem';
import Accordeon from '../components/Accordeon';
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
		Accordeon,
		Modal,
		Button,
		Input,
		Select,
		Option,
		TableInfo,
		TableAggregates,
		Graph,
		AppHeader,
		ResourcesPanel,
		PanelItem,
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
		updateJob() {
			this.$store.dispatch('job/updateJob', this._dataToUpdate());
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
		toggleArtifactsVisibility: function() {
			this.toggleVisibility('artifactsVisibility');
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
				this.job.graphs.rps = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=11&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime + '&var-test_id=' + this.job.id + '&var-tag=' + tag;
				this.job.graphs.quantiles = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=12&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime + '&var-test_id=' + this.job.id + '&var-tag=' + tag;
				this.job.graphs.netcodes = 'http://grafana.o3.ru/d-solo/gM7Iqapik/tank-universal-dashboard?orgId=1&theme=light&refresh=5s&panelId=13&from=' + this.job.testStart * 1000 + '&to=' + this.job.finishedTime + '&var-test_id=' + this.job.id + '&var-tag=' + tag;
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
		_dataToUpdate: function() {
			// возвращает разницу между джобой и обновленными данными, которые хранятся в jobUpdateBuffer
			let buffer = {id: this.job.id};

			for (let k in this.jobUpdateBuffer) {
				if (this.jobUpdateBuffer.hasOwnProperty(k)) {
					if (JSON.stringify(this.job[k]) !== JSON.stringify(this.jobUpdateBuffer[k])) {
						this.job[k] = this.jobUpdateBuffer[k];
						buffer[k] = this.jobUpdateBuffer[k];
					}
				}
			}
			return buffer;
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