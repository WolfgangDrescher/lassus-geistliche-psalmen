import { exec } from 'child_process';
import {
    getDirname,
    getFiles,
    splitInChunks,
    readYaml,
    writeYaml,
    getIdFromFilename,
    mergeDeep,
} from './utils.js';

const __dirname = getDirname(import.meta.url);

const files = getFiles(`${__dirname}/../kern`);

files.forEach((file) => {
    exec(`lyrics ${file}`, (err, stdout, stderr) => {
        if (err) {
            return;
        }
        const piece = {
            voices: {},
        };
        let parts = stdout.split('==');
        piece.title = parts.shift().split(':')[1].trim();
        parts = parts.map(line => {
            return line.trim();
        });
        parts = splitInChunks(parts, 2);
        parts.forEach(([key, lyrics]) => {
            key = key.toLowerCase();
            piece.voices[key] = {};
            piece.voices[key].lyrics = lyrics.split(/(?<=\/)/).map(line => line.trim()).join('\n');
        });
        const id = getIdFromFilename(file);
        const metaFile = `${__dirname}/../meta/${id}.yaml`;
        const metaData = readYaml(metaFile);
        mergeDeep(metaData, {voices: piece.voices});
        writeYaml(metaFile, metaData);
    });
});
