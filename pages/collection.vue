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
					class="mt-2 mr-2 ml-2"
					:title="'Collection #'+collectionId"
					:headers="collectionHeaders"
					:content="collection"
					:isCollection="true">
					<tr slot="extra-link">
						<td align=center class="body-2 font-weight-bold">Latest jobs for this collection</td>
						<td align=center class="body-2">
							<a :href='"/job?id="+job.id' v-for="job in collection[0].latestJobs" :key="job.id" class="mr-2">
								{{ job.id }}
							</a>
						</td>
					</tr>
				</table-info>
				<h3 align="center">Trends</h3>
				<!-- Trends -->
				<graph :content="regression.graphs.imbalance"/>
			</div>
		</v-container>
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
			collectionId: '',
			collection: [],
			collectionHeaders: {
				'Environment':'env',
				'Project name':'project',
				'Service':'service',
				'Name of collection':'name',
				'Author':'author'
			},
			loading: true,
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
					this.collection.push(json);
					const intervalStart = new Date().getTime() - 90*24*60*60*1000;

					this.regression.graphs.imbalance = 'http://grafana.o3.ru/d-solo/r8eyBMumz/trends?orgId=1&panelId=2'+
						'&from='+intervalStart+'&to=now&var-env='+this.collection[0].env+'&var-service='+
						this.collection[0].project+'&var-collection='+this.collection[0].name+'&theme=light';
					this.loading = false;
				});
		},
	},
};
</script>

<style scoped>
</style>