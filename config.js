"use strict"

module.exports = {
    credentials: {
        username: "", // Enter your PacktPub account username here.
        password: "" // Enter your PacktPub account password here.
    },

    // This is defaulted to false now that there is a captcha guarding the claim button.
    claimBook: false,

    // Set this to false if you do not want to download the files.
    downloadBook: true,

    // If you already have the book in your library from a previous offer, 
    // setting this to false will skip the download process.
    downloadIfAlreadyInLibrary: true,

    // Enter the path for the directory where you want the files downloaded between the backticks (`).
    // String.raw is a verbatim string which allows you to put in a file path without needing to escape the slashes.
    rootDirectory: String.raw``,

    // If true, will delete all files from the book directory (not rootDirectory) 
    // when the book directory already exists (for whatever reason).
    cleanDirectory: true,

    // Set these variables to false if you do not want that file type to be downloaded.
    fileTypes: {
        pdf: true,
        ePub: true,
        mobi: true,
        //kindle: true, // I don't know how the Kindle download works because I don't have a Kindle to try it on.
        code: true // A zip folder with code examples
    },

    // Set this to true if you want the script to exit the command prompt (terminal) immediately once it's finished
    exitWithoutInput: false
}