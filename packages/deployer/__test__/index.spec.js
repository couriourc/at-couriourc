import {describe, test} from "vitest"

const defaultConfig = require("../bin/config")

const deployer = require("../bin/index")
describe("for get config", () => {
	test("do cli", () => {
		deployer(defaultConfig)

	})
})
