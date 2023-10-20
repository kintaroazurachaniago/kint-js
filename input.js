const { execSync } = require('child_process')
const path         = require('path')
const readline     = require('readline')

const openBase = _ => {
	setTimeout(process.exit, 1000)
	execSync('start cmd.exe ' + path.resolve())
}

const action = data => {
	switch (data) {
	case 'exit': openBase(); break;
	case 're-build':
		try {
			const builder = execSync('start npm run kint')
			console.log(builder.toString())
			console.log('Re-build finished!\r\n')
		} catch (err) {
			console.log('Error: Failed to re-build app!')
		}
		break
	default:
		try {
			const builder = execSync('node kint ' + data);
			console.log(builder.toString())
		} catch (err) {
			console.log('Error: try this command "re-build"')
		}
		break;
	}
}

const input = _ => {
	const interface = readline.createInterface({ input : process.stdin, output : process.stdout })
	interface.question('>>> ', answer => {
		interface.close()
		action(answer)
		input()
	})
}

console.log('Welcome to Kint-js IO')

setTimeout(input, 1000)