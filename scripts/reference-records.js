import fs from 'node:fs';
import { execSync } from 'child_process';
import {
    getDirname,
    getFiles,
    readYaml,
    writeYaml,
    getIdFromFilename,
    mergeDeep,
    parseHumdrumReferenceRecords,
    getHumdrumReferenceRecod
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

const modeMapping = {
    dor: 'dorian',
    phr: 'phrygian',
    lyd: 'lydian',
    mix: 'mixolydian',
    aeo: 'aeolian',
    ion: 'ionian',
    loc: 'locrian',
}

files.forEach(file => {
    const id = getIdFromFilename(file);
    const metaFile = `${__dirname}/../meta/${id}.yaml`;
    const tricinium = {
        voices: {},
    };

    const kern = fs.readFileSync(file, 'utf8');
    const referenceRecords = parseHumdrumReferenceRecords(kern);

    // Title
    tricinium.title = referenceRecords['OTL@@LA'] || null;

    // Incipit
    tricinium.incipit = referenceRecords['OTL-incipit@@DE'] || null;

    // Composer
    const com = getHumdrumReferenceRecod(kern, 'COM');
    tricinium.composer = com && com.includes(',') ? (() => {
        const [lastName, firstName] = com.split(',').map(a => a.trim());
        return `${firstName} ${lastName}`;
    })() : com;

    // rawFile
    tricinium.rawFile = `https://raw.githubusercontent.com/WolfgangDrescher/lassus-geistliche-psalmen/master/kern/${id}.krn`;

    // sourceFile
    tricinium.sourceFile = `https://github.com/WolfgangDrescher/lassus-geistliche-psalmen/blob/master/kern/${id}.krn`;

    // ulenbergRawFile
    tricinium.ulenbergRawFile = `https://raw.githubusercontent.com/WolfgangDrescher/ulenberg-psalmen-davids/master/kern/0${id}.krn`;

    // ulenbergSourceFile
    tricinium.ulenbergSourceFile = `https://github.com/WolfgangDrescher/ulenberg-psalmen-davids/blob/master/kern/0${id}.krn`;
    
    // YOR (Original document)
    tricinium.originalDocument = referenceRecords['YOR'] || null;

    // YOO (Original document owner)
    tricinium.originalDocumentOwner = referenceRecords['YOO'] || null;

    // URL-scan
    const urlScans = referenceRecords['URL-scan'];
    if (Array.isArray(urlScans)) {
        urlScans.map(a => a.split(' ')).forEach(([url, voice]) => {
            tricinium.voices[voice.toLowerCase()] = {};
            tricinium.voices[voice.toLowerCase()].urlScan = url
        });
    }

    // Clef
    voices.forEach(voice => {
        const stdout = execSync(`extract -f ${voice.spine} ${file} | grep '*clef'`);
        const clef = stdout.toString().trim().split('\n')[0].replace('*clef', '');
        tricinium.voices[voice.name].clef = clef;
    });

    // Mode + Finalis
    voices.forEach(voice => {
        const stdout = execSync(`extract -f ${voice.spine} ${file} | grep '^\\*[A-Ha-h]:'`);
        const regex = new RegExp(/^\*([a-hA-H]):(\w{3})$/);
        const matches = regex.exec(stdout.toString().trim());
        const finalis = matches[1].toLowerCase();
        const mode = modeMapping[matches[2]];
        if (tricinium.finalis && finalis !== tricinium.finalis) {
            throw new Error('Voices do not have the same finalis');
        }
        if (tricinium.mode && mode !== tricinium.mode) {
            throw new Error('Voices do not have the same mode');
        }
        tricinium.finalis = finalis;
        tricinium.mode = mode;
    });

    // Transposition
    voices.forEach(voice => {
        const stdout = execSync(`extract -f ${voice.spine} ${file} | grep '*k\\['`);
        const transposition = stdout.toString().trim().split('\n')[0].replace('*clef', '') === '*k[b-]' ? 'cantus_mollis' : 'cantus_durus';
        if (tricinium.transposition && transposition !== tricinium.transposition) {
            throw new Error('Voices do not have the same transposition');
        }
        tricinium.transposition = transposition;
    });

    // // Comments
    // tricinium.comments = [];

    // // Lyrics
    // tricinium.lyrics = [];

    // // Cantus firmus
    // tricinium.cantusFirmus = null;
    
    const currentTricinium = readYaml(metaFile);
    writeYaml(metaFile, mergeDeep(currentTricinium, tricinium));
});
