var gulp = require('gulp');
var inject = require('gulp-inject');
var clean = require('gulp-clean');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var tsc = require('gulp-tsc');

var tsconfig = require('./tsconfig.json').compilerOptions;
var project = require('./project.json');

/*
 * CONFIGURATION
 * configure pathes and fronted Dependencies
 */

var paths = {
    webroot: './' + project.webroot + '/',
    www_index: 'index.html',
    www_npm: 'libs/',
    www_styles: 'styles/',
    www_app: 'app/'
};

var frontedNpmDependencies = {
    js: [
        './node_modules/systemjs/dist/system.js',
        './node_modules/systemjs/dist/system-polyfills.js',
        './node_modules/angular2/bundles/angular2-polyfills.js',
        './node_modules/rxjs/bundles/Rx.js',
        './node_modules/angular2/bundles/angular2.js'
    ],
    css: [
        './node_modules/bootstrap/dist/css/bootstrap.min.css',
        './node_modules/bootstrap/dist/css/bootstrap.theme.min.css'
    ]
}

/*
 * GULP MAIN JOBS
 * serve: serves webservice via browsersync, watches scss, ts and html files
 * reloadFrontedNpmDependencies: recopies npmDependencies defined in config to wwwroot
 * injectDependencies: injects css dependencies into index.html + npm css/js dependencies
 */

gulp.task('serve', ['sass'], function () {

    browserSync.init({ server: './wwwroot' });
    gulp.watch(paths.webroot + paths.www_styles + '**/*.scss', ['sass']);
    gulp.watch(paths.webroot + paths.www_app + '**/*.ts', ['ts-watch']);
    gulp.watch(paths.webroot + '/**/*.html').on('change', browserSync.reload);
});

gulp.task('reloadFrontedNpmDependencies', ['cleanFrontedNpmDependencies'], function () {
    gulp.src(frontedNpmDependencies.js).pipe(gulp.dest(paths.webroot + paths.www_npm + 'js/'));
    gulp.src(frontedNpmDependencies.css).pipe(gulp.dest(paths.webroot + paths.www_npm + 'css/'));
});

gulp.task('injectDependencies', function () {

    //Inject Npm Dependencies
    var dependencyPathes = [];
    for (var jsIndex = 0; jsIndex < frontedNpmDependencies.js.length; jsIndex++) {
        var splittedJsName = frontedNpmDependencies.js[jsIndex].split('/');
        dependencyPathes[dependencyPathes.length] = paths.webroot + paths.www_npm + 'js/' + splittedJsName[splittedJsName.length - 1];
    }
    for (var cssIndex = 0; cssIndex < frontedNpmDependencies.css.length; cssIndex++) {
        var splittedCssName = frontedNpmDependencies.css[cssIndex].split('/');
        dependencyPathes[dependencyPathes.length] = paths.webroot + paths.www_npm + 'css/' + splittedCssName[splittedCssName.length - 1];
    }

    //Inject syles
    dependencyPathes[dependencyPathes.length] = paths.webroot + paths.www_styles + '**/*.css';

    gulp.src(paths.webroot + paths.www_index)
        .pipe(inject(gulp.src(dependencyPathes, { read: false }), { relative: true }))
        .pipe(gulp.dest(paths.webroot));
});


/*
 * GULP HELPER
 */
gulp.task('cleanFrontedNpmDependencies', function () {
    return gulp.src(paths.webroot + paths.www_npm, { read: false }).pipe(clean());
});

gulp.task('sass', function () {
    return gulp.src(paths.webroot + paths.www_styles + '**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest(paths.webroot + paths.www_styles+ 'test.css'))
        .pipe(browserSync.stream());
});

gulp.task('ts-watch', ['ts'], browserSync.reload);
gulp.task('ts', function() {
    return gulp.src(paths.webroot + paths.www_app + '**/*.ts')
        .pipe(tsc(tsconfig))
        .pipe(gulp.dest(paths.webroot + paths.www_app));
});

