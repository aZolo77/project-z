const gulp = require('gulp');
const sass = require('gulp-sass');
const minifyCSS = require('gulp-csso');
const concat = require('gulp-concat');

// стили
gulp.task('scss', () => {
  return gulp
    .src('dev/scss/**/*.scss')
    .pipe(sass())
    .pipe(minifyCSS())
    .pipe(gulp.dest('public/css'));
});

// скрипты
gulp.task('scripts', () => {
  return gulp
    .src([
      'dev/lib/jquery.min.js',
      'dev/js/scripts.js',
      'dev/js/gameFuncs.js',
      'dev/js/tts.js'
    ])
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('public/js'));
});

gulp.task('default', ['scss', 'scripts'], () => {
  gulp.watch('dev/scss/**/*.scss', ['scss']);
  gulp.watch('dev/js/**/*.js', ['scripts']);
});
