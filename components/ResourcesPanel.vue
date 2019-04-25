<template>
	<v-card>
		<accordeon title="Select pod from list">
			{{ content }}
			<div slot="body">
				<v-tabs fixedTabs color="grey lighten-4">
					<v-tab
						v-for="value in content"
						:key="value.name"
						@click="getResourcesGraphs(value.name,value.labels.env)" >
						{{ value.name }}
					</v-tab>
				</v-tabs>
			</div>
		</accordeon>
		<v-flex v-show="openedGraphs.length > 0" class="justify-content-between pr-2 pl-4 pt-2">
			<v-flex xs12>
				<!-- cpu -->
				<graph :content="resources.graphs.cpu"/>
			</v-flex>
			<v-flex xs12>
				<!-- memory -->
				<graph :content="resources.graphs.memory"/>
			</v-flex>
			<v-flex xs12>
				<!-- net codes -->
				<graph :content="resources.graphs.network"/>
			</v-flex>
		</v-flex>
		<div align="center" v-show="openedGraphs.length > 0" style="padding-bottom: 1em">
			<a :href="resources.link" class="text-link" target="_blank">More info in Grafana</a>
		</div>
	</v-card>
</template>

<script>
import Graph from '../components/Graph';
import Accordeon from '../components/Accordeon';

export default {
	name: 'ResourcesPanel',
	components: {
		Graph,
		Accordeon
	},
	props: {
		title: {
			type: String,
			default: '',
		},
		content: {
			type: Object,
			default: null,
		},
		jobStart: {
			type: Number,
			default: null
		},
		jobStop: {
			type: Number,
			default: null
		}
	},
	data() {
		return {
			openedGraphs: [],
			resources: {
				graphs: {
					cpu: null,
					memory: null,
					network: null,
				},
				link: null,
			},
			jobFinishedTime: null,
		};
	},
	methods: {
		getResourcesGraphs: function(name, env) {
			this.resources.graphs = {};
			if (isNaN(this.jobStop)) {
				this.jobFinishedTime = 'now';
			} else {
				this.jobFinishedTime = this.jobStop * 1000;
			}
			env = env.toUpperCase();
			this.resources.graphs.cpu = 'http://grafana.o3.ru/d-solo/WdGUX7vmk/pod?orgId=1&refresh=5s&var-datasource=%5B' + env + '%5D%20K8S%20Prometheus&var-Pod=' + name + '&var-phase=Failed&theme=light&panelId=17&from=' + this.jobStart * 1000 + '&to=' + this.jobFinishedTime;
			this.resources.graphs.memory = 'http://grafana.o3.ru/d-solo/WdGUX7vmk/pod?orgId=1&refresh=5s&var-datasource=%5B' + env + '%5D%20K8S%20Prometheus&var-Pod=' + name + '&var-phase=Failed&theme=light&panelId=25&from=' + this.jobStart * 1000 + '&to=' + this.jobFinishedTime;
			this.resources.graphs.network = 'http://grafana.o3.ru/d-solo/WdGUX7vmk/pod?orgId=1&refresh=5s&var-datasource=%5B' + env + '%5D%20K8S%20Prometheus&var-Pod=' + name + '&var-phase=Failed&theme=light&panelId=65&from=' + this.jobStart * 1000 + '&to=' + this.jobFinishedTime;
			this.resources.link = 'http://grafana.o3.ru/d/WdGUX7vmk/pod?orgId=1&refresh=5s&var-datasource=%5B' + env + '%5D%20K8S%20Prometheus&var-Pod=' + name + '&from=' + this.jobStart * 1000 + '&to=' + this.jobFinishedTime;
			this.toggleGraphsVisibility(name);
		},
		toggleGraphsVisibility(pod_button) {
			if (this.openedGraphs.includes(pod_button)) {
				this.openedGraphs.splice(pod_button);
			} else {
				this.openedGraphs = [];
				this.openedGraphs.push(pod_button);
			}
		},
	}
};
</script>

<style scoped>
</style>