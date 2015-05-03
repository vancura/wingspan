var autoprefixer = require("gulp-autoprefixer");
var browserSync = require("browser-sync");
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
var uglify = require("gulp-uglify");
var vinylPaths = require("vinyl-paths");


var proxy = "http://localhost";
var srcRoot = "/Users/Vancura/Repos/Projects/ProjectSopwith/project-sopwith/";

var paths = {
    src: "src",
    srcJS: [
        "src/js/globals.js",
        "src/js/objects/*.js",
        "src/js/states/*.js",
        "src/js/main.js"
    ],
    srcSCSS: "src/scss/**/*.scss",

    dist: "dist",
    distCSS: "dist/css",
    distImages: "dist/images",
    distJS: "dist/js",
    distJSList: [
        "src/js-vendor/cocoon.js",
        "components/phaser/build/custom/phaser-no-physics.js",
        "src/js-vendor/box2d-plugin-full-scrambled.js",
        "dist/js/main.js"
    ]
};


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

    return gulp.src(paths.srcJS, {base: "src/js"})
        .pipe(sourcemaps.init())
        .pipe(filelog("concat-debug"))
        .pipe(concat("main.js"))
        .pipe(sourcemaps.write(".", {sourceRoot: srcRoot + "src/js"}))
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


gulp.task("browser-sync", function () {
    "use strict";

    browserSync({proxy: proxy, logConnections: true, open: false});
});


gulp.task("watch", function () {
    "use strict";

    runSequence("clean", ["styles", "scripts-debug"], "sprites", "browser-sync");

    gulp.watch(paths.srcSCSS, ["styles"]);
    gulp.watch(paths.distCSS + "/main.css", ["sprites"]);
    gulp.watch(paths.srcJS, ["scripts-debug"]);
});


gulp.task("clean", function () {
    "use strict";

    return gulp.src(paths.dist)
        .pipe(vinylPaths(del));
});


gulp.task("default", function (callback) {
    "use strict";

    runSequence("clean", ["styles", "scripts-dist"], "sprites", callback);
});
