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
			</nav>
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
export default {
	data() {
		return {
			regression: {
				graphs: {
					imbalance: null
				}
			}
		};
	},
	mounted() {
		this.get_test_info();
	},
	methods: {
		get_test_info: function() {
			this.regression.graphs = {};
			this.regression.graphs.imbalance = 'http://grafana.o3.ru/d-solo/gM7Iqapik/trends?orgId=1&theme=light';
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
	}
	td > * {
		vertical-align : middle;
	}
</style>

