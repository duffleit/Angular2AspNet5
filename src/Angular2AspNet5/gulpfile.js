var gulp = require('gulp');
var project = require("./project.json");
var inject = require('gulp-inject');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');

var paths = {
    webroot: "./" + project.webroot + "/",
    www_index: "index.html",
    www_external: "externals/"
};

var frontedNpmDependencies = {
    js: [
        "./node_modules/systemjs/dist/system.js",
        "./node_modules/systemjs/dist/system-polyfills.js",
        "./node_modules/angular2/bundles/angular2-polyfills.js",
        "./node_modules/rxjs/bundles/Rx.js",
        "./node_modules/angular2/bundles/angular2.js"
    ],
    css: [
        "./node_modules/bootstrap/dist/css/bootstrap.min.css",
        "./node_modules/bootstrap/dist/css/bootstrap.theme.min.css"
    ]
}

gulp.task('cleanFrontedNpmDependencies', function () {
    return gulp.src(paths.webroot + paths.www_external, { read: false }).pipe(clean());
});

gulp.task('copyFrontedNpmDependencies', function () {
    gulp.src(frontedNpmDependencies.js).pipe(gulp.dest(paths.webroot + paths.www_external + "js/"));
    gulp.src(frontedNpmDependencies.css).pipe(gulp.dest(paths.webroot + paths.www_external + "css/"));
});

gulp.task('injectFrontedNpmDependencies', function () {
    var dependencyPathes = [];
    for (var jsIndex = 0; jsIndex < frontedNpmDependencies.js.length; jsIndex++) {
        var splittedJsName = frontedNpmDependencies.js[jsIndex].split('/');
        dependencyPathes[dependencyPathes.length] = paths.webroot + paths.www_external + "js/" + splittedJsName[splittedJsName.length - 1];
    }
    for (var cssIndex = 0; cssIndex < frontedNpmDependencies.css.length; cssIndex++) {
        var splittedCssName = frontedNpmDependencies.css[cssIndex].split('/');
        dependencyPathes[dependencyPathes.length] = paths.webroot + paths.www_external + "css/" + splittedCssName[splittedCssName.length - 1];
    }

    console.log(dependencyPathes);

    gulp.src(paths.webroot + paths.www_index)
        .pipe(inject(gulp.src(dependencyPathes, { read: false }), { relative: true }))
        .pipe(gulp.dest(paths.webroot));
});

gulp.task("updateFrontedNpmDependencies", function () {
    runSequence("cleanFrontedNpmDependencies", "copyFrontedNpmDependencies", "injectFrontedNpmDependencies");
});