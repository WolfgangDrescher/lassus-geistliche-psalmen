import { execSync } from 'child_process';
import {
    getDirname,
    getFiles,
    readYaml,
    writeYaml,
    getIdFromFilename,
    mergeDeep
} from './utils.js';

const __dirname = getDirname(import.meta.url);

const files = getFiles(`${__dirname}/../kern`);

const voices = [
    {
        name: 'cantus',
        spine: 5,
    },
    {
        name: 'tenor',
        spine: 3,
    },
    {
        name: 'bassus',
        spine: 1,
    },
];

files.forEach(file => {
    const id = getIdFromFilename(file);
    const metaFile = `${__dirname}/../meta/${id}.yaml`;

    const cantusFirmusInVoices = [];

    voices.forEach(voice => {
        const voiceData = execSync(`extract -f ${voice.spine} ${file}`).toString();
        const re = /!LO:TX(.*)t=c\.f\./;
        if (re.exec(voiceData) !== null) {
            cantusFirmusInVoices.push(voice.name);
        }
    });

    const metaConfig = {
        cantusFirmus: cantusFirmusInVoices,
    };
    
    const currentMetaConfig = readYaml(metaFile);
    writeYaml(metaFile, mergeDeep(currentMetaConfig, metaConfig));
});
