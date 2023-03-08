import { execSync } from 'child_process';
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
    const stdout = execSync(`lyrics ${file}`);

    const piece = {
        voices: {},
    };
    let parts = stdout.toString().split('==');
    parts.shift();
    parts = parts.map(line => {
        return line.trim();
    });
    parts = splitInChunks(parts, 2);
    parts.forEach(([key, lyrics]) => {
        key = key.toLowerCase();
        piece.voices[key] = {};
        // Positive lookbehind: (?<=Y)X, matches X, but only if there’s Y before it.
        piece.voices[key].lyrics = lyrics.split(/(?<=\/)|(?<=\.)/).map(line => line.trim()).join('\n');
    });
    const id = getIdFromFilename(file);
    const metaFile = `${__dirname}/../meta/${id}.yaml`;
    const metaData = readYaml(metaFile);
    mergeDeep(metaData, {voices: piece.voices});
    writeYaml(metaFile, metaData);
});
