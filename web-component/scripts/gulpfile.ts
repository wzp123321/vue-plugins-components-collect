const gulp = require('gulp')
const sass = require('gulp-sass')(require('sass')) // sass -> css
const minifyCSS = require('gulp-minify-css')
const cssmin = require('gulp-cssmin')
const { join } = require('path')

gulp.task('sass-all', async () => {
    console.log('开始打包总入口css任务')
    return gulp.src('../packages/components/styles/*.scss')
        .pipe(sass())
        .pipe(minifyCSS())
        .pipe(gulp.dest('../packages/dist/styles'))
})

// gulp.task('sass-css', async () => {
//     console.log('开始打包css-css目录任务')
//     return gulp.src('../packages/components/styles/css/*.scss')
//         .pipe(sass())
//         .pipe(minifyCSS())
//         .pipe(gulp.dest('../packages/dist/styles/css'))
// })

gulp.task('sass-element', async () => {
    console.log('开始打包css-element目录任务')
    return gulp.src('../packages/components/styles/element/*.scss')
        .pipe(sass({
            includePaths: [
                join(__dirname + '../', 'node_modules')
            ]
        }))
        .pipe(minifyCSS())
        .pipe(gulp.dest('../packages/dist/styles/element'))
})

gulp.task('fonts', async () => {
    console.log('开始打包fonts任务')
    return gulp.src('../packages/components/assets/fonts/**')
    .pipe(cssmin())
    .pipe(gulp.dest('../packages/dist/assets/fonts'));
});

gulp.task('default', gulp.series(gulp.parallel('sass-all', 'sass-element', 'fonts')))