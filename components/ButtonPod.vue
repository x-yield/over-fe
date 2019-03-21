<template>
	<div>
		<div v-for="value in content" :key="value.name" class="col-md-3 col-sm-6 pod-btns-location">
			<button
				@click=getResourcesGraphs(value.name,value.labels.env)
				class="pod-btn"
				:class="{ expanded: openedGraphs.includes(value.name) }">
				{{ value.name }}
			</button>
		</div>
		<div v-show="openedGraphs.length > 0" class="row justify-content-between" style="height: 250px;">
			<div class="col-md-4 col-sm-12">
				<!-- cpu -->
				<graph :content="resources.graphs.cpu"/>
			</div>
			<div class="col-md-4 col-sm-12">
				<!-- memory -->
				<graph :content="resources.graphs.memory"/>
			</div>
			<div class="col-md-4 col-sm-12">
				<!-- net codes -->
				<graph :content="resources.graphs.network"/>
			</div>
		</div>
		<div align="center" v-show="openedGraphs.length > 0" style="padding: 1em 0 2em 0;">
			<a :href="resources.link" class="text-link" target="_blank">More info in Grafana</a>
		</div>
	</div>
</template>

<script>
import Graph from '../components/Graph';

export default {
	name: 'ButtonPod',
	components: {
		Graph
	},
	props: {
		content: {
			type: Object,
			default: null,
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
		};
	},
	methods: {
		getResourcesGraphs: function(name, env) {
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
	}
};
</script>

<style scoped>
	.pod-btn {
		background: linear-gradient(to bottom, #d3f8ab, #7d9f5e);
		border-radius: 7px;
		font-size: 13px;
		text-align: center;
		border: 1px solid #7d9f5e;
		cursor: pointer;
	}

	.pod-btn.expanded {
		background: linear-gradient(to top, #7d9f5e, #486934);
		border: 1px solid #486934;
		color: white;
		box-shadow: 0 0 3px #444;
	}

	.pod-btns-location {
		margin: 10px 0 15px 0;
		display: inline;
		float: left;
	}

</style>