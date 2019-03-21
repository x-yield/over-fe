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
					</div>
				</div>
				<div>
					<a href="/collections">Collections</a>
					<a href="/ammo">Ammo</a>
				</div>
			</nav>
			<div v-if="loading">
				<h3 align="center">Loading...</h3>
			</div>

			<div v-else>
				<div class="col-md-12">
					<table-info :title="'Collection #'+collectionId" :headers="collectionHeaders" :content="collection" isСollection/>
				</div>
				<!-- grafana graphs -->
				<div class="col-md-12">
					<h3 align="center">Trends</h3>
					<div class="row justify-content-between" style="height:300px;">
						<div class="col-md-12 col-sm-12">
							<!-- Trends -->
							<graph :content="regression.graphs.imbalance"/>
						</div>
					</div>
				</div>
			</div>
		</div>
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

