import yaml from 'js-yaml';
import fs from 'fs';
import { getDirname, getFiles, getIdFromFilename, getNrFromId } from './utils.js';

const __dirname = getDirname(import.meta.url);

const inputDir = `${__dirname}/../meta/`;

const files = getFiles(inputDir);

const data = [];

files.forEach((file) => {
    const fileContent = yaml.load(fs.readFileSync(file, 'utf8'));
    fileContent.id = getIdFromFilename(file, 'utf8');
    fileContent.nr = getNrFromId(fileContent.id);
    data.push(fileContent);
});

const outputDir = `${__dirname}/../`;

fs.mkdir(outputDir, { recursive: true }, () => {});
fs.writeFileSync(`${outputDir}meta.json`, JSON.stringify(data));
