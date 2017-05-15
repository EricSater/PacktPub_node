"use strict";

const PacktApi = require("./packtApi");
const username = ""; // Enter your username here
const password = ""; // Enter your password here
// Enter the path for the directory where you want the files downloaded between the backticks (`).
// String.raw is a verbatim string which allows you to put in a file path without needing to escape the slashes.
const rootDirectory = String.raw``;

// Set these variables to false if you do not want that file type to be downloaded.
const pdf = true;
const ePub = true;
const mobi = true;
// const kindle = true; // I don't know how the Kindle download works because I don't have a Kindle to try it on.
const code = true; // A zip folder with code examples

const packtApi = new PacktApi(pdf, ePub, mobi, code);

(async () => {
    console.log("Starting script...");
    console.time("timer");
    await packtApi.login(username, password);
    await packtApi.getBook();
    await packtApi.downloadBook(rootDirectory);
    console.log("Done");
    console.timeEnd("timer");
})();
