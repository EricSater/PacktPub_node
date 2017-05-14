"use strict";

let rpn = require("request-promise-native");
let cheerio = require("cheerio");
let fs = require("fs");

module.exports = class PacktApi {
    constructor(pdf, ePub, mobi/*, kindle*/, code) {
        this.cookieJar = rpn.jar();
        this.host = "www.packtpub.com";
        this.origin = "https://www.packtpub.com";
        this.homePageUri = "https://www.packtpub.com/packt/offers/free-learning";
        this.claimBookUri = "";
        this.myBooksUri = "https://www.packtpub.com/account/my-ebooks";
        this.req = rpn.defaults({
            jar: this.cookieJar,
            headers: {
                "Host": this.host,
                "Connection": "keep-alive",
                "Accept-Language": "en-US,en;q=0.8",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.75 Safari/537.36"
            },
            resolveWithFullResponse: true,
            simple: false //This needs to be false in case of Redirects... If true, any non-2xx response throws an error. Specific to request-promise-native.
        });
        this.downloadDirectory = "";
        this.bookId = "";
        this.bookTitle = "";
        this.isbn = "";
        this.fileTypes = this.getFileTypes(pdf, ePub, mobi/*, kindle*/, code);
    }
    getFileTypes(pdf, ePub, mobi/*, kindle*/, code) {
        let output = [];
        if (pdf) output.push("pdf");
        if (ePub) output.push("epub");
        if (mobi) output.push("mobi");
        // if (kindle) output.push("");
        if (code) output.push("zip");
        return output;
    }
    async login(username, password) {
        await this.getHomePage();
        await this.postLogin(username, password);
    }
    async getHomePage() {
        let response = await this.req.get(this.homePageUri);
        if (!this.ensureStatusCode(response.statusCode)) {
            throw new Error(`Failed to get Home Page. Status code: ${response.statusCode}`);
        }
    }
    async postLogin(username, password) {
        let options = {
            uri: this.homePageUri,
            headers: {
                Origin: this.origin,
                Referer: this.homePageUri
            },
            form: {
                "email": username,
                "password": password,
                "op": "Login",
                "form_build_id": "form-da9e52f0bffa264e55a919962a825059",
                "form_id": "packt_user_login_form"
            }
        };
        console.log("Logging in...");
        let response = await this.req.post(options);
        if (!this.ensureStatusCode(response.statusCode)) {
            throw new Error(`Failed to login. Status code: ${response.statusCode}`);
        }
    }
    async getBook() {
        await this.getClaimBookPage();
        await this.claimBook();
    }
    async getClaimBookPage() {
        let options = {
            uri: this.homePageUri,
            headers: {
                Referer: this.homePageUri
            }
        };
        console.log("Claiming book...");
        let response = await this.req.get(options);
        if (!this.ensureStatusCode(response.statusCode)) {
            throw new Error(`Failed to get claim book page. Status code: ${response.statusCode}`);
        }
        let $ = cheerio.load(response.body);
        let claimBookHref = $(".twelve-days-claim").attr("href");
        this.claimBookUri = this.origin + claimBookHref;
        this.bookId = claimBookHref.match(/\/(\d*)\//)[1];
    }
    async claimBook() {
        let options = {
            uri: this.claimBookUri,
            headers: {
                Referer: this.homePageUri
            }
        };
        let response = await this.req.get(options);
        if (!this.ensureStatusCode(response.statusCode)) {
            throw new Error(`Failed to claim book. Status code: ${response.statusCode}`);
        }
    }
    async downloadBook(rootDirectory) {
        let body = await this.getMyLibrary();
        let ebookDiv = this.getBookTitle(body);
        this.makeBookDirectory(rootDirectory);
        this.getIsbn(ebookDiv);

        this.fileTypes.forEach(async type => {
            let { uri, fileName } = this.getFileInfo(ebookDiv, type);
            await this.downloadFile(uri, fileName, type);
        });
    }
    async getMyLibrary() {
        let options = {
            uri: this.myBooksUri,
            headers: {
                Referer: this.homePageUri
            }
        };
        let response = await this.req.get(options);
        if (!this.ensureStatusCode(response.statusCode)) {
            throw new Error(`Failed to get my e-books page. Status code: ${response.statusCode}`);
        }
        return response.body;
    }
    getBookTitle(body) {
        let $ = cheerio.load(body);
        let ebookDiv = $("div.product-line").toArray().find(x => {
            return $(x).attr("nid") === this.bookId;
        });
        let title = ebookDiv.attribs["title"];
        this.bookTitle = title.replace(/ \[eBook\]$/, "");
        this.bookTitle = this.bookTitle.replace(/\s{1}/g, "_");
        return ebookDiv;
    }
    makeBookDirectory(rootDirectory) {
        this.downloadDirectory = `${rootDirectory}\\${this.bookTitle}`;
        try {
            console.log("Creating directory:", this.bookTitle);
            fs.mkdirSync(this.downloadDirectory);
        }
        catch (e) {
            // If the directory already exists, then remove any files from it so we can get a fresh download.
            if (e.code === "EEXIST") {
                console.log("Directory already exists. Emptying directory.");
                this.removeFilesFromDirectory();
            } else {
                throw e;
            }
        }
    }
    removeFilesFromDirectory() {
        let files = fs.readdirSync(this.downloadDirectory);
        files.forEach(x => {
            try {
                console.log("Deleting...", x);
                let filePath = `${this.downloadDirectory}\\${x}`
                fs.unlinkSync(filePath);
            } catch (e) {
                throw e;
            }
        });
    }
    getIsbn(ebookDiv) {
        let $ = cheerio.load(ebookDiv);
        this.isbn = $("div.showPacktLibReader").attr("isbn");
    }
    getFileInfo(ebookDiv, type) {
        let $ = cheerio.load(ebookDiv);
        let hrefs = $("div.download-container a").toArray();
        let uri = "";
        let fileName = this.isbn;
        if (type === "pdf") {
            uri += hrefs.find(x => /pdf$/.test(x.attribs["href"])).attribs["href"];
            fileName += `-${this.bookTitle.replace(/\W+/g, "").toUpperCase()}.pdf`;
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
        if (!uri) console.log(`${type} file is not available for this e-book`);
        return { uri, fileName };
    }
    async downloadFile(uri, fileName, type) {
        let options = {
            uri: this.origin + uri,
            headers: {
                Referer: this.myBooksUri
            }
        };
        try {
            console.log("Downloading...", type);
            let response = await this.req.get(options).pipe(fs.createWriteStream(`${this.downloadDirectory}\\${fileName}`));
        }
        catch (e) {
            throw new Error(`Failed to download ${type}. Error: ${e}`);
        }
    }
    ensureStatusCode(statusCode) {
        return (/^[2|3]/.test("" + statusCode));
    }
}