var gulp = require('gulp');
var project = require("./project.json");
var inject = require('gulp-inject');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');

//configuration:

var paths = {
    webroot: "./" + project.webroot + "/",
    nodemodules: "./node_modules/",
    www_libs: "libs/",
    www_index: "index.html"
};

var npmFrontendDependencies = [
    "systemjs/dist/system.js",
    "systemjs/dist/system-polyfills.js",
    "angular2/bundles/angular2-polyfills.js",
    "rxjs/bundles/Rx.js",
    "angular2/bundles/angular2.js"
];

//internal tasks:

gulp.task('cleanWwwLibsFolder', function () {
    return gulp.src(paths.webroot + paths.www_libs, { read: false }).pipe(clean());
});

gulp.task('moveNodeFrontendDependenciesToLib', function () {
    var absolutePathToFrontedDependencies = [];
    for (var index = 0; index < npmFrontendDependencies.length; index++) {
        absolutePathToFrontedDependencies[index] = paths.nodemodules + npmFrontendDependencies[index];
    }

    return gulp.src(absolutePathToFrontedDependencies).pipe(gulp.dest(paths.webroot + paths.www_libs));
});

gulp.task('injectNodeFrontendDependenciesIntoIndex', function () {
    var absolutePathToFrontedDependencies = [];
    for (var index = 0; index < npmFrontendDependencies.length; index++) {
        var splittedPath = npmFrontendDependencies[index].split('/');
        absolutePathToFrontedDependencies[index] = paths.webroot + paths.www_libs + splittedPath[splittedPath.length-1];
    }
    var targetIndexHtml = paths.webroot + paths.www_index;

    gulp.src(targetIndexHtml)
      .pipe(inject(gulp.src(absolutePathToFrontedDependencies, { read: false }), { relative: true }))
      .pipe(gulp.dest(paths.webroot));

});


//public tasks:

gulp.task("updateFrontedDependencies", function () {
    runSequence("cleanWwwLibsFolder", "moveNodeFrontendDependenciesToLib", "injectNodeFrontendDependenciesIntoIndex")
});