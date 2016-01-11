var gulp = require('gulp');
var jsConcat = require('gulp-concat');

gulp.task('default', ['jsConcat', 'watch']);

gulp.task('jsConcat', function() {
  return gulp.src('./src/**/*.js')
    .pipe(jsConcat('app.js'))
    .pipe(gulp.dest('./public/script'));
});

gulp.task('watch', function() {
  gulp.watch('./src/**/*.js', ['jsConcat']);
});
