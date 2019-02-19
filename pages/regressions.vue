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
							<select class="dropbtn" @change="display_graphs(selected)" v-model="selected">
								<option v-for="collection in collections" :value="collection.id" :key="collection.id">
									{{ collection.env + ' -> ' + collection.service + ' -> ' + collection.name }}
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
							<td align="center">Environment</td>
							<td align="center">{{ currentCollection.env }}</td>
						</tr>
						<tr>
							<td align="center">Service</td>
							<td align="center">{{ currentCollection.service }}</td>
						</tr>
						<tr>
							<td align="center">Name of collection</td>
							<td align="center">{{ currentCollection.name }}</td>
						</tr>
						<tr>
							<td align="center">Author</td>
							<td align="center">{{ currentCollection.author }}</td>
						</tr>
					</tbody>
				</table>
				{{ queryString }}
				{{ collections }}
				<br>
				{{ currentCollection }}
				<br>
				{{ selected }}
				<br>
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
			currentCollection: {},
			queryString: null,
			selected: '',
			collection_ids: [],
			regression: {
				graphs: {
					imbalance: null
				}
			},
			collections: [],
			test_id: null,
			loading: true,
			error: null,
			success: null,
			aaaa: false,
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
		this.get_test_info(this.test_id);
	},
	mounted() {
		//this.display_graphs();
	},
	methods: {
		get_collections_info: function(selected_id) {
			this.$api.get('/collections?' + this.queryString)
				.then(response => {
					return response[0].data;
				})
				.then(json => {
					if (!json.collections) {
						return;
					}
					json.collections.forEach(
						collection => {
							this.collections.push(collection);
						}
					);
					this.display_graphs(selected_id);
				});
		},
		display_graphs: function(selected_id) {
			const intervalStart = new Date().getTime() - 90*24*60*60*1000;

			this.collections.forEach(
				collection => {
					if (selected_id === collection.id) {
						this.currentCollection = (collection);
					}
				}
			);

			this.regression.graphs.imbalance = 'http://grafana.o3.ru/d-solo/r8eyBMumz/trends?orgId=1&panelId=2&from='+intervalStart+'&to=now&var-env='+this.currentCollection.env+'&var-service='+this.currentCollection.service+'&var-collection='+this.currentCollection.name+'&theme=light';
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
						collection_id => {
							this.collection_ids.push(collection_id);
							this.queryString = ('collection_id='+collection_id+'&').slice(0, -1);
						}
					);
					this.selected = this.collection_ids[0];
					this.get_collections_info(this.selected);
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

