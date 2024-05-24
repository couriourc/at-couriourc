const {URL} = require("url")
const {loadConfig} = require("unconfig")
const rRepoURL = /^(?:(git|https?|git\+https|git\+ssh):\/\/)?(?:[^@]+@)?([^\/]+?)[\/:](.+?)\.git$/ // eslint-disable-line no-useless-escape
const rGithubPage = /\.github\.(io|com)$/
const {program} = require("commander")
const pkg = require("../package.json")
const defaultConfig = require("./config")
const {isString} = require("underscore")
const yaml = require("yaml")
const fs = require("fs")
const path = require("path")

function parseObjRepo(repo) {
	let url = repo.url
	let branch = repo.branch
	const configToken = repo.token

	if (!branch) {
		branch = testBranch(url)
	}
	if (rRepoURL.test(url)) {
		const match = url.match(rRepoURL)
		const scheme = match[1]

		if (configToken && (scheme === "http" || scheme === "https")) {
			let repoUrl, userToken
			try {
				repoUrl = new URL(url)
			} catch (e) {
				throw new TypeError("Fail to parse your repo url, check your config!")
			}

			if (configToken.startsWith("$")) {
				userToken = process.env[configToken.substring(1)]
				if (!userToken) throw new TypeError("Fail to read environment varable: " + configToken + ", check your config!")
			} else {
				userToken = configToken
			}
			repoUrl.username = userToken
			url = repoUrl.href
		}
	}

	return {
		url   : url,
		branch: branch || "master",
	}
}

function parseStrRepo(repo) {
	const split = repo.split(",")
	const url = split.shift()
	let branch = split[0]

	if (!branch) {
		branch = testBranch(url)
	}

	return {
		url   : url,
		branch: branch || "master",
	}

}

function testBranch(repoUrl) {
	let branch
	if (rRepoURL.test(repoUrl)) {
		const match = repoUrl.match(rRepoURL)
		const host = match[2]
		const path = match[3]

		if (host === "github.com") {
			branch = rGithubPage.test(path) ? "master" : "gh-pages"
		} else if (host === "coding.net") {
			branch = "coding-pages"
		}
	}
	return branch
}

function parseRepo(repo) {
	if (isString(repo)) return parseStrRepo(repo)
	return parseObjRepo(repo)
}

function parseCwd(cwd) {
	if (cwd === process.cwd()) return cwd
	return path.resolve(process.cwd(), cwd)
}

function parseExtendDirs(extendDirs) {
	if (isString(extendDirs)) return [extendDirs]
	return extendDirs ?? []
}

function parsePublicDirs() {

}

async function loadFromFile() {
	const config = (await loadConfig({
		sources: [
			{
				files     : "deployer.config",
				extensions: ["ts", "mts", "js", "cjs", "json"],
			},
			{
				files     : "package.json",
				extensions: [],
				rewrite(config) {
					return config.deployer
				},
			},
			{
				files     : ".deployer",
				extensions: ["yaml"],
				parser(yamlTarget) {
					return yaml.parse(fs.readFileSync(yamlTarget).toString(), {
						version: "next",
					})
				},
			},
		],
		merge  : true,
	})).config
	return config
}

function loadFromArgv() {
	program
		.version(pkg.version)
		.option("-r --repo <repo-url>", "target repo")
		.option("-b --branch [repo-branch]", "target repo branch")
	program.parse(process.argv)
	const args = program.opts()
	return args
}

/**
 * @return {Promise<IConfigurations> }
 * */
module.exports = async function () {
	const fromFileConfig = await loadFromFile()
	const fromArgvConfig = await loadFromArgv()
	const config = Object.assign(defaultConfig, fromFileConfig)

	config.repo = parseRepo(config.repo)
	config.cwd = parseCwd(config.cwd)
	config.extendDirs = parseExtendDirs(config.extendDirs)
	return config
}

function resolveConfig(config) {

	return config
}

function parse(key, value) {
	if (key === "repo") {

	}
	return value
}

function mergeConfig(defaultConfig, ...args) {
	const config = {}
	Object.keys(defaultConfig)
		.forEach((key) => {
			args.forEach((other) => {
				if (!other || !other[key]) return
				config[key] = parse(key, other[key])
			})
		})
	return config
}
