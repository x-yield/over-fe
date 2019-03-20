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
						<a class="navbar-brand" href="/collections">Collections</a>
						<a class="navbar-brand" href="/ammo">Ammo</a>
					</div>
				</div>
			</nav>
			<div v-if="loading">
				<h3 align="center">Loading...</h3>
			</div>

			<div v-else>
				<div class="col-md-12">
					<table-info :title="'Collection #'+collectionId" :headers="['Environment', 'Project Name']">
						<tbody>
							<tr>
								<td align="center">Environment</td>
								<td align="center">{{ collection.env }}</td>
							</tr>
							<tr>
								<td align="center">Project name</td>
								<td align="center">{{ collection.project }}</td>
							</tr>
							<tr>
								<td align="center">Service</td>
								<td align="center">{{ collection.service }}</td>
							</tr>
							<tr>
								<td align="center">Name of collection</td>
								<td align="center">{{ collection.name }}</td>
							</tr>
							<tr>
								<td align="center">Author</td>
								<td align="center">{{ collection.author }}</td>
							</tr>
							<tr>
								<td align="center">Latest jobs for this collection</td>
								<td align="center">
									<a :href='"/job?id="+job.id' v-for="job in collection.latestJobs" :key="job.id">
										{{ job.id }}
									</a>
								</td>
							</tr>
						</tbody>
					</table-info>
				</div>
				<!-- grafana graphs -->
				<div class="col-md-12">
					<h3 align="center">Trends</h3>
					<div class="row justify-content-between" style="height:300px;">
						<div class="col-md-12 col-sm-12">
							<!-- rps -->
							<iframe
								:src="regression.graphs.imbalance"
								width="100%"
								height="100%"
								marginheight="0"
								align="top"
								scrolling="No"
								frameborder="0"
								style="overflow: hidden;"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Layout from '@ozonui/layout';
import '@ozonui/layout/src/grid.css';
import Input from '@ozonui/form-input';
import FormSelect from '@ozonui/form-select';
import Button from '@ozonui/custom-button';
import TableInfo from '../components/TableInfo';

const {FormSelect: Select, FormSelectOption: Option} = FormSelect;

const {
	container,
	row,
	column,
} = Layout;


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
			loading: true,
			error: null,
			success: null,
		};
	},
	head: {
		title: 'Overload - нагрузочные тесты',
	},
	components: {
		Button,
		Input,
		Select,
		Option,
		TableInfo,
		Row: row,
		Column: column,
		Container: container
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

					this.regression.graphs.imbalance = 'http://grafana.o3.ru/d-solo/r8eyBMumz/trends?orgId=1&panelId=2&from='+intervalStart
						+'&to=now&var-env='+this.collection.env+'&var-service='+this.collection.project+'&var-collection='+this.collection.name+'&theme=light';
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
</style>

