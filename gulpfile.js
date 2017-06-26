const gulp  = require('gulp');
const exec  = require('child_process').exec;
const mocha = require('gulp-mocha');

gulp.task('compile:watch', function() {
  exec('tsc --watch');
});

gulp.task('test:watch', [ 'compile:watch' ], () =>
  gulp.src('./tests/**/**/*.test.js', { read: false })
    .pipe(mocha({
      require  : [ 'before-tests.js' ],
      compilers: [ 'js:babel-register' ],
      watch    : true
    }))
);