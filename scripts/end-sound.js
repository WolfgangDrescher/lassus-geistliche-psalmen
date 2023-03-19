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

const voices = [
    {
        voiceName: 'cantus',
        spineIndex: 2,
    },
    {
        voiceName: 'tenor',
        spineIndex: 1,
    },
    {
        voiceName: 'bassus',
        spineIndex: 0,
    },
];

files.forEach((file) => {
    const id = getIdFromFilename(file);
    const fb = execSync(`fb -i -a -m ${file} | extractxx -i **fb | ridxx -LGTM`).toString().trim();

    const piece = {
        voices: {
            bassus: {},
            tenor: {},
            cantus: {},
        },
    };

    const lines = fb.split('\n');

    voices.forEach(({voiceName, spineIndex}) => {
        const fbNumbers = lines[lines.length - 2].split('\t');
        const num = voiceName === 'bassus' ? '1' : fbNumbers[spineIndex];
        piece.voices[voiceName].endSoundFiguredbassNumber = num;
    });

    const metaFile = `${__dirname}/../meta/${id}.yaml`;
    const metaData = readYaml(metaFile);
    mergeDeep(metaData, {voices: piece.voices});
    writeYaml(metaFile, metaData);
});
