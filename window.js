$(() => {
    $("#search-query-input").keyup(function(event) {
        if (event.key == "Enter") {
            handleEvent(this.value)
        }
    });
})

function handleEvent(inputString) {
    const request = require('request');
    const cheerio = require('cheerio');
    const clipboardy = require('clipboardy');
    const notifier = require('node-notifier');

    let trimmedInputString = inputString.trim()

    let firstIndexOfSpace = trimmedInputString.indexOf(" ") + 1
    let lastIndexOfSpace = trimmedInputString.lastIndexOf(" ") + 1

    let b_book = trimmedInputString.substring(0, firstIndexOfSpace)
    let b_reference = trimmedInputString.substring(firstIndexOfSpace, lastIndexOfSpace)
    let b_translation = trimmedInputString.substring(lastIndexOfSpace, trimmedInputString.length)

    let b_chapter, b_verse, delimiter;
    
    if (b_reference.includes(':')) {
        delimiter = ':';
    } else if (b_reference.includes('.')) {
        delimiter = '.';
    } else if (b_reference.includes(',')) {
        delimiter = ',';
    } else {
        console.log(`Error: Please use ':' or '.' or ',' to seperate the chapter and verse numbers`);
    }

    b_chapter = b_reference.substring(0, b_reference.indexOf(delimiter));
    b_verse = b_reference.substring(b_reference.indexOf(delimiter) + 1, b_reference.length);

    const url = `https://www.biblegateway.com/passage/?search=${b_book}+${b_chapter}%3A${b_verse}&version=${b_translation}`;

    request(url, (error, response, html) => {
        if (!error && response.statusCode == 200) {
            const $ = cheerio.load(html);
            let verse = $('meta[property="og:description"]').attr('content');
            let ref = $('meta[name="twitter:title"]').attr('content');
            
            console.log(`\nURL => ${url}`);

            if (typeof verse === 'undefined' || typeof ref === 'undefined') {
                console.log('Please check the book and reference you specified.');
            } else {
                let clean_ref = ref.substring(0, ref.lastIndexOf(' '));

                console.log(`Verse => ${verse} -- ${clean_ref}`);
                clipboardy.writeSync(`${verse}\n${clean_ref}`);
                notifier.notify({
                    title: 'Bleezy',
                    message: `${clean_ref} was copied to the clipboard`
                });
            }
        }
    });
}