const path = require("path")
const {DateTime} = require("luxon")
const process = require("process")
const nunjucks = require("nunjucks")
const read_config = require("./read_config.js")
const DebugLogger = require("debug-logger")
// const {IConfigurations} = require("./types")
const {underline} = require("picocolors")
const {spawn} = require("hexo-util")
const fs = require("hexo-fs")
const Promise = require("bluebird")

//const { spawn } = require();
const logger = DebugLogger("deployer")

const helpers = {
	/**
	 * @param {string} format
	 * */
	now: function (format) {
		return DateTime.now().toFormat(format)
	},
	/**
	 * @param {string} commite_message
	 * */
	commitMessage(commite_message) {
		const message = commite_message || "Site updated: {{ now(\"yyyy-MM-dd HH:mm:ss\") }}"
		return nunjucks.renderString(message, helpers)
	},
}
const main = (
	/**@type {IConfigurations}*/
	config,
) => {
	/**@type {string}*/
	const baseDir = config.cwd
	/**@type {string}*/
	const publicDir = config.public
	/**@type {string}*/
	const deployDir = path.join(baseDir, ".deploy_git")
	/**@type {string[]}*/
	let extendDirs = []
	const verbose = !config.silent
	const ignoreHidden = config.ignore_hidden
	const ignorePattern = config.ignore_pattern
	const message = helpers.commitMessage(config.commit_message)
	const repo = config.repo
	// && !args.repository

	if (!repo) {
		let help = ""

		help += "You have to configure the deployment settings in _config.yml first!\n\n"
		help += "Example:\n"
		help += "  deploy:\n"
		help += "    type: git\n"
		help += "    repo: <repository url>\n"
		help += "    branch: [branch]\n"
		help += "    message: [message]\n\n"
		help += "    extend_dirs: [extend directory]\n\n"
		help += "For more help, you can check the docs: " + underline("https://hexo.io/docs/deployment.html")

		console.warn(help)
		return
	}

	function git(...args) {
		return spawn("git", args, {
			cwd    : deployDir,
			verbose: verbose,
			stdio  : "inherit",
		})
	}

	async function setNameEmail() {
		const userName = config.username
		const userEmail = config.email

		userName && await git("config", "user.name", userName)
		userEmail && await git("config", "user.email", userEmail)
	}

	async function setup() {
		// Create a placeholder for the first commit
		fs.writeFileSync(path.join(deployDir, "placeholder"), "")
		await git("init")
		await setNameEmail()
		await git("add", "-A")
		await git("commit", "-m", "First commit")
	}

	async function push(repo) {
		await setNameEmail()
		await git("add", "-A")
		await git("commit", "-m", message).catch(() => {
			// Do nothing. It's OK if nothing to commit.
		})
		await git("push", "-u", repo.url, "HEAD:" + repo.branch, "--force")
	}


	return fs.exists(deployDir)
		.then((exist) => {
			if (exist) return Promise.resolve()
			logger.info("Setting up Git deployment...")
			return setup()
		})
		.then(() => {
			logger.info("Clearing .deploy_git folder...")
			return fs.emptyDir(deployDir)
		}).then(() => {
			const opts = {}
			logger.info("Copying files from public folder...")
			if (typeof ignoreHidden === "object") {
				opts.ignoreHidden = ignoreHidden.public
			} else {
				opts.ignoreHidden = ignoreHidden
			}

			if (typeof ignorePattern === "string") {
				opts.ignorePattern = new RegExp(ignorePattern)
			} else if (typeof ignorePattern === "object" && Reflect.apply(Object.prototype.hasOwnProperty, ignorePattern, ["public"])) {
				opts.ignorePattern = new RegExp(ignorePattern.public)
			}
			return fs.copyDir(publicDir, deployDir, opts)
		}).then(() => {
			logger.info("Copying files from extend dirs...")
			const mapFn = function (dir) {
				const opts = {}
				const extendPath = path.join(baseDir, dir)
				const extendDist = path.join(deployDir, dir)

				if (typeof ignoreHidden === "object") {
					opts.ignoreHidden = ignoreHidden[dir]
				} else {
					opts.ignoreHidden = ignoreHidden
				}

				if (typeof ignorePattern === "string") {
					opts.ignorePattern = new RegExp(ignorePattern)
				} else if (typeof ignorePattern === "object" && Reflect.apply(Object.prototype.hasOwnProperty, ignorePattern, [dir])) {
					opts.ignorePattern = new RegExp(ignorePattern[dir])
				}

				return fs.copyDir(extendPath, extendDist, opts)
			}

			return Promise.map(extendDirs, mapFn, {
				concurrency: config.concurrency,
			})
		}).each(repo => {
			return push(repo)
		})


}
read_config(process.argv)
	.then((
		/**@type {IConfigurations}*/
		config,
	) => {
		main(config)
	})
module.exports = main
