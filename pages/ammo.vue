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

			<div>
				<form id="ammoUploadForm" enctype="multipart/form-data" method="post">
					<input type="text" name="name" placeholder="Имя" required/>
					<input type="file" name="file" required/>
					<input type="submit" name="file" id="submitButton" hidden/>
					<button @click="submit_form" type="button">Загрузить</button>
				</form>
			</div>
			<br/>
			<div class="table">
				<div v-if="loading">
					<h3 align="center">Loading...</h3>
				</div>
				<div v-else>
					<table class="table table-sm table-bordered" >
						<thead>
							<tr>
								<th scope="col" class="text-center">Path</th>
								<th scope="col" class="text-center">Size</th>
								<th scope="col" class="text-center">Modified</th>
								<th scope="col" class="text-center">Last Used</th>
								<!-- <th scope="col" class="text-center">Type</th> -->
								<th scope="col" class="text-center">Author</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="a in ammo" :key="a.id">
								<td align="left">
									{{ a.path }}
								</td>
								<td align="center">
									{{ a.size }}
								</td>
								<td align="center">
									{{ a.lastModified }}
								</td>
								<td align="center">
									{{ a.lastUsed }}
								</td>
								<!-- <td align="center">
									{{ a.type }}
								</td> -->
								<td align="center">
									{{ a.author }}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import '@ozonui/layout/src/grid.css';
import '@ozonui/form-input';
import '@ozonui/custom-button';

let ammoKeys = [];

export default {
	data() {
		return {
			ammo: {},
			loading: true,
			error: null,
			success: null,
		};
	},
	head: {
		title: 'Overload - нагрузочные тесты',
	},
	created() {
		this.get_ammo_info();
	},
	methods: {
		sexy_bytes: function(bytes) {
			if (typeof bytes === 'string') {
				bytes = parseInt(bytes);
			}
			let prefixMap = {
				0: '',
				1: ' Kb',
				2: ' Mb',
				3: ' Gb',
				4: ' Tb',
				5: ' Pb',
				6: ' Eb? seriously?',
				7: ' no way, int64 is less than that'
			};
			let count = 0;

			while (bytes >= 1024) {
				bytes = bytes / 1024;
				count += 1;
			}
			if (count > 0) {
				bytes = bytes.toFixed(2);
			}
			return bytes + prefixMap[count];
		},
		set_from_action: function($form) {
			$form.action = '//' + this.$env.endpoint + '/upload_ammo';
		},
		get_ammo_info: function() {
			this.$api.get('/list_ammo')
				.then(response => {
					return response[0].data.ammo;
				})
				.then(json => {
					if (!json) {
						return;
					}
					this.ammo = json;
					let i = 0;
					let len_a = this.ammo.length;

					// форматируем данные, чтобы красиво было.
					// и заполняем массив наименований существующих файлов
					for (;i<len_a;i++) {
						let a = this.ammo[i];

						ammoKeys.push(a['key']);
						a['size'] = this.sexy_bytes(a['size']);
					}
				});
			this.loading = false;
		},
		submit_form: function(event) {
			let $form = document.getElementById('ammoUploadForm');
			let ammoKey = $form.children[0]['value'];
			let $submitButton = document.getElementById('submitButton');

			$form.reportValidity();

			// эта проверка сломается при введении паджинации. Нужна будет ручка для отдачи ключей патронов из базы
			if (ammoKeys.indexOf(ammoKey) > -1) {
				if (confirm('Файл с таким именем уже существует. Перезаписать?')) {
					this.set_from_action($form);
					$submitButton.click();
				}
			}

		}
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