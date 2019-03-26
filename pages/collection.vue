<template>
	<div id="overload">
		<v-app id="inspire">
			<template>
				<app-header/>
			</template>
			<v-sparkline
				:value="value"
				:smooth="radius || false"
				:padding="padding"
				autoDrawDuration="1000"
				:lineWidth="width"
				:strokeLinecap="lineCap"
				autoDraw="true"
				width="100"/>
			<v-card>
				<table-info
					class="ml-4 mr-4"
					:title="'Collection #'+collectionId"
					:headers="collectionHeaders"
					:content="collection"
					isСollection/>
				<h3 align="center">Trends</h3>
				<!-- Trends -->
				<graph :content="regression.graphs.imbalance"/>
			</v-card>
		</v-app>
	</div>
</template>

<script>
import '@ozonui/layout/src/grid.css';
import TableInfo from '../components/TableInfo';
import Graph from '../components/Graph';
import AppHeader from '../components/AppHeader';

export default {
	data() {
		return {
			regression: {
				graphs: {
					imbalance: null
				}
			},
			width: 1,
			radius: 0,
			padding: 20,
			lineCap: 'round',
			value: [0, 100, 0, 9, 26, 22, 40, 150, 50, 17, 26, 70, 5, 0],
			collectionId: '',
			collection: {},
			collectionHeaders: {
				'Environment':'env',
				'Project name':'project',
				'Service':'service',
				'Name of collection':'name',
				'Author':'author'
			},
			loading: true,
			error: null,
			success: null,
		};
	},
	head: {
		title: 'Overload - нагрузочные тесты',
	},
	components: {
		TableInfo,
		Graph,
		AppHeader
	},
	created() {
		this.collectionId = this.$route.query.id;
		this.getCollectionsInfo(this.collectionId);
	},
	methods: {
		getCollectionsInfo: function(id) {
			this.$api.get('/collections?collection_id=' + id)
				.then(response => {
					return response[0].data.collections[0];
				})
				.then(json => {
					if (!json) {
						return;
					}
					this.collection = json;
					const intervalStart = new Date().getTime() - 90*24*60*60*1000;

					this.regression.graphs.imbalance = 'http://grafana.o3.ru/d-solo/r8eyBMumz/trends?orgId=1&panelId=2'+
						'&from='+intervalStart+'&to=now&var-env='+this.collection.env+'&var-service='+
						this.collection.project+'&var-collection='+this.collection.name+'&theme=light';
					this.loading = false;
				});
		},
	},
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
	}
	td > * {
		vertical-align : middle;
	}
	.sub-menu {

	}
</style>