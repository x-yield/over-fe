<template>
	<v-expansion-panel-content :readonly="locked">
		<template v-slot:actions>
			<v-icon color="primary">$vuetify.icons.expand</v-icon>
		</template>
		<template v-slot:header>
			<v-stepper>
				<v-stepper-header>
					<v-stepper-step :rules="[() => validationOK]" :complete="valid" step="V">&nbsp;Validation</v-stepper-step>
					<v-divider/>
					<v-stepper-step :rules="[() => preparationOK]" :complete="prepared" step="P">&nbsp;Preparation</v-stepper-step>
					<v-divider/>
					<v-stepper-step :complete="running" step="S">&nbsp;Started</v-stepper-step>
				</v-stepper-header>
			</v-stepper>
		</template>
		<br/>
		<label :for='"tankInput_"+externalId'>танк</label>
		<input name="tank" :disabled="locked" :id='"tankInput_"+externalId' type="text" value="" style="width: 100%"/>
		<br/>
		<label :for='"confInput_"+externalId'>конфиг</label>
		<textarea name="conf" :id='"confInput_"+externalId' rows="10" style="width: 100%"></textarea>
	</v-expansion-panel-content>
</template>

<script>
import '@ozonui/layout/src/grid.css';
import '@ozonui/form-input';
import '@ozonui/custom-button';

export default {
	name: 'FirestarterPanel',
	props: {
		externalId: {
			type: String,
			default: ''
		},
		valid: {
			type: Boolean,
			default: false,
		},
		prepared: {
			type: Boolean,
			default: false,
		},
		running: {
			type: Boolean,
			default: false,
		},
		stopped: {
			type: Boolean,
			default: false,
		},
		locked: {
			type: Boolean,
			default: false,
		},
		validationOK: {
			type: Boolean,
			default: true,
		},
		preparationOK: {
			type: Boolean,
			default: true,
		},
	},
	data() {
		return {

		};
	}
};
</script>

<style scoped>

	.v-stepper {
		box-shadow: none;
	}

</style>