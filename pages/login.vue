<template>
	<div class="login-layout">
		<Container fluid class="login-container">
			<Row>
				<Column>
					<Heading :level="3">LDAP авторизация</Heading>
				</Column>
			</Row>
			<Row>
				<Column>
					<Input
						:invalid="!validator.login"
						required
						label="Email"
						v-model="login"
					/>
				</Column>
			</Row>
			<Row>
				<Column>
					<Input
						:invalid="!validator.password"
						type="password"
						required
						label="Password"
						v-model="password"
					/>
				</Column>
			</Row>
			<Row>
				<Column class="button-cln">
					<Button
						@click="handleLogin"
						theme="primary"
						:disabled="!validator.login || !validator.password"
						:icon="loading ? 'actions-spinner' : ''"
					>
						Войти
					</Button>
				</Column>
			</Row>
		</Container>
	</div>
</template>

<script>
import loginRedirect from '../utils/login/loginRedirect';
import Layout from '@ozonui/layout';
import Input from '@ozonui/form-input';
import Button from '@ozonui/custom-button';
import Heading from '@ozonui/heading';

const {
	row: Row,
	column: Column,
	container: Container
} = Layout;

export default {
	middleware: 'anonymous',
	layout: 'login',
	components: {
		Input,
		Button,
		Heading,
		Row,
		Column,
		Container
	},
	head: {
		title: 'Login'
	},
	methods: {
		handleLogin() {
			this.$store.dispatch('authentication/login');
		}
	},
	computed: {
		login: {
			get() {
				return this.$store.getters['authentication/login'];
			},
			set(value) {
				this.$store.commit('authentication/setLogin', value);
			}
		},
		password: {
			get() {
				return this.$store.getters['authentication/password'];
			},
			set(value) {
				this.$store.commit('authentication/setPassword', value);
			}
		},
		loading() {
			return this.$store.getters['authentication/loading'];
		},
		authenticated() {
			return this.$store.getters['authentication/authenticated'];
		},
		validator() {
			return {
				login: !!this.login,
				password: !!this.password
			};
		}
	},
	watch: {
		authenticated(value) {
			if (value) {
				this.$router.push(loginRedirect(this.$route));
			}
		}
	}
};
</script>

<style scoped>
	.login-layout {
		width: 500px;
		flex: 1;
		margin: auto;
		display: flex;
		min-height: 100vh;
		align-items: center;
	}
	.login-container {
		flex: 1;
	}
	.button-cln {
		display: flex;
		justify-content: flex-end;
		padding-top: 20px;
	}
</style>