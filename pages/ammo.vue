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

			<div>
				<form id="ammoUploadForm" enctype="multipart/form-data" method="post">
					<input type="text" name="name" placeholder="Имя" required/>
					<input type="file" name="file" required/>
					<button @click="submitForm" type="button">Загрузить</button>
				</form>
			</div>
			<br/>
			<div class="table">
				<div v-if="loading">
					<h3 align="center">Loading...</h3>
				</div>
				<div v-else>
					<table class="table table-sm table-bordered" id="ammoTable">
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
			tableHeaders: {
				'Path':'path',
				'Size':'size',
				'Modified':'lastModified',
				'Last Used':'lastUsed',
				'Author':'author'
			}
		};
	},
	head: {
		title: 'Overload - нагрузочные тесты',
	},
	created() {
		this.getAmmoInfo();
	},
	methods: {
		sexyBytes: function(bytes) {
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
		zfill: function(num, len) { // заполняет строковое представление числа нулями, например zfill(5, 3) -> "005"
			return (1e15+num+'').slice(-len);
		},
		setFormAction: function($form) {
			$form.action = '//' + this.$env.endpoint + '/upload_ammo';
		},
		getAmmoInfo: function() {
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
						a['size'] = this.sexyBytes(a['size']); // мегабайты, гигабайты и прочее
						a['order'] = new Date(a['lastModified']); // поле для сортировки
						let lm = new Date(a['lastModified']); // локальная таймзона

						// форматируем дату 'YYYY-MM-DD HH:MM'
						a['lastModified'] = lm.getFullYear() + '-' +
							this.zfill(lm.getMonth()+1, 2) + '-' +
							this.zfill(lm.getDate(), 2) + ' ' +
							this.zfill(lm.getHours(), 2) + ':' +
							this.zfill(lm.getMinutes(), 2);
					}
					// сортируем патроны по дате последней модификации в обратном порядке (новые наверху)
					function compare(a, b) {
						if (a.order < b.order) { return 1; }
						if (a.order > b.order) { return -1; }
						return 0;
					}
					this.ammo.sort(compare);
				});
			this.loading = false;
		},
		submitForm: function() {
			let $form = document.getElementById('ammoUploadForm');
			let ammoKey = $form.children[0]['value'];

			$form.reportValidity();
			this.setFormAction($form);

			// эта проверка сломается при введении паджинации. Нужна будет ручка для отдачи ключей патронов из базы
			if (ammoKeys.indexOf(ammoKey) > -1) {
				if (confirm('Файл с таким именем уже существует. Перезаписать?')) {
					this.sendFormData($form);
				}
			} else {
				this.sendFormData($form);
			}
		},
		highlightNewAmmo: function(scope, value) {
			let highlightingColor = '#ffeb99'; // yellow-ish

			// ждем пока обновится табличка
			let waiter = setInterval(function() {
				if (scope.loading === false) {
					let $ammoTable = document.getElementById('ammoTable');

					for (let i = 0; i < $ammoTable.rows.length; i++) {
						let row = $ammoTable.rows[i];

						if (row.cells[0].innerText === value) {
							row.style.setProperty('background-color', highlightingColor);
							break;
						}
					}
					clearInterval(waiter);
				}
			}, 100);
		},
		sendFormData: function($form) {
			let request = new XMLHttpRequest();
			let ammoUrl = '';

			request.open('POST', $form.action, false);
			request.onload = function() {
				ammoUrl = JSON.parse(request.responseText)['url'];
			};
			request.onerror = function() {
				console.log(request.status + ': ' + request.statusText);
			};

			request.send(new FormData($form));

			// обновляем таблицу и подсвечаваем обновленный файл
			if (ammoUrl !== '') {
				this.loading = true;
				this.getAmmoInfo();
				this.highlightNewAmmo(this, ammoUrl);
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