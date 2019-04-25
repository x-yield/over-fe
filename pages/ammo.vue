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
					<v-card-title class="ml-5 mr-4 subheading font-weight-bold">
						Uploaded ammo files
						<v-spacer/>
						<v-spacer/>
						<v-text-field
							v-model="search"
							appendIcon="search"
							label="Search"
							color="cyan"
							class="font-weight-regular"
							singleLine
							hideDetails
							@change="getAmmoInfo({search})"/>
					</v-card-title>
					<v-data-table
						:headers="tableHeaders"
						:items="ammo"
						:search="search"
						:totalItems="pagination.totalItems"
						:pagination.sync="pagination"
						:loading="loading"
						:rowsPerPageItems="[10]"
						sortIcon=""
						hideActions>
						<template slot="items" slot-scope="props">
							<td class="text-lg-center">
								<a :href="props.item.download" style="text-decoration: none;">
									<v-icon size="30" color="cyan">get_app</v-icon>
								</a>
							</td>
							<td class="text-lg-center body-2">{{ props.item.key }}</td>
							<td class="text-lg-center body-2">{{ props.item.size }}</td>
							<td class="text-lg-center body-2" style="white-space: nowrap;">{{ props.item.lastModified }}</td>
							<td class="text-lg-center body-2">{{ props.item.lastUsed }}</td>
							<td class="text-lg-center body-2">{{ props.item.Author }}</td>
							<td class="text-lg-center">
								<a style="text-decoration: none;">
									<v-icon size="30" @click="deleteAmmo(props.item)">delete</v-icon>
								</a>
							</td>
						</template>
					</v-data-table>
				</v-card>
				<div class="text-xs-center pt-2">
					<v-pagination
						color="cyan darken-1"
						totalVisible="7"
						v-model="pagination.page"
						:length="pages"
						@input="getAmmoInfo({search})"/>
				</div>
			</div>
		</v-container>
	</div>
</template>

<script>
import AppHeader from '../components/AppHeader';

let ammoKeys = [];

export default {
	data() {
		return {
			search: '',
			name: '',
			ammo: [],
			pagination: {},
			loading: false,
			error: null,
			success: null,
			tableHeaders: [
				{text: 'Download ammo', align: 'center', value: 'download'},
				{text: 'Key', align: 'center', value: 'key'},
				{text: 'Size', align: 'center', value: 'size'},
				{text: 'Modified', align: 'center', value: 'lastModified'},
				{text:'Last Used', align: 'center', value: 'lastUsed'},
				{text: 'Author', align: 'center', value: 'Author'},
				{text: 'Delete', align: 'center', value: 'delete'}],
		};
	},
	components: {
		AppHeader
	},
	mounted() {
		this.getAmmoInfo({});
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
		getAmmoInfo: function(params) {
			const querystring = require('querystring');

			let queryString = querystring.stringify(params);

			this.loading = true;
			this.$api.get('/list_ammo?page=' + this.pagination.page + '&limit=' + this.pagination.rowsPerPage +'&'+queryString)
				.then(response => {
					const respData = response[0].data.ammo;

					this.ammo = respData;
					this.ammo.forEach(
						ammo => {
							ammo.size = this.sexyBytes(ammo.size);
							ammo['download'] = '//' + this.$env.endpoint + '/download_ammo?key=' + ammo.key;
							let lm = new Date(ammo.lastModified); // локальная таймзона

							// форматируем дату 'YYYY-MM-DD HH:MM'
							ammo.lastModified = lm.getFullYear() + '-' +
								this.zfill(lm.getMonth()+1, 2) + '-' +
								this.zfill(lm.getDate(), 2) + ' ' +
								this.zfill(lm.getHours(), 2) + ':' +
								this.zfill(lm.getMinutes(), 2);
						}
					);
					this.pagination.totalItems = response[0].data.count;
					this.loading = false;
				});
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
			request.send(data);

			// обновляем таблицу и подсвечаваем обновленный файл
			if (ammoUrl !== '') {
				this.loading = true;
				this.getAmmoInfo();
				//this.highlightNewAmmo(this, ammoUrl);
			}
		},
		deleteAmmo: function(item) {
			if (confirm('Удалить '+item.key+'?')) {
				this.$api.get('/delete_ammo?key=' + item.key)
					.then(response => {
						if (response[0].status === 200) {
							this.ammo.splice(this.ammo.indexOf(item), 1);
						}
					});
			}
		}
	},
	computed: {
		pages() {
			if (this.pagination.rowsPerPage == null ||
				this.pagination.totalItems == null
			) {return 0;}

			return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage);
		}
	}
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