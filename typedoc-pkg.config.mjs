/**
 * @type {import("@typhonjs-typedoc/typedoc-pkg").GenerateConfig[]}
 */
const config = [
	// Basic example of API linking configured automatically with the local `package.json`.
	{
		linkPlugins   : ["es", "dom"],
		output        : "docs",
		monoRepo      : true,
		path          : "packages",
		typedocOptions: {
			entryPointStrategy        : "packages",
			externalPattern           : [
				"**/node_modules/**",
			],
			plugin                    : [
				"typedoc-plugin-merge-modules",
				"typedoc-plugin-particles",
			],
			watch                     : true,
			theme                     : "default",
			particlesOptions          : {},
		},
	},
]

export default config
