// see types of prompts:
// https://github.com/enquirer/enquirer/tree/master/examples
//
const fs = require("fs")
console.log(fs.readdirSync(process.cwd()))
module.exports = [
	{
		"type" : "input",
		message: "Pick your packages dir",
	},
	{
		type   : "input",
		name   : "packagePrefix",
		initial: "@couriourc",
	},
	{
		type   : "input",
		name   : "name",
		message: "Please input name",
		skip   : false,
	}, {
		type   : "input",
		name   : "summary",
		message: "Please input summary",
	}, {
		type   : "input",
		name   : "author",
		message: "Please input author",
	}, {
		type   : "input",
		name   : "email",
		message: "Please input email",
	},
]
