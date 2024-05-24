const gulp = require("gulp")
const gulpIf = require("gulp-if")
const uglify = require("gulp-uglify")
const babel = require("gulp-babel")
const minify = () => [
	uglify(),
]
const common = () => [
	babel({
		presets: ["@babel/env"],
	}),
]
gulp.task("build",
	() => gulp.src(["./src/*.js"])
		.pipe(...common())
		.pipe(...minify())
		.pipe(gulp.dest("./bin")))

gulp.task("dev",
	() => gulp.watch(
		["./src/*.js"],
		() => gulp.src(["./src/*js"])
			.pipe(...common())
			.pipe(...minify())
			.pipe(gulp.dest("./bin"))),
)
