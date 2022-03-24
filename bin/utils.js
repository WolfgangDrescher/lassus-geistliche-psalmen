import fs from 'fs';

export function getFiles(directory, fileList) {
    fileList = fileList || [];
    const files = fs.readdirSync(directory);
    for (let i in files) {
        const name = `${directory}/${files[i]}`;
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, fileList);
        } else {
            fileList.push(name);
        }
    }
    return fileList;
}
