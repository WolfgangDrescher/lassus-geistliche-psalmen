import { exec } from 'child_process';
import { getDirname, getFiles, splitInChunks } from './utils.js';

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
            piece.voices[key].lyrics = lyrics.split(/(?<=\/)/).map(line => line.trim());
        });
        console.log(JSON.stringify(piece));
    });
});
