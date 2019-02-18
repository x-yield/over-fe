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
					<div align="right">
						<a :href='"/job?id="+test_id'>Back to job {{ test_id }}</a>
					</div>
					<div>
						<h4 align="right">
							<select class="dropbtn" @change="get_collection_info(key)" v-model="key">
								<option v-for="id in collection_ids" :key="id">
									{{ id }}
								</option>
							</select>
						</h4>
					</div>
				</div>
			</nav>
			<div v-if="loading">
				<h3 align="center">Loading...</h3>
			</div>

			<div class="col-md-12">
				<table class="table table-sm table-hover">
					<tbody>
						<tr>
							<td align="center">Service</td>
							<td align="center">{{ collection.service }}</td>
						</tr>
						<tr>
							<td align="center">Environment</td>
							<td align="center">{{ collection.env }}</td>
						</tr>
						<tr>
							<td align="center">Name of regression</td>
							<td align="center">{{ collection.name }}</td>
						</tr>
						<tr>
							<td align="center">Branch</td>
							<td align="center">{{ collection.branch }}</td>
						</tr>
						<tr>
							<td align="center">Author</td>
							<td align="center">{{ collection.author }}</td>
						</tr>
					</tbody>
				</table>
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
</template>

<script>
import Layout from '@ozonui/layout';
import '@ozonui/layout/src/grid.css';
import Input from '@ozonui/form-input';
import FormSelect from '@ozonui/form-select';
import Button from '@ozonui/custom-button';

const {FormSelect: Select, FormSelectOption: Option} = FormSelect;

const {
	container,
	row,
	column,
} = Layout;


export default {
	data() {
		return {
			key: '',
			collection_ids: [],
			regression: {
				graphs: {
					imbalance: null
				}
			},
			collection: {},
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
		Row: row,
		Column: column,
		Container: container
	},
	created() {
		this.test_id = this.$route.query.id;
	},
	mounted() {
		this.get_test_info(this.test_id);
	},
	methods: {
		get_collection_info: function(id) {
			this.$api.get('/collections?collection_id=' + id)
				.then(response => {
					return response[0].data;
				})
				.then(json => {
					if (!json.collections) {
						return;
					}
					this.collection = json.collections[0];
					this.regression.graphs.imbalance = 'http://grafana.o3.ru/d-solo/r8eyBMumz/trends?orgId=1&panelId=2&from=1542466873575&to=1550242873575&var-env='+this.collection.env+'&var-service='+this.collection.service+'&var-collection='+this.collection.name+'&theme=light';
				});
		},
		get_test_info: function(id) {
			this.$api.get('/job/' + id)
				.then(response => {
					return response[0].data.job;
				})
				.then(job_json => {
					if (!job_json) {
						return;
					}
					this.job = job_json;
					job_json.collectionIds.forEach(
						collection => {
							this.collection_ids.push(collection);
						}
					);
					this.job.graphs = {};
					if (isNaN(this.job.testStop)) {
						this.job.finishedTime = 'now';
					} else {
						this.job.finishedTime = this.job.testStop * 1000;
					}
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
	.dropbtn {
		background-color: #31b131;
		color: white;
		padding: 16px;
		font-size: 16px;
		border: none;
		width: auto;
		cursor: pointer;
	}

	.dropdown {
		position: relative;
		display: inline-block;
	}

	.dropdown-content {
		display: none;
		position: absolute;
		background-color: #f9f9f9;
		min-width: 160px;
		box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
		z-index: 1;
	}

	.dropdown-content a {
		color: black;
		padding: 12px 16px;
		text-decoration: none;
		display: block;
	}

	.dropdown-content a:hover {background-color: #f1f1f1}

	.dropdown:hover .dropdown-content {
		display: block;
	}

	.dropdown:hover .dropbtn {
		background-color: #3e8e41;
	}
</style>

