const gulp = require('gulp')
const zip = require('gulp-zip')
const del = require('del')
const install = require('gulp-install')
const shell = require('gulp-shell')
const minimist = require('minimist')

/**
 * Example:
 *  gulp update --functions 'dev,test,test2' --lambdaLayer 'test'
 *
 * Options:
 *  --functions - all functions (names) that need a code update, ',' separated.
 *  --lambdaLayer - the lambda layer (name) that needs a code update
 */
const options = minimist(process.argv.slice(2))
const lambdaLayer = options.lambdaLayer
const arrFunctions = options.functions.split(',')

// Set project parameters
const nodeDir = './node/'
const projectName = 'dist'
const zipFileName = 'dist.zip'
const zipLayerFilename = 'dist-layer.zip'
// end project parameters

const distDirectory = './dist'

gulp.task('clean-project-layer', function () {
  return del(distDirectory + '/' + projectName + '/*')
    .then(del(distDirectory + '/layer/*'))
})

gulp.task('js-project', function () {
  return gulp.src([nodeDir + 'src/**/*'])
    .pipe(gulp.dest(distDirectory + '/' + projectName + '/'))
})

gulp.task('js-layer-project', function () {
  return gulp.src([nodeDir + 'package.json'])
    .pipe(gulp.dest(distDirectory + '/layer/nodejs'))
})

gulp.task('npm-project-layer', function () {
  return gulp.src(nodeDir + 'package.json')
    .pipe(gulp.dest(distDirectory + '/layer/nodejs'))
    .pipe(install({ production: true }))
})

// nodir, dot added to make sure node modules are zipped correctly!
gulp.task('zip-project', function () {
  return gulp.src([distDirectory + '/' + projectName + '/**/*', '!' + distDirectory + '/' + projectName + '/package.json', distDirectory + '/' + projectName + '/.*'], { nodir: true, dot: true })
    .pipe(zip(zipFileName))
    .pipe(gulp.dest(distDirectory))
})

gulp.task('zip-layer-project', function () {
  return gulp.src(['' + distDirectory + '/layer/**/*', '!' + distDirectory + '/layer/nodejs/package.json', '' + distDirectory + '/layer/.*'], { nodir: true, dot: true })
    .pipe(zip(zipLayerFilename))
    .pipe(gulp.dest(distDirectory))
})

arrFunctions.forEach(function (lambda) {
  console.log('lambda: ' + lambda)
  gulp.task('update_' + lambda, gulp.series(
    shell.task([
      'aws lambda update-function-code --function-name ' + lambda + ' --zip-file fileb://' + projectName + '/' + zipFileName + ' --publish'
    ])
  ))
})

gulp.task('lambdas',
  gulp.parallel(
    arrFunctions.map(function (name) { return 'update_' + name })
  )
)

gulp.task('lambda-layer', gulp.series(
  shell.task([
    'aws lambda publish-layer-version --layer-name ' + lambdaLayer + ' --zip-file fileb://' + projectName + '/' + zipLayerFilename
  ])
))

exports.build = gulp.task('update',
  gulp.series(
    gulp.task('clean-project-layer'),
    gulp.task('js-project'),
    gulp.task('js-layer-project'),
    gulp.task('npm-project-layer'),
    gulp.task('zip-project'),
    gulp.task('zip-layer-project'),
    gulp.parallel('lambdas'),
    gulp.task('lambda-layer')
  ))
