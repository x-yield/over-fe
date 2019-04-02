<template>
	<v-expansion-panel-content>
		<template v-slot:header>
			<div>None</div>
		</template>
		<br/>
		<label for="tankInput">танк</label>
		<input name="tank" id="tankInput" type="text" value="" style="width: 100%"/>
		<br/>
		<label for="confInput">конфиг</label>
		<textarea name="conf" id="confInput" rows="10" style="width: 100%"></textarea>

		<span id="validLabel" v-show="visibilities.validLabelVisibility"></span>
	</v-expansion-panel-content>
</template>

<script>

export default {
	name: 'FirestarterPanel',
	data() {
		return {
			loading: false,
			error: '',
			success: null,
			session: [],

			stage: '',

			visibilities: {
				validLabelVisibility: true,
				preparedLabelVisibility: false,
				runningLabelVisibility: false,
				stoppedLabelVisibility: false,
			},
		};
	},
	methods: {
		perform: async function(action) {
			let waitMap = {
				'prepare': 'prepare',
				'run': 'poll',
				'stop': 'finished',
			};

			return this.$api.post('/firestarter/' + action, JSON.stringify({'sessions': this.sessions}))
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
				this.showLabel('valid', true);
				this.$emit(true);
				this.loading = false;
			} else {
				this.showLabel('valid', false);
				this.$emit(false);
				this.loading = false;
			}
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
				this.$emit(true);
				this.showLabel(nextActionMap[what], false);
				this.loading = false;
				return;
			}
			if (!reached && !finished) {
				await this.sleep(1000);
				return this.waitFor(what);
			} else {
				this.loading = false;
				if (nextActionMap.hasOwnProperty(what)) {
					this.$emit(true);
					this.showLabel(nextActionMap[what], true);
				}
			}
		},
		showLabel: function(labelType, success) {
			let validLabel = document.getElementById('validLabel');

			switch (labelType) {
				case 'validate':
					if (success) {
						validLabel.setAttribute('style', 'background-color: green;');
					} else {
						validLabel.setAttribute('style', 'background-color: red;');
					}
					this.visibilities.validLabelVisibility = true;
					break;
				case 'prepare':
					this.visibilities.preparedLabelVisibility = true;
					break;
				case 'run':
					this.visibilities.runningLabelVisibility = true;
					break;
				case 'stop':
					this.visibilities.stoppedLabelVisibility = true;
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
					sessionLocation = sessionLocation + session['name'] + '@';
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
	}
};
</script>

<style scoped>

</style>