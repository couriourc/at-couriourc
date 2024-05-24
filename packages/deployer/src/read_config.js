const {URL} = require("url")
const {loadConfig} = require("unconfig")
const rRepoURL = /^(?:(git|https?|git\+https|git\+ssh):\/\/)?(?:[^@]+@)?([^\/]+?)[\/:](.+?)\.git$/ // eslint-disable-line no-useless-escape
const rGithubPage = /\.github\.(io|com)$/
const {program} = require("commander")
const pkg = require("../package.json")
const {defaultConfig, defaultRunnerConfig} = require("./config")
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
	if (!cwd) return process.cwd()
	return path.resolve(process.cwd(), cwd)
}

function parseExtendDirs(extendDirs) {
	if (isString(extendDirs)) return [extendDirs]
	return extendDirs ?? []
}

function parsePublicDirs() {

}

async function loadFromFile() {
	return (await loadConfig({
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
				files     : [".deployer", ".deployerc"],
				extensions: ["yaml", "yml"],
				parser(yamlTarget) {
					return yaml.parse(fs.readFileSync(yamlTarget).toString(), {
						version: "next",
					})
				},
			},

		],
		merge  : true,
	})).config
}

/**
 * @return {IRunnerConfig }
 * */
function loadFromArgv() {
	program
		.version(pkg.version)
		.option("-d --deploy", "publish")
	program.parse(process.argv)
	return program.opts()
}

/**
 * @return {Promise<IConfigurations> }
 * */
module.exports = async function () {
	const fromFileConfig = await loadFromFile()
	const fromArgvConfig = await loadFromArgv()
	const config = Object.assign(defaultConfig, fromFileConfig)
	parse("repo", config)
	parse("cwd", config)
	parse("extendDirs", config)
	config.runtime = Object.assign(defaultRunnerConfig, fromArgvConfig)
	return config
}


function parse(key, value) {
	switch (key) {
		case "repo":
			return parseRepo(value["repo"])
		case "cwd":
			return parseCwd(value["cwd"])
		case "extendDirs":
			return parseExtendDirs(value["extendDirs"])
		default:
			return value[key]
	}
}

