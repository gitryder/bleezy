#! /usr/bin/env node
const request = require('request');
const cheerio = require('cheerio');
const clipboardy = require('clipboardy');

let b_book = process.argv[2];
let b_reference = process.argv[3];
let b_translation = typeof process.argv[4] === 'undefined' ? 'NKJV' : process.argv[4];

if (typeof b_book === 'undefined') {
    console.log("\nBook was not entered. Defaulting to Genesis 1:1");
} else {
    console.log(`\nBook: ${b_book}`);
}

if (typeof b_reference === 'undefined') {
    console.log("Reference was not entered. Defaulting to Genesis 1:1");
} else {
    console.log(`Reference: ${b_reference}`);
}

if (typeof b_translation === 'undefined') {
    console.log(b_translation);
} else {
    console.log(`Translation: ${b_translation}`);
}

// TODO: Add support for ':' in reference
let b_chapter = b_reference.substring(0, b_reference.indexOf('.'));
let b_verse = b_reference.substring(b_reference.indexOf('.') + 1, b_reference.length);

const url = `https://www.biblegateway.com/passage/?search=${b_book}+${b_chapter}%3A${b_verse}&version=${b_translation}`;

request(url, (error, response, html) => {
    if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        let verse = $('meta[property="og:description"]').attr('content');
        let ref = $('meta[name="twitter:title"]').attr('content');
        let clean_ref = ref.substring(0, ref.lastIndexOf(' '));

        console.log(`\nURL => ${url}`);

        if (typeof verse === 'undefined') {
            console.log('Please check the book and reference you specified.\nAlso, use a dot to seperate chapter and verse numbers');
        } else {
            console.log(`\nVerse => ${verse} -- ${clean_ref}`);
            clipboardy.writeSync(`${verse}\n${clean_ref}`);
            console.log('\nVerse copied to your clipboard.');
        }
    }
});

