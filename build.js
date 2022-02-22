const yaml = require('js-yaml');
const fs = require('fs');

function getFiles (dir, files_){
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files){
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()){
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
}

const inputDir = './meta/';

const files = getFiles(inputDir);

const data = [];

files.forEach(file => {
    const fileContent = yaml.load(fs.readFileSync(file, 'utf8'));
    fileContent.id = file.split(/[\\\/]/).pop().replace('.yaml', '');
    fileContent.nr = parseInt(fileContent.id.substring(0,2), 10);
    data.push(fileContent);
});

const outputDir = './';

fs.mkdir(outputDir, { recursive: true }, () => {});
fs.writeFileSync(`${outputDir}meta.json`, JSON.stringify(data));
