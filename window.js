const request = require('request');
const cheerio = require('cheerio');
const clipboardy = require('clipboardy');
const notifier = require('node-notifier');

class BibleSearch {
    constructor(bookOfBible, chapterNumber, verseNumber, translation) {
        this._bookOfBible = bookOfBible;
        this._chapterNumber = chapterNumber;
        this._verseNumber = verseNumber;
        this._translation = translation;
    }

    get bookOfBible() {
        return this._bookOfBible;
    }

    get chapterNumber() {
        return this._chapterNumber;
    }

    get verseNumber() {
        return this._verseNumber;
    }

    get translation() {
        return this._translation;
    }

    urlToFetch() {
        return `https://www.biblegateway.com/passage/?search=${this.bookOfBible}
            +${this.chapterNumber}%3A${this.verseNumber}&version=${this.translation}`;
    }
}

let bookNameInputField, chapterNumberInputField, verseNumberInputField, translationField; 

$(() => {
    bookNameInputField = $("#book-input"); 
    chapterNumberInputField = $("#chapter-input");
    verseNumberInputField = $("#verse-input");
    translationField = $("#translation-input");

    translationField.keydown(function(event) {
        if (event.key == "Enter") {
            const inputFieldData = getSearchDataIfInputFieldsNotEmpty();
            if (!inputFieldData) {
                alert("Please fill all the fields.")
            } else {
                fetchBibleVerse(inputFieldData)
            }
        } else if (event.key == "Backspace") {
            if (!$(this).val()) {
                $(this).prev().focus();
            }
        }
    });

    $('#book-input, #chapter-input, #verse-input').keydown(function(event) {
        if (event.key == " " || event.key == "Enter") {
            event.preventDefault();

            if ($(this).val()) {
                $(this).next().focus();
            }
        } else if (event.key == "Backspace") {
            if (!$(this).val()) {
                $(this).prev().focus();
            }
        }
    });
})

function getSearchDataIfInputFieldsNotEmpty() {
    const bookOfBible = String(bookNameInputField.val()).trim();
    const chapterNumber = String(chapterNumberInputField.val()).trim();
    const verseNumber = String(verseNumberInputField.val()).trim();
    let translation = String(translationField.val()).trim();

    if (!bookOfBible || !chapterNumber || !verseNumber) {
        return;
    }

    if (translation === "") {
        translation = "nkjv";
    }

    return [
        bookOfBible,
        chapterNumber,
        verseNumber,
        translation
    ];
}

//TODO: Improve the code quality here.
//TODO: Implement a JS class.
function fetchBibleVerse (bibleSearch) {
    

    //console.log(`Book: ${bibleSearch.bookOfBible}\nRef: ${bibleSearch.chapterNumber},Ref: ${bibleSearch.verseNumber}\nTranslation: ${bibleSearch.translation}`)

    //const url = bibleSearch.urlToFetch(); 
    const url = getConstructedUrlFromBibleSearchArray(bibleSearch);

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
                let ref = full_ref.substring(0, full_ref.lastIndexOf(' ')) + " " + bibleSearch[3].toUpperCase();

                console.log(`Verse => ${verse} -- ${ref}`);

                copyBibleVerseToClipboard(verse, ref);
                notifyUser(ref)
                displayVerse(verse, ref);
                clearInputFieldsAndFocusFirstField();
            }
        }
    });

    
}

function getConstructedUrlFromBibleSearchArray(bibleSearch) {
    return `https://www.biblegateway.com/passage/?search=${bibleSearch[0]}
            +${bibleSearch[1]}%3A${bibleSearch[2]}&version=${bibleSearch[3]}`;
}

function copyBibleVerseToClipboard(verse, ref) {
    clipboardy.writeSync(`${verse}\n${ref}`);
}

function notifyUser(ref) {
    notifier.notify({
        title: 'Bleezy',
        message: `${ref} was copied to the clipboard`
    });
}

function showLoading() {
    $('#message').text("Loading verse...")
    $('#ref').hide()
    $('#message').show()
}

function clearInputFieldsAndFocusFirstField() {
    bookNameInputField.val("");
    chapterNumberInputField.val("");
    verseNumberInputField.val("");
    translationField.val("");

    bookNameInputField.focus();
}

function hideLoading() {
    $('#message').hide()
}

function displayVerse(verse, clean_ref) {
    $('#message').text(verse)
    $('#ref').text(clean_ref)
    $('#ref').show()
}