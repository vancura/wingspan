var autoprefixer = require("gulp-autoprefixer");
var browserSync = require("browser-sync");
var cleants = require("gulp-clean-ts-extends");
var concat = require("gulp-concat");
var del = require("del");
var filelog = require("gulp-filelog");
var gulp = require("gulp");
var imagemin = require("gulp-imagemin");
var minifycss = require("gulp-minify-css");
var pngcrush = require("imagemin-pngcrush");
var rename = require("gulp-rename");
var runSequence = require("run-sequence");
var sass = require("gulp-sass");
var sourcemaps = require("gulp-sourcemaps");
var sprite = require("gulp-sprite-generator");
var ts = require("gulp-typescript");
var uglify = require("gulp-uglify");
var vinylPaths = require("vinyl-paths");
var tsd = require("gulp-tsd");
var typedoc = require("gulp-typedoc");


var proxy = "http://wingspan.192.168.1.111.xip.io";
var srcRoot = "../../";

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
        "dist/js/main.js"
    ]
};

var tsProject = ts.createProject({
    target: "ES5",
    removeComments: false,
    sortOutput: true,
    sourceRoot: "../../../src/ts",
    module: "commonjs"
});


gulp.task("styles", function () {
    "use strict";

    // Compile SCSS.
    return gulp.src(paths.srcSCSS)
        .pipe(sass({errLogToConsole: false, outputStyle: "expanded"}))
        .pipe(autoprefixer("last 2 versions", "safari 6", "ie 10", "opera 12.1", "ios 6", "android 4", "blackberry 10"))
        .pipe(gulp.dest(paths.distCSS));
});


gulp.task("sprites", function () {
    "use strict";

    var spriteOutput;

    // Generate sprite sheets.
    spriteOutput = gulp.src(paths.distCSS + "/main.css")
        .pipe(sprite({
            spriteSheetName: "sprite-sheet.png",
            spriteSheetPath: "../images",
            algorithm: "binary-tree",
            baseUrl: "../../",
            padding: 0
        }));

    // Generate sprite sheet images and optimize them.
    spriteOutput.img
        .pipe(imagemin({optimizationLevel: 0, use: [pngcrush()]}))
        .pipe(gulp.dest(paths.distImages));

    // Minify main.css.
    spriteOutput.css
        .pipe(rename({suffix: ".min"}))
        .pipe(minifycss())
        .pipe(gulp.dest(paths.distCSS))
        .pipe(browserSync.reload({stream: true}));
});


gulp.task("scripts-debug", function () {
    "use strict";

    var tsResult = gulp.src(paths.srcTS, {base: "src/ts"})
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject));

    return tsResult.js
        .pipe(filelog("concat-debug"))
        .pipe(concat("main.js"))
        .pipe(cleants())
        .pipe(sourcemaps.write(".", {sourceRoot: srcRoot + "src/ts", includeContent: false}))
        .pipe(gulp.dest(paths.distJS))
        .pipe(browserSync.reload({stream: true}));
});


gulp.task("scripts-dist", ["scripts-debug"], function () {
    "use strict";

    return gulp.src(paths.distJSList)
        .pipe(filelog("concat-dist"))
        .pipe(concat("main.js"))
        .pipe(rename({suffix: ".min"}))
        .pipe(uglify())
        .pipe(gulp.dest(paths.distJS));
});


gulp.task("docs", function () {
    "use strict";

    return gulp.src(paths.srcTS)
        .pipe(typedoc({
            module: "commonjs",
            out: "./docs",
            name: "px",
            target: "es5"
        }));
});


gulp.task("browser-sync", function () {
    "use strict";

    browserSync({proxy: proxy, logConnections: true, open: false});
});


gulp.task("watch", function () {
    "use strict";

    runSequence("clean", ["styles", "scripts-debug"], "sprites", "browser-sync");

    gulp.watch(paths.srcSCSS, ["styles"]);
    gulp.watch(paths.distCSS + "/main.css", ["sprites"]);
    gulp.watch(paths.srcTS, ["scripts-debug"]);
});


gulp.task("clean", function () {
    "use strict";

    return gulp.src(paths.dist)
        .pipe(vinylPaths(del));
});


gulp.task("tsd", function (callback) {
    "use strict";

    tsd({command: "reinstall", config: "./tsd.json"}, callback);
});


gulp.task("default", function (callback) {
    "use strict";

    runSequence("clean", ["styles", "scripts-dist"], "sprites", callback);
});
