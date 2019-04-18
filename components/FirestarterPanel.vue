<template>
	<div>
		<v-layout class="align-end justify-end row mb-1">
			<v-btn color="cyan darken-1" dark @click="none">Collapse all</v-btn>
		</v-layout>
		<v-expansion-panel color="cyan" v-model="openedPanels" expand>
			<v-expansion-panel-content v-for="panel in mycontent" :key="panel.clientId">
				<template slot="header">
					<v-flex shrink>
						<v-icon @click="removePanel(panel.clientId)">delete</v-icon>
					</v-flex>
					<v-flex>
						<v-stepper class="elevation-0" :value="panel.step">
							<v-stepper-header>
								<v-stepper-step
									step="1"
									color="blue lighten-2"
									colorComplete="light-green"
									:complete="panel.valid"
									:rules="[() => panel.validationOK]">Validation</v-stepper-step>
								<v-divider/>
								<v-stepper-step
									step="2"
									color="amber"
									:complete="panel.prepared"
									:rules="[() => panel.preparationOK]">Preparation</v-stepper-step>
								<v-divider/>
								<v-stepper-step
									step="3"
									color="green"
									:complete="panel.running"
									:rules="[() => panel.startedOK]">Started</v-stepper-step>
								<v-divider/>
								<v-stepper-step
									step="4"
									color="purple lighten-2"
									:complete="panel.stopped"
									:rules="[() => panel.finishedOK]">Finished</v-stepper-step>
							</v-stepper-header>
						</v-stepper>
					</v-flex>
				</template>
				<v-card class="pl-3 pr-3">
					<v-flex sm12 md4>
						<v-text-field
							:id='"tankInput_"+panel.clientId'
							label="Tank address"
							dark
							solo
							:disabled="panel.locked"/>
					</v-flex>
					<v-flex sm12 lg12 class="pb-3">
						<v-textarea
							:id='"confInput_"+panel.clientId'
							label="Tank config"
							autoGrow
							dark
							solo
							:disabled="panel.locked"/>
					</v-flex>
				</v-card>
			</v-expansion-panel-content>
		</v-expansion-panel>
	</div>
</template>

<script>
export default {
	name: 'FirestarterPanel',
	props: {
		mycontent: {
			type: Array,
			default: null,
		}
	},
	data() {
		return {
			openedPanels: [],
			content: '',
		};
	},
	methods: {
		none() {
			this.openedPanels = [];
		},
		removePanel(clientId) {
			this.$emit('remove', clientId);
		},
	},
};
</script>

<style scoped>
</style>