var autoprefixer = require("gulp-autoprefixer");
var browserSync = require("browser-sync");
var concat = require("gulp-concat");
var del = require("del");
var filelog = require("gulp-filelog");
var frep = require("gulp-frep");
var gulp = require("gulp");
var minifycss = require("gulp-minify-css");
var pkg = require("./package.json");
var rename = require("gulp-rename");
var runSequence = require("run-sequence");
var sass = require("gulp-sass");
var sourcemaps = require("gulp-sourcemaps");
var ts = require("gulp-typescript");
var tsLint = require("gulp-tslint");
var uglify = require("gulp-uglify");
var vinylPaths = require("vinyl-paths");
var tsd = require("gulp-tsd");


var proxy = "http://wingspan.192.168.1.111.xip.io";
var srcRoot = "file:///Users/Vancura/Repos/Projects/Wingspan/wingspan/src/ts/";

var paths = {
    src: "src",
    srcTS: "src/ts/**/*.ts",
    srcSCSS: "src/scss/**/*.scss",

    dist: "dist",
    distCSS: "dist/css",
    distImages: "dist/images",
    distJS: "dist/js",
    distJSList: [
        "components/phaser/build/custom/phaser-no-physics.js",
        "src/js-vendor/box2d-plugin-full-scrambled.js",
        "src/js-vendor/particle-storm-scrambled.js",
        "dist/js/main.js"
    ]
};

var tsProject = ts.createProject("tsconfig.json", { typescript: require("typescript") });


gulp.task("styles", function () {
    "use strict";

    // Compile SCSS.
    return gulp.src(paths.srcSCSS)
        .pipe(sass({
            errLogToConsole: false,
            outputStyle: "expanded"
        }))
        .pipe(autoprefixer("last 2 versions", "safari 6", "ie 10", "opera 12.1", "ios 6", "android 4", "blackberry 10"))
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(minifycss())
        .pipe(gulp.dest(paths.distCSS))
        .pipe(browserSync.reload({
            stream: true
        }));
});


gulp.task("tslint", function () {
    "use strict";

    return gulp.src(paths.srcTS)
        .pipe(tsLint({}))
        .pipe(tsLint.report("verbose"));
});


gulp.task("scripts-debug", function () {
    "use strict";

    var patterns = [{
        pattern: /%VERSION%/g,
        replacement: pkg.version + " (" + new Date().toGMTString() + ")"
    }];

    var tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject));

    return tsResult.js
        .pipe(sourcemaps.write(".", {
            sourceRoot: srcRoot,
            includeContent: false
        }))
        .pipe(frep(patterns))
        .pipe(gulp.dest("."))
        .pipe(browserSync.reload({
            stream: true
        }));
});


gulp.task("scripts-dist", ["scripts-debug"], function () {
    "use strict";

    return gulp.src(paths.distJSList)
        .pipe(filelog("concat-dist"))
        .pipe(concat("main.js"))
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(uglify())
        .pipe(gulp.dest(paths.distJS));
});


gulp.task("browser-sync", function () {
    "use strict";

    browserSync({
        proxy: proxy,
        logConnections: true,
        open: false
    });
});


gulp.task("watch", function () {
    "use strict";

    runSequence("clean", ["styles", "scripts-debug"], "browser-sync");

    gulp.watch(paths.srcSCSS, ["styles"]);
    gulp.watch(paths.srcTS, ["scripts-debug"]);
});


gulp.task("clean", function () {
    "use strict";

    return gulp.src(paths.dist)
        .pipe(vinylPaths(del));
});


gulp.task("tsd", function (callback) {
    "use strict";

    tsd({
        command: "reinstall",
        config: "./tsd.json"
    }, callback);
});


gulp.task("default", function (callback) {
    "use strict";

    runSequence("clean", "tslint", ["styles", "scripts-dist"], callback);
});
