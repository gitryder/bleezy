$(() => {
    $("#translation-input").keyup(function(event) {
        if (event.key == "Enter") {
            handleEvent(this.value)
        } else if (event.keyCode == 8) {
            if (!$(this).val()) {
                $(this).prev().focus();
            }
        }
    });

    $('#search-input,#chapter-input,#verse-input').keyup(function(event) {
        if (event.keyCode == 32 || event.keyCode == 13) {
            if ($(this).val()) {
                $(this).next().focus();
            }
        } else if (event.keyCode == 8) {
            if (!$(this).val()) {
                $(this).prev().focus();
            }
        }
    });
})

function handleEvent(inputString) {

    const request = require('request');
    const cheerio = require('cheerio');
    const clipboardy = require('clipboardy');
    const notifier = require('node-notifier');

    let messageDialog = $('#message')

    let trimmedInputString = inputString.trim()

    let firstIndexOfSpace = trimmedInputString.indexOf(" ") + 1
    let lastIndexOfSpace = trimmedInputString.lastIndexOf(" ") + 1

    let b_book = trimmedInputString.substring(0, firstIndexOfSpace)
    let b_reference = trimmedInputString.substring(firstIndexOfSpace, lastIndexOfSpace)
    let b_translation = trimmedInputString.substring(lastIndexOfSpace, trimmedInputString.length)

    if(b_reference == '') {
        b_reference = b_translation
        b_translation = 'nkjv'
    } 

    console.log(`Book: ${b_book}\nRef: ${b_reference}\nTranslation: ${b_translation}`)
    
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

    showLoading()
    request(url, (error, response, html) => {
        if (!error && response.statusCode == 200) {
            const $ = cheerio.load(html);
            let verse = $('meta[property="og:description"]').attr('content');
            let full_ref = $('meta[name="twitter:title"]').attr('content');
            
            console.log(`\nURL => ${url}`);

            if (typeof verse === 'undefined' || typeof full_ref === 'undefined') {
                hideLoading()
                console.log('Please check the book and reference you specified.');
            } else {
                let ref = full_ref.substring(0, full_ref.lastIndexOf(' ')) + " " + b_translation.toUpperCase();

                console.log(`Verse => ${verse} -- ${ref}`);

                clipboardy.writeSync(`${verse}\n${ref}`);
                notifier.notify({
                    title: 'Bleezy',
                    message: `${ref} was copied to the clipboard`
                });  

                displayVerse(verse, ref)
            }
        }
    });

    
}

function showLoading() {
    $('#message').text("Loading verse...")
    $('#ref').hide()
    $('#message').show()
}

function hideLoading() {
    $('#message').hide()
}

function displayVerse(verse, clean_ref) {
    $('#message').text(verse)
    $('#ref').text(clean_ref)
    $('#ref').show()
}