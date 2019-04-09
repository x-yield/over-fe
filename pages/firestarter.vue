<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
	<div id="overload">
		<template>
			<app-header/>
		</template>
		<v-container fluid>
			<v-alert class="info" id="firestarter_status" v-show="visibilities.statusVisibility"/>
			<v-alert class="error" id="firestarter_message" v-show="visibilities.messageVisibility"/>

			<v-btn id="validateButton" @click="validate" v-show="visibilities.validateButtonVisibility">Validate</v-btn>
			<v-btn id="prepareButton" @click="prepare" v-show="visibilities.prepareButtonVisibility">Prepare</v-btn>
			<v-btn id="runButton" @click="run" v-show="visibilities.runButtonVisibility">Run</v-btn>
			<v-btn id="stopButton" @click="stop" v-show="visibilities.stopButtonVisibility">Stop</v-btn>
			<v-icon @click="all">unfold_more</v-icon>
			<v-icon @click="none">unfold_less</v-icon>
			<v-expansion-panel
				v-for="panel in panels"
				:key="panel.externalId"
				extend=true
			>
				<firestarter-panel
					:is="panel.panel"
					:externalId="panel.externalId"
					:valid="panel.valid"
					:prepared="panel.prepared"
					:running="panel.running"
					:stopped="panel.stopped"
					:locked="panel.disabled"
				/>
			</v-expansion-panel>
			<v-icon @click="createPanel">plus_one</v-icon>
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
	},
	components: {
		FirestarterPanel,
		AppHeader,
	},
	methods: {
		_findPanel: function(session) {
			let panel = {};
			for (let j = 0; j < this.panels.length; j++) {
				if (this.panels[j].externalId === session.externalId) {
					panel = this.panels[j];
					break;
				}
			}
			return panel;
		},
		_findSession: function(panel) {
			let session = {};

			for (let j = 0; j < this.sessions.length; j++) {
				if (this.sessions[j].externalId === panel.externalId) {
					session = this.sessions[j];
					break;
				}
			}
			return session;
		},
		createPanel: function() {
			let maxId = 0;

			if (this.panels.length > 0) {
				for (let i = 0; i < this.panels.length; i++) {
					let panel = this.panels[i];

					if (panel.externalId > maxId) {
						maxId = panel.externalId;
					}
				}
			}
			maxId++;
			let newPanel = FirestarterPanel;
			let externalId = maxId.toString();

			this.panels.push({
				'panel': newPanel,
				'externalId': externalId,
				'valid': false,
				'prepared': false,
				'running': false,
				'stopped': false,
				'locked': false,
			});
			this.sessions.push({
				'tank': '',
				'conf': '',
				'stage': '',
				'status': '',
				'failures': [],
				'externalId': externalId,
			});
			this.activateButton('validate');
		},
		_perform: function(action, sessions) {
			let waitForMap = {
				'prepare': 'prepare',
				'run': 'poll',
				'stop': 'finished',
			};

			return this.$api.post('/firestarter/'+action, JSON.stringify({'sessions': sessions}))
				.then(response => {
					return response[0].data.sessions;
				})
				.then(json => {
					if (!json) {
						return;
					}
					sessions = json;
					if (waitForMap.hasOwnProperty(action)) {
						return this._waitFor(waitForMap[action], sessions);
					} else {
						return sessions;
					}
				});
		},
		_updateSessions: function(sessions) {
			for (let i = 0; i < sessions.length; i++) {
				let newSessionsData = sessions[i];
				let s = this._findSession({'externalId': newSessionsData.externalId});

				for (let k in newSessionsData) {
					s[k] = newSessionsData[k];
				}
			}
		},
		validate: async function() { // validates not valid panels. locks panel once it is valid;
			this.loading = true;
			let sessionsToValidate = [];

			for (let i = 0; i < this.panels.length; i++) {
				let panel = this.panels[i];

				if (!panel.valid) {
					let session = this._findSession(panel);

					session['tank'] = document.getElementById('tankInput_'+session.externalId).value;
					session['conf'] = document.getElementById('confInput_'+session.externalId).value;
					session['externalId'] = panel.externalId;

					sessionsToValidate.push(session);
				}
			}

			sessionsToValidate = await this._perform('validate', sessionsToValidate);

			for (let i in sessionsToValidate) {
				let session = sessionsToValidate[i];
				let panel = this._findPanel(session);

				if (!session.hasOwnProperty('failures') || session.failures === []) {
					panel.locked = true;
					panel.valid = true;
				} else {
					panel.validationOK = false;
				}
			}
			await this._updateSessions(sessionsToValidate);
			await this.showFailures(sessionsToValidate);
			if (!this.error) {
				this.activateButton('prepare');
			}
			this.loading = false;
		},
		prepare: async function() { // needs polling
			this.loading = true;
			let sessionsToPrepare = [];

			for (let i = 0; i < this.panels.length; i++) {
				let panel = this.panels[i];

				if (panel.valid && !panel.prepared) {
					let session = this._findSession(panel);

					sessionsToPrepare.push(session);
				}
			}

			await this._perform('prepare', sessionsToPrepare);
			this.loading = false;
		},
		run: async function() { // needs polling
			this.loading = true;
			let sessionsToRun = [];


			for (let i = 0; i < this.panels.length; i++) {
				let panel = this.panels[i];

				if (panel.valid && panel.prepared && !panel.running) {
					let session = this._findSession(panel);

					sessionsToRun.push(session);
				}
			}
			await this._perform('run', sessionsToRun);
			this.loading = false;
		},
		stop: async function() { // needs polling
			this.loading = true;
			let sessionsToStop = [];

			for (let i = 0; i < this.panels.length; i++) {
				let panel = this.panels[i];

				if (panel.valid && panel.prepared && panel.running && !panel.stopped) {
					let session = this._findSession(panel);

					sessionsToStop.push(session);
				}
			}

			await this._perform('stop', sessionsToStop);
			this.loading = false;
		},
		poll: function(sessions) {
			this.loading = true;
			return this.$api.post('/firestarter/poll', JSON.stringify({'sessions': sessions}))
				.then(response => {
					return response[0].data.sessions;
				})
				.then(json => {
					if (!json) {
						return;
					}
					return json;
				});
		},
		_sleep: function(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		},
		_waitFor: async function(what, sessions) {
			let reached = true;
			let finished = false;
			let nextActionMap = {
				'prepare': 'run',
				'poll': 'stop',
			};
			let panelPropsMap = {
				'prepare': 'prepared',
				'poll': 'running',
				'finished': 'stopped',
			};

			sessions = await this.poll(sessions);
			for (let i = 0; i < sessions.length; i++) {
				let s = sessions[i];

				if (s['stage'] !== what) {
					reached = false;
				}
				if (s['stage'] === 'finished') {
					finished = true;
				}
			}
			await this.showFailures(sessions);
			if (this.error) {
				this.loading = false;
				return sessions;
			}
			if (!reached && !finished) {
				await this._sleep(1000);
				return this._waitFor(what, sessions);
			} else {
				this.loading = false;
				if (nextActionMap.hasOwnProperty(what)) {
					this.activateButton(nextActionMap[what]);
				}
				for (let i = 0; i < sessions.length; i++) {
					let session = sessions[i];

					if (!session.hasOwnProperty('failures') || session.failures === []) {
						let panel = this._findPanel(session);

						panel[panelPropsMap[what]] = true;
					}
				}
				await this._updateSessions(sessions);
				await this.showFailures(sessions);
			}
			return sessions;
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
		showFailures: function(sessions) {
			this.error = '';
			this.visibilities.messageVisibility = false;
			for (let i = 0; i < sessions.length; i++) {
				let session = sessions[i];
				let failures = '';
				let sessionLocation = '';

				if (session.hasOwnProperty('name') && session['name'] !== '') {
					sessionLocation = sessionLocation+ session['name'] + '@';
				}
				sessionLocation = sessionLocation + session['tank'];
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