require('dotenv').config();
const pkg = require('./package');

module.exports = {
	env: {
		commit: process.env.BUILD_INFO || 'Develop version'
	},
	server: {
		port: 3020,
		host: '0.0.0.0'
	},
	head: {
		title: pkg.name,
		meta: [
			{charset: 'utf-8'},
			{name: 'viewport', content: 'width=device-width, initial-scale=1'},
			{hid: 'description', name: 'description', content: pkg.description}
		],
		link: [
			{rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'}
		]
	},
	loading: {color: '#fff'},
	build: {
		transpile: [
			/@ozonui/
		],
		vendor: ['vue2-ace-editor'],
		postcss: [
			require('postcss-preset-env')(),
			require('postcss-import')(),
			require('postcss-url')(),
			require('postcss-nested')() // .postcssrc
		],
		extend(config, {isDev, isClient}) {
			if (isDev && isClient) {
				config.devtool = 'inline-cheap-source-map';
			}
		}
	},
	plugins: [
		'~/plugins/api',
		'~/plugins/buildInfo',
		'~/plugins/authentication'
	],
	modules: [
		['@ozon/environment-nuxt-module', {absolutePath: __dirname, defaultConfigPath: 'config.dev.json'}],
		'@nuxtjs/vuetify'
	],
	module: {
	},
};
