const {URL} = require("url")
const {loadConfig} = require("unconfig")
const rRepoURL = /^(?:(git|https?|git\+https|git\+ssh):\/\/)?(?:[^@]+@)?([^\/]+?)[\/:](.+?)\.git$/ // eslint-disable-line no-useless-escape
const rGithubPage = /\.github\.(io|com)$/
const {program} = require("commander")
const pkg = require("../package.json")
const defaultConfig = require("./config")
const {isString} = require("underscore")

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

/**
 * @return {Promise<IConfigurations> }
 * */
module.exports = async function (args) {
	program
		.version(pkg.version)
		.option("-r --repo <repo-url>", "target repo")
		.option("-b --branch [repo-branch]", "target repo branch")
	program.parse(process.argv)

	const fromFileConfig = (await loadConfig({
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
		],
		merge  : true,
	})).config

	const config = Object.assign(defaultConfig, fromFileConfig)
	config.repo = parseRepo(config.repo)

	return config
}

