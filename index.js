var path = require('path')
, gutil = require('gulp-util')
, through = require('through2')
, crypto = require('crypto')
, fs = require('fs')
, glob = require('glob');

module.exports = function (size, ifile,destFile) {
    size = size | 0;
    destFile = destFile===undefined?ifile:destFile;
    
    var isDestDirectory = fs.lstatSync(destFile).isDirectory();

    return through.obj(function (file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-debug', 'Streaming not supported'));
            return cb();
        }

        if(!file.contents){
            return cb();
        }

        var d = calcMd5(file, size)
        , filename = path.basename(file.path)
        , relativepath = path.relative(file.base ,file.path)
        , sub_namepath = relativepath.replace(new RegExp(filename) , "").split(path.sep).join('/')
        , dir;

        if(file.path[0] == '.'){
            dir = path.join(file.base, file.path);
        } else {
            dir = file.path;
        }
        dir = path.dirname(dir);

        var md5_filename = filename.split('.').map(function(item, i, arr){
            return i == arr.length-2 ? item + '_'+ d : item;
        }).join('.');

        file.path = path.join(dir, md5_filename);

        this.push(file);
        cb();
    }, function (cb) {
        cb();
    });
};


function calcMd5(file, slice){
    var md5 = crypto.createHash('md5');
    md5.update(file.contents, 'utf8');

    return slice >0 ? md5.digest('hex').slice(0, slice) : md5.digest('hex');
}