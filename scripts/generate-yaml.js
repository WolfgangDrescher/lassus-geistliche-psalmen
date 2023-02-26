import {
    getDirname,
    getFiles,
    getIdFromFilename,
    writeYaml,
 } from './utils.js';
import { existsSync } from 'node:fs';

const __dirname = getDirname(import.meta.url);
const files = getFiles(`${__dirname}/../kern`);

files.forEach((file) => {
    const id = getIdFromFilename(file);
    const metaFile = `${__dirname}/../meta/${id}.yaml`;
    if (!existsSync(metaFile)) {
        writeYaml(metaFile, {});
    }
});
