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
				<v-card class="mb-2">
					<form id="ammoUploadForm" enctype="multipart/form-data" method="post" style="padding: 1em 0 1em 2em;">
						<input type="text" name="name" placeholder="Имя" required style="border: 1px solid #00acc1;"/>
						<input id="fileInput" type="file" @change="chooseFile($event)" required style="display: none;"/>
						<label for="fileInput">
							<span class="choose-btn">Выберите файл</span>
							<span>{{ name }}</span>
						</label>
						<v-btn color="cyan darken-1" dark @click="submitForm" type="button">Загрузить</v-btn>
					</form>
				</v-card>

				<v-card class="justify-space-between">
					<v-data-table
						:headers="tableHeaders"
						:items="ammo"
						:rowsPerPageItems="[25, 50]"
						hideActions
						sortIcon="">
						<template slot="items" slot-scope="props">
							<td class="text-lg-center body-2">
								<a :href="props.item.download">{{ props.item.key }}</a>
							</td>
							<td class="text-lg-center body-2">{{ props.item.size }}</td>
							<td class="text-lg-center body-2">{{ props.item.lastModified }}</td>
							<td class="text-lg-center body-2">{{ props.item.lastUsed }}</td>
							<td class="text-lg-center body-2">{{ props.item.Author }}</td>
						</template>
					</v-data-table>
				</v-card>
			</div>
		</v-container>
	</div>
</template>

<script>
import '@ozonui/layout/src/grid.css';
import '@ozonui/form-input';
import '@ozonui/custom-button';
import AppHeader from '../components/AppHeader';

let ammoKeys = [];

export default {
	data() {
		return {
			name: '',
			ammo: [],
			loading: true,
			error: null,
			success: null,
			tableHeaders: [
				{text: 'Key', align: 'center'},
				{text: 'Size', align: 'center'},
				{text: 'Modified', align: 'center'},
				{text:'Last Used', align: 'center'},
				{text: 'Author', align: 'center'}],
		};
	},
	components: {
		AppHeader
	},
	created() {
		this.getAmmoInfo();
	},
	methods: {
		chooseFile: function(event) {
			this.name = event.target.files[0].name;
		},
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
					return response[0].data;
				})
				.then(json => {
					if (!json.ammo) {
						return;
					}
					json.ammo.forEach(
						ammo => {
							this.ammo.push(ammo);
						}
					);
					let i = 0;
					let len_a = this.ammo.length;

					// форматируем данные, чтобы красиво было.
					// и заполняем массив наименований существующих файлов
					for (;i<len_a;i++) {
						let a = this.ammo[i];

						ammoKeys.push(a['key']);
						a['size'] = this.sexyBytes(a['size']); // мегабайты, гигабайты и прочее
						a['order'] = new Date(a['lastModified']); // поле для сортировки
						a['download'] = '//' + this.$env.endpoint + '/download_ammo?key=' + a['key'];
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

			if ($form.reportValidity()) {
				this.setFormAction($form);

				// эта проверка сломается при введении паджинации. Нужна будет ручка для отдачи ключей патронов из базы
				if (ammoKeys.indexOf(ammoKey) > -1) {
					if (confirm('Файл с таким именем уже существует. Перезаписать?')) {
						this.sendFormData($form);
					}
				} else {
					this.sendFormData($form);
				}
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

			let data = new FormData($form);

			data.append('file', $form.children[1].files[0]);

			data.forEach(function(value, key, parent) {
				console.log(value, key, parent);
			});

			request.send(data);

			// обновляем таблицу и подсвечаваем обновленный файл
			if (ammoUrl !== '') {
				this.loading = true;
				this.getAmmoInfo();
				//this.highlightNewAmmo(this, ammoUrl);
			}
		}
	},
};
</script>

<style scoped>
	.choose-btn {
		border-radius: 2px;
		box-shadow: 0 2px 1px #a0a2a7;
		background-color: #00acc1;
		color: #ffffff;
		cursor: pointer;
		font: 14px Roboto, sans-serif;
		font-weight: 500;
		padding: 0.7em 1em 0.7em 1em;
		text-align: center;
		text-transform: uppercase;
		vertical-align: middle;
	}

</style>