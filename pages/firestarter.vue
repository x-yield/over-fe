<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
	<div id="overload">
		<template>
			<app-header/>
		</template>
		<v-container fluid>
			<v-alert class="info" id="firestarter_status" v-show="visibilities.statusVisibility"></v-alert>
			<v-alert class="error" id="firestarter_message" v-show="visibilities.messageVisibility"></v-alert>

			<button id="validateButton" @click="validateSessions" v-show="visibilities.validateButtonVisibility">Validate</button>
			<button id="prepareButton" @click="prepareSessions" v-show="visibilities.prepareButtonVisibility">Prepare</button>
			<button id="runButton" @click="runSessions" v-show="visibilities.runButtonVisibility">Run</button>
			<button id="stopButton" @click="stopSessions" v-show="visibilities.stopButtonVisibility">Stop</button>
			<div class="d-flex justify-between align-center mb-3">
				<v-btn @click="all">all</v-btn>
				<v-btn @click="none">none</v-btn>
			</div>
			<div>
				<v-expansion-panel
					v-model="panels"
					expand
				>
				</v-expansion-panel>
			</div>
		</v-container>
	</div>
</template>

<script>
import AppHeader from '../components/AppHeader';
import FirestarterPanel from '../components/FirestarterPanel.vue';
import '@ozonui/layout/src/grid.css';
import '@ozonui/form-input';
import '@ozonui/custom-button';


export default {
	data() {
		return {
			loading: false,
			error: '',
			success: null,
			sessions: [],
			panels: [],
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
	mounted() {
		this.createPanel();
		this.createPanel();
	},
	components: {
		FirestarterPanel,
		AppHeader,
	},
	methods: {
		createPanel: function() {
			this.panels.push(FirestarterPanel);
		},
		perform: async function(action) {
			let waitMap = {
				'prepare': 'prepare',
				'run': 'poll',
				'stop': 'finished',
			};

			return this.$api.post('/firestarter/'+action, JSON.stringify({'sessions': this.sessions}))
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
				});
		},
		validateSessions: async function() {
			this.loading = true;
			let tank = document.getElementById('tankInput').value;
			let conf = document.getElementById('confInput').value;

			this.sessions = [{'tank': tank, 'conf': conf}];
			await this.perform('validate');
			await this.findFailures();
			if (!this.error) {
				this.activateButton('prepare');
			}
			this.loading = false;
		},
		prepareSessions: function() { // needs polling
			this.loading = true;
			return this.perform('prepare');
		},
		runSessions: function() { // needs polling
			this.loading = true;
			return this.perform('run');
		},
		stopSessions: function() { // needs polling
			this.loading = true;
			return this.perform('stop');
		},
		pollSessions: function() {
			this.loading = true;
			return this.$api.post('/firestarter/poll', JSON.stringify({'sessions': this.sessions}))
				.then(response => {
					return response[0].data.sessions;
				})
				.then(json => {
					if (!json) {
						return;
					}
					this.sessions = json;
				});
		},
		sleep: function(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		},
		waitFor: async function(what) {
			let reached = true;
			let finished = false;
			let nextActionMap = {
				'prepare': 'run',
				'poll': 'stop',
			};

			await this.pollSessions();
			for (let i = 0; i < this.sessions.length; i++) {
				let s = this.sessions[i];

				if (s['stage'] !== what) {
					reached = false;
				}
				if (s['stage'] === 'finished') {
					finished = true;
				}
			}
			await this.findFailures();
			if (this.error) {
				let errorsAlert = document.getElementById('firestarter_message');

				errorsAlert.innerText = this.error;
				this.visibilities.messageVisibility = true;
				this.loading = false;
				return;
			}
			if (!reached && !finished) {
				await this.sleep(1000);
				return this.waitFor(what);
			} else {
				this.loading = false;
				if (nextActionMap.hasOwnProperty(what)) {
					this.activateButton(nextActionMap[what]);
				}
			}
		},
		activateButton: function(nextAction) {
			this.visibilities.validateButtonVisibility = false;
			this.visibilities.prepareButtonVisibility = false;
			this.visibilities.runButtonVisibility = false;
			this.visibilities.stopButtonVisibility = false;
			switch (nextAction) {
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
				if (session['status'] === 'failed' || (session.hasOwnProperty('failures') && session['failures'].length > 0)) {
					failures = failures + sessionLocation + ': ';
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
		all: function() {
			this.panel = [...Array(this.panel).keys()].map(_ => true);
		},
		// Reset the panel
		none: function() {
			this.panel = [];
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