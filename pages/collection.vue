<template>
	<div id="overload">
		<v-app id="inspire">
			<template>
				<v-toolbar
					class="mb-2"
					color="cyan darken-2"
					dark
					flat>
					<v-toolbar-title class="headline font-weight-bold">Overload</v-toolbar-title>
					<v-spacer/>
					<v-toolbar-items class="hidden-sm-and-down">
						<v-btn flat href="/">Jobs</v-btn>
						<v-btn flat href="/collections">Collections</v-btn>
						<v-btn flat href="/ammo">Ammo</v-btn>
					</v-toolbar-items>
				</v-toolbar>
			</template>
			<v-card>
				<table-info :title="'Collection #'+collectionId" :headers="collectionHeaders" :content="collection" isСollection/>
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

export default {
	data() {
		return {
			regression: {
				graphs: {
					imbalance: null
				}
			},
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
		Graph
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