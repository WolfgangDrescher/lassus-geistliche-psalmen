import yaml from 'js-yaml';
import fs from 'fs';
import { getDirname, getFiles } from './utils.js';

const __dirname = getDirname(import.meta.url);

const inputDir = `${__dirname}/../meta/`;

const files = getFiles(inputDir);

const data = [];

files.forEach((file) => {
    const fileContent = yaml.load(fs.readFileSync(file, 'utf8'));
    fileContent.id = file
        .split(/[\\\/]/)
        .pop()
        .replace('.yaml', '');
    fileContent.nr = parseInt(fileContent.id.substring(0, 2), 10);
    data.push(fileContent);
});

const outputDir = `${__dirname}/../`;

fs.mkdir(outputDir, { recursive: true }, () => {});
fs.writeFileSync(`${outputDir}meta.json`, JSON.stringify(data));
