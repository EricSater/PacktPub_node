"use strict"

const Config = require("./config");
const Handler = require("./handler");
const PacktApi = require("./packtApi");

const handler = new Handler();
const packtApi = new PacktApi();

(async () => {
    try {
        console.log("Starting script...");
        console.time("timer");
        console.log("Logging in...");
        let loginResponseBody = await packtApi.login(Config.credentials);
        let bookTitle = handler.getbookTitle(loginResponseBody);
        console.log("Book title: ", bookTitle);

        if (Config.claimBook) {
            console.log("Claiming book...");
            await packtApi.claimBook();
        }

        if (Config.downloadBook) {
            await downloadBook(bookTitle);
        }

        console.log("Done");
        console.timeEnd("timer");
        if (!Config.exitWithoutInput) {
            finish();

        }
    } catch (e) {
        console.log(e);
        finish();
    }
})();

async function downloadBook(bookTitle) {
    console.log("Checking library...");
    let libraryResponseBody = await packtApi.navigateToLibrary();
    let ebookDiv = handler.getEBookDiv(libraryResponseBody, bookTitle);
    if (!handler.isTodaysBook(ebookDiv)) {
        console.log("This is a book you already have in your library.");
        if (!Config.downloadIfAlreadyInLibrary) {
            console.log("Skipping the download based on your config preference (Config.downloadIfAlreadyInLibrary: false)");
            return;
        }
        console.log("Downloading anyway based on your config preference (Config.downloadIfAlreadyInLibrary: true)");
    } else { console.log("This is a new book."); }

    let isbn = handler.getIsbn(ebookDiv);
    let fileTypes = handler.getFileTypes(Config.fileTypes);
    let downloadDirectory = handler.makeBookDirectory(Config.rootDirectory, bookTitle, Config.cleanDirectory);
    let fileInfo = handler.getFileInfo(ebookDiv, isbn, bookTitle, fileTypes);
    for (let type in fileInfo) {
        let response = await packtApi.downloadFile(fileInfo[type], downloadDirectory);
    }
}

function finish() {
    console.log("Press any key to finish...");
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", process.exit.bind(process, 0));
}