const read_config = require("../bin/read_config")
import {describe, it} from "vitest"

describe("for get config", () => {
	it("should be object", () => {
		read_config(process.argv)
			.then((config) => {
				console.log(config)
			})
	})
})
