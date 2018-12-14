const INJECTION_NAME = 'buildInfo';

export default async function api({app: {$env: {commit}}}, inject) {
	inject(INJECTION_NAME, {
		text: `Build: ${commit}`,
		commit: commit
	});
}
