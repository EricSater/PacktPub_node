"use strict";

const PacktApi = require("./packtApi");
const username = ""; // Enter your username here
const password = ""; // Enter your password here
// Enter the path for the directory where you want the files downloaded between the backticks (`).
// String.raw is a verbatim string which allows you to put in a file path without needing to escape the slashes.
const rootDirectory = String.raw``; 
const packtApi = new PacktApi();

(async () => {
    console.log("Starting script...");
    console.time("timer");
    await packtApi.login(username, password);
    await packtApi.getBook();
    await packtApi.downloadBook(rootDirectory);
    console.log("Done");
    console.timeEnd("timer");
})();