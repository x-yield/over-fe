<template>
	<div id="overload">
		<template>
			<app-header/>
		</template>
		<v-container fluid>
			<v-alert type="error" :value="error !== ''">{{ error }}</v-alert>
			<firestarter-panel :mycontent="panels" @remove="removePanel"/>
			<v-card color="cyan">
				<v-layout class="justify-space-around" @click="createPanel">
					<v-icon color="white" size="23">add</v-icon>
				</v-layout>
			</v-card>
			<v-layout class="align-end justify-end row mt-3">
				<v-spacer/>
				<v-btn
					id="validateButton"
					@click="validate"
					v-show="visibilities.validateButtonVisibility"
					color="pink darken-1"
					:loading="loading"
					:disabled="loading">Validate</v-btn>
				<v-btn
					id="prepareButton"
					@click="prepare"
					v-show="visibilities.prepareButtonVisibility"
					color="amber"
					:loading="loading"
					:disabled="loading">Prepare</v-btn>
				<v-btn
					id="runButton"
					@click="run"
					v-show="visibilities.runButtonVisibility"
					color="green darken-1"
					:loading="loading"
					:disabled="loading">Run</v-btn>
				<v-btn
					id="stopButton"
					@click="stop"
					v-show="visibilities.stopButtonVisibility"
					color="red"
					:loading="loading"
					:disabled="loading">Stop</v-btn>
			</v-layout>
		</v-container>
	</div>
</template>

<script>
import AppHeader from '../components/AppHeader';
import FirestarterPanel from '../components/FirestarterPanel.vue';

