const path = require("node:path")

/**
 * @type {IConfigurations}
 * */
const defaultConfig = {
	cwd        : path.resolve(process.cwd(), "."),
	public     : path.resolve(__dirname, "../example"),
	repo       : {
		url   : "",
		branch: "master",
	},
	concurrency: 2,
}

/**@type {IRunnerConfig}*/
const defaultRunnerConfig = {
	deploy: false,
}

module.exports = {defaultConfig, defaultRunnerConfig}
