import {
    getDirname,
    getFiles,
    getIdFromFilename,
    getNrFromId,
    readYaml,
    writeJson,
 } from './utils.js';

const __dirname = getDirname(import.meta.url);

const files = getFiles(`${__dirname}/../meta/`);

const data = [];

files.forEach((file) => {
    const fileContent = readYaml(file);
    fileContent.id = getIdFromFilename(file);
    fileContent.nr = getNrFromId(fileContent.id);
    data.push(fileContent);
});

writeJson(`${__dirname}/../meta.json`, data);