export default {
	data() {
		return {
			loading: false,
			error: '',
			success: null,
			sessions: [],
			panels: [],
			visibilities:{
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
		// returns either panel or session by finding single match between them
		_findItem: function(array, objectToCompareWith) {
			let resultObject = {};

			array.forEach(
				item => {
					if (item.externalId === objectToCompareWith.externalId) {
						resultObject = item;
					}
				}
			);
			return resultObject;
		},
		createPanel: function() {
			let maxId = 0;

			if (this.panels.length > 0) {
				this.panels.forEach(
					panel => {
						if (panel.externalId > maxId) {
							maxId = panel.externalId;
						}
					}
				);
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
				'validationOK': true,
				'preparationOK': true,
				'startedOK': true,
				'finishedOK': true,
				'step': 1,
			});
			this.sessions.push({
				'tank': '',
				'conf': '',
				'stage': '',
				'status': '',
				'failures': [],
				'externalId': externalId,
			});
			this.activateButton('prepareButtonVisibility', 'validateButtonVisibility');
		},
		removePanel: function(externalId) {
			this.panels.forEach(
				panel => {
					if (panel.externalId === externalId) {
						this.panels.splice(this.panels.indexOf(panel), 1);
					}
				}
			);
		},
		_perform: function(action, sessions) {
			// need to wait for this actions to complete
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
			sessions.forEach(
				newSessionsData => {
					let s = this._findItem(this.sessions, {'externalId': newSessionsData.externalId});

					for (let k in newSessionsData) {
						s[k] = newSessionsData[k];
					}
				}
			);
		},
		validate: async function() { // validates not valid panels. locks panel once it is valid;
			this.loading = true;
			let sessionsToValidate = [];

			this.panels.forEach(
				panel => {
					if (!panel.valid) {
						let session = this._findItem(this.sessions, panel);

						session['tank'] = document.getElementById('tankInput_'+session.externalId).value;
						session['conf'] = document.getElementById('confInput_'+session.externalId).value;
						session['externalId'] = panel.externalId;
						sessionsToValidate.push(session);
					}
				}
			);
			this.setStyles(sessionsToValidate, 'validate');
		},
		prepare: async function() { // needs polling
			this.loading = true;
			let sessionsToPrepare = [];

			this.panels.forEach(
				panel => {
					if (panel.valid && !panel.prepared) {
						let session = this._findItem(this.sessions, panel);

						sessionsToPrepare.push(session);
					}
				}
			);
			this.setStyles(sessionsToPrepare, 'prepare');
		},
		run: async function() { // needs polling
			this.loading = true;
			let sessionsToRun = [];

			this.panels.forEach(
				panel => {
					if (panel.valid && panel.prepared && !panel.running) {
						let session = this._findItem(this.sessions, panel);

						sessionsToRun.push(session);
					}
				}
			);
			this.setStyles(sessionsToRun, 'run');
		},
		stop: async function() { // needs polling
			this.loading = true;
			let sessionsToStop = [];

			this.panels.forEach(
				panel => {
					if (panel.valid && panel.prepared && panel.running && !panel.stopped) {
						let session = this._findItem(this.sessions, panel);

						sessionsToStop.push(session);
					}
				}
			);
			this.setStyles(sessionsToStop, 'stop');
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
		setStyles: async function(sessions, thisStage) {
			let currentStage = {};

			switch (thisStage) {
				case 'validate':
					currentStage['stepperCompleted'] = 'valid';
					currentStage['stepperError'] = 'validationOK';
					currentStage['stepNum'] = 2;
					currentStage['previousStage'] = 'validateButtonVisibility';
					currentStage['nextStage'] = 'prepareButtonVisibility';
					break;
				case 'prepare':
					currentStage['stepperCompleted'] = 'prepared';
					currentStage['stepperError'] = 'preparationOK';
					currentStage['stepNum'] = 3;
					currentStage['previousStage'] = 'prepareButtonVisibility';
					currentStage['nextStage'] = 'runButtonVisibility';
					break;
				case 'run':
					currentStage['stepperCompleted'] = 'running';
					currentStage['stepperError'] = 'startedOK';
					currentStage['stepNum'] = 4;
					currentStage['previousStage'] = 'runButtonVisibility';
					currentStage['nextStage'] = 'stopButtonVisibility';
					break;
				case 'stop':
					currentStage['stepperCompleted'] = 'stopped';
					currentStage['stepperError'] = 'finishedOK';
					currentStage['stepNum'] = 1;
					currentStage['previousStage'] = 'stopButtonVisibility';
					currentStage['nextStage'] = 'validateButtonVisibility';
					break;
			}

			sessions = await this._perform(thisStage, sessions);

			sessions.forEach(
				session => {
					let panel = this._findItem(this.panels, session);

					if (!session.hasOwnProperty('failures') || session.failures.length === 0) {
						// set all to OK in stepper and switch to next stage
						if (currentStage['stepNum'] !== 1) {
							panel.locked = true;
						}
						panel[currentStage['stepperCompleted']] = true;
						panel.step = currentStage['stepNum'];
					} else {
						//throw an error in stepper
						panel[currentStage['stepperError']] = false;
					}
				}
			);

			await this.showFailures(sessions);
			await this._updateSessions(sessions);
			if (!this.error) {
				this.activateButton(currentStage['previousStage'], currentStage['nextStage']);
			}
			this.loading = false;
		},
		_sleep: function(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		},
		_waitFor: async function(what, sessions) {
			let reached = true;
			let finished = false;

			sessions = await this.poll(sessions);
			sessions.forEach(
				session => {
					if (session['stage'] !== what) {
						reached = false;
					}
					if (session['stage'] === 'finished') {
						finished = true;
					}
				}
			);
			await this.showFailures(sessions);
			if (!reached && !finished) {
				await this._sleep(1000);
				return this._waitFor(what, sessions);
			}
			return sessions;
		},
		activateButton: function(previousAction, nextAction) {
			this.visibilities[previousAction] = false;
			this.visibilities[nextAction] = true;
		},
		showFailures: function(sessions) {
			// to clean previous error
			this.error = '';
			this.visibilities.messageVisibility = false;

			sessions.forEach(
				session => {
					let failures = '';
					let sessionLocation = '';

					if (session.hasOwnProperty('name') && session['name'] !== '') {
						sessionLocation += session['name'] + '@';
						sessionLocation += session['tank'] + ': ';
					}

					// formatting error message
					if (session['status'] === 'failed' || (session.hasOwnProperty('failures') && session['failures'].length > 0)) {
						failures += sessionLocation;
						session['failures'].forEach(
							fail => {
								failures += fail + '; \n';
							}
						);
						this.error += failures;
					}
				}
			);
		},
	},
};
</script>