"use strict"

const cheerio = require("cheerio");
const fs = require("fs");

module.exports = class Handler {
    getbookTitle(body) {
        let $ = cheerio.load(body);
        let title = $("#deal-of-the-day .dotd-main-book-summary .dotd-title h2").text().trim();
        return title;
    }

    getEBookDiv(body, bookTitle) {
        let $ = cheerio.load(body);
        let ebookDiv;
        ebookDiv = $("div.product-line").toArray().find(x => {
            return $(x).attr("title").toUpperCase().startsWith(bookTitle.toUpperCase());
        });
        return ebookDiv;
    }

    isTodaysBook(ebookDiv) {
        let $ = cheerio.load(ebookDiv);
        let orderDate = $($("td").toArray()[2]).text().trim().split(" ");
        // Since the website uses UTC, we use UTC to compare dates here
        let today = new Date().toUTCString().split(" ");
        // Strip off leading zeros
        let sameDay = orderDate[0].replace(/^0+/, "") === today[1].replace(/^0+/, "");
        // UTC date has only first 3 letters of month name
        let sameMonth = orderDate[1].substring(0, 3) === today[2];
        let sameYear = orderDate[2] === today[3];
        return sameDay && sameMonth && sameYear;
    }

    getIsbn(ebookDiv) {
        let $ = cheerio.load(ebookDiv);
        return $("div.showPacktLibReader").attr("isbn");
    }

    getFileTypes(fileTypes) {
        let output = [];
        if (fileTypes.pdf) output.push("pdf");
        if (fileTypes.ePub) output.push("epub");
        if (fileTypes.mobi) output.push("mobi");
        if (fileTypes.kindle) output.push("");
        if (fileTypes.code) output.push("zip");
        return output;
    }

    makeBookDirectory(rootDirectory, bookTitle, cleanDirectory) {
        let bookDirectory = bookTitle.replace(/\s{1}/g, "_");
        let downloadDirectory = `${rootDirectory}\\${bookDirectory}`;
        try {
            console.log("Creating directory:", downloadDirectory);
            fs.mkdirSync(downloadDirectory);
        }
        catch (e) {
            if (e.code === "EEXIST") {
                if (cleanDirectory) {
                    console.log("Directory already exists. Emptying directory...");
                    this.removeFilesFromDirectory(downloadDirectory);
                } else {
                    console.log("Directory already exists. Moving on to download...");
                }
            } else {
                throw e;
            }
        } finally {
            return downloadDirectory;
        }
    }

    removeFilesFromDirectory(downloadDirectory) {
        let files = fs.readdirSync(downloadDirectory);
        files.forEach(x => {
            try {
                console.log("Deleting...", x);
                let filePath = `${downloadDirectory}\\${x}`
                fs.unlinkSync(filePath);
            } catch (e) {
                throw e;
            }
        });
    }

    getFileInfo(ebookDiv, isbn, bookTitle, fileTypes) {
        let output = {};
        let $ = cheerio.load(ebookDiv);
        let hrefs = $("div.download-container a").toArray();
        fileTypes.forEach(type => {
            let { uri, fileName } = this.setFileInfo(hrefs, isbn, bookTitle, type);
            if (!uri || uri === "") {
                console.log(`${type} file is not available for this e-book`);
                return;
            }
            output[type] = { name: type, uri, fileName };
        });
        return output;
    }

    setFileInfo(hrefs, isbn, bookTitle, type) {
        let uri = "";
        let fileName = isbn;
        if (type === "pdf") {
            uri += hrefs.find(x => /pdf$/.test(x.attribs["href"])).attribs["href"];
            fileName += `-${bookTitle.replace(/\s/, "_").toUpperCase()}.pdf`;
        } else if (type === "epub") {
            uri += hrefs.find(x => /epub$/.test(x.attribs["href"])).attribs["href"];
            fileName += ".epub";
        } else if (type === "mobi") {
            uri += hrefs.find(x => /mobi$/.test(x.attribs["href"])).attribs["href"];
            fileName += ".mobi";
        } else if (type === "zip") {
            uri += hrefs.find(x => /^\/code_download/.test(x.attribs["href"])).attribs["href"];
            fileName += "_code.zip";
        }
        return { uri, fileName };
    }
}