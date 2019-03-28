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
						<a class="navbar-brand" href="/firestarter">FS</a>
					</div>
				</div>
			</nav>
			<div>
				<span class="info" id="firestarter_status" v-show="visibilities.statusVisibility"></span>
				<span class="error" id="firestarter_message" v-show="visibilities.messageVisibility"></span>

				<label for="tankInput">танк</label>
				<input name="tank" id="tankInput" type="text" value="" style="width: 100%"/>
				<br/>
				<label for="confInput">конфиг</label>
				<textarea name="conf" id="confInput" rows="10" style="width: 100%"></textarea>

				<button id="validateButton" @click="validateSessions" v-show="visibilities.validateButtonVisibility">Validate</button>
				<button id="prepareButton" @click="prepareSessions" v-show="visibilities.prepareButtonVisibility">Prepare</button>
				<button id="runButton" @click="runSessions" v-show="visibilities.runButtonVisibility">Run</button>
				<button id="stopButton" @click="stopSessions" v-show="visibilities.stopButtonVisibility">Stop</button>
			</div>
		</div>
	</div>
</template>

<script>
import '@ozonui/layout/src/grid.css';
import '@ozonui/form-input';
import '@ozonui/custom-button';


export default {
	data() {
		return {
			loading: true,
			error: '',
			success: null,
			sessions: [],

			stage: '',

			visibilities:{
				statusVisibility: false,
				messageVisibility: false,
				validateButtonVisibility: true,
				prepareButtonVisibility: false,
				runButtonVisibility: false,
				stopButtonVisibility: false,
			},
		};
	},
	head: {
		title: 'Overload - нагрузочные тесты',
	},
	methods: {
		perform: async function(action) {
			let actionMap = {
				'validate': 'prepare',
				'prepare': 'run',
				'run': 'stop',
			};
			let waitMap = {
				'prepare': 'prepare',
				'run': 'poll',
				'stop': 'finished',
			};

			this.$api.post('/firestarter/'+action, JSON.stringify({'sessions': this.sessions}))
				.then(response => {
					return response[0].data.sessions;
				})
				.then(json => {
					if (!json) {
						return;
					}
					this.sessions = json;
				})
				.then(() => {
					if (waitMap.hasOwnProperty(action)) {
						this.waitFor(waitMap[action]);
					}
				})
				.then(() => {
					if (!this.error) {
						this.findFailures();
					}
				})
				.then(() => {
					if (!this.error) {
						if (actionMap.hasOwnProperty(action)) {
							this.activateButton(actionMap[action]);
						}
					}
				});
		},
		validateSessions: function() {
			this.loading = true;
			let tank = document.getElementById('tankInput').value;
			let conf = document.getElementById('confInput').value;

			this.sessions = [{'tank': tank, 'conf': conf}];
			this.perform('validate');
		},
		prepareSessions: async function() { // needs polling
			this.loading = true;
			this.perform('prepare');
		},
		runSessions: function() { // needs polling
			this.loading = true;
			this.perform('run');
		},
		stopSessions: function() { // needs polling
			this.loading = true;
			this.perform('stop');
		},
		pollSessions: function() {
			this.loading = true;
			this.perform('poll');
		},
		sleep: function(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		},
		waitFor: async function(what) {
			let reached = true;
			let finished = false;

			this.pollSessions();
			for (let i = 0; i < this.sessions.length; i++) {
				let s = this.sessions[i];

				if (s['stage'] !== what) {
					reached = false;
				}
				if (s['stage'] === 'finished') {
					finished = true;
				}
				if (s['status'] === 'failed') {
					this.success = false;
					this.loading = false;
					return;
				}
			}
			this.findFailures();
			if (this.error) {
				this.loading = false;
				return;
			}
			if (!reached && !finished) {
				await this.sleep(1000);
				this.waitFor(what);
			} else {
				this.loading = false;
			}
		},
		activateButton: async function(action) {
			this.visibilities.validateButtonVisibility = false;
			this.visibilities.prepareButtonVisibility = false;
			this.visibilities.runButtonVisibility = false;
			this.visibilities.stopButtonVisibility = false;
			switch (action) {
				case 'validate':
					this.visibilities.validateButtonVisibility = true;
					break;
				case 'prepare':
					this.visibilities.prepareButtonVisibility = true;
					break;
				case 'run':
					this.visibilities.runButtonVisibility = true;
					break;
				case 'stop':
					this.visibilities.stopButtonVisibility = true;
					break;
				default:
					break;
			}
		},
		findFailures: function() {
			this.error = '';
			this.visibilities.messageVisibility = false;
			for (let i = 0; i < this.sessions.length; i++) {
				let session = this.sessions[i];
				let failures = '';
				let sessionLocation = '';

				if (session.hasOwnProperty('name') && session['name'] !== '') {
					sessionLocation = sessionLocation+ session['name'] + '@';
				}
				sessionLocation = sessionLocation+ session['tank'];

				// formatting error message
				if (session.hasOwnProperty('failures') && session['failures'].length > 0) {
					failures = failures + '\n' + sessionLocation + ': ';
					for (let j = 0; j < session['failures'].length; j++) {
						let f = session['failures'][j];

						failures = failures + f + '; \n';

						this.error = this.error + failures;
					}
				}
			}
			if (this.error) {
				let errorsAlert = document.getElementById('firestarter_message');

				errorsAlert.innerText = this.error;
				this.visibilities.messageVisibility = true;
			}
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