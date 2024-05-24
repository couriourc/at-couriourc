const path = require("node:path")

/**
 * @type {IConfigurations}
 * */
const defaultConfig = {
	cwd       : process.cwd(),
	public: path.resolve(__dirname, "../example"),
	repo      : {
		url   : "https://github.com/Shinigami92/vite-plugin-ts-nameof.git",
		branch: "master",
	},
}

module.exports = defaultConfig
