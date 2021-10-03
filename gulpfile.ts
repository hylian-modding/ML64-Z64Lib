import gulp from 'gulp';
import fs from 'fs-extra';
import child_process from 'child_process';

gulp.task('build', function () {
    try {
        let meta = JSON.parse(fs.readFileSync("./cores/Z64Lib/package.json").toString());
        meta.date = new Date().toUTCString();
        meta.commit = child_process.execSync("git rev-parse --short HEAD").toString().replace("\n", "");
        meta.version = meta.version.split("-")[0];
        meta.version = meta.version + `-nightly@${meta.commit}`;
        fs.writeFileSync("./cores/Z64Lib/package.json", JSON.stringify(meta, null, 2));
        child_process.execSync('npx tsc');
    } catch (err: any) {
        console.log(err.stack);
    }
    return gulp.src('./src/**/*.ts')
});

gulp.task('remove_nightly_flag', function(){
    try {
        let meta = JSON.parse(fs.readFileSync("./cores/Z64Lib/package.json").toString());
        meta.date = "";
        meta.commit = "";
        meta.version = meta.version.split("-")[0];
        fs.writeFileSync("./cores/Z64Lib/package.json", JSON.stringify(meta, null, 2));
    } catch (err: any) {
        console.log(err.stack);
    }
    return gulp.src('./src/**/*.ts')
});

gulp.task('default', gulp.series(['build']));
