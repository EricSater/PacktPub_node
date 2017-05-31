"use strict"

let rpn = require("request-promise-native");
const cheerio = require("cheerio");
const fs = require("fs");

module.exports = class PacktApi {
    constructor() {
        this.cookieJar = rpn.jar();
        this.host = "www.packtpub.com";
        this.origin = "https://www.packtpub.com";
        this.homePageUri = "https://www.packtpub.com/packt/offers/free-learning";
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
    }

    /* LOGIN PROCESS */
    async login(credentials) {
        let responseBody = await this.getHomePage();
        await this.doLogin(credentials);
        return responseBody;
    }
    async getHomePage() {
        let response = await this.req.get(this.homePageUri);
        if (!this.ensureStatusCode(response.statusCode)) {
            throw new Error(`Failed to get Home Page. Status code: ${response.statusCode}`);
        }
        return response.body;
    }
    async doLogin(credentials) {
        let options = {
            uri: this.homePageUri,
            headers: {
                Origin: this.origin,
                Referer: this.homePageUri
            },
            form: {
                "email": credentials.username,
                "password": credentials.password,
                "op": "Login",
                "form_build_id": "form-da9e52f0bffa264e55a919962a825059",
                "form_id": "packt_user_login_form"
            }
        };
        let response = await this.req.post(options);
        if (!this.ensureStatusCode(response.statusCode)) {
            throw new Error(`Failed to login. Status code: ${response.statusCode}`);
        }
    }

    /* CLAIM BOOK PROCESS */
    async claimBook() {
        let responseBody = await this.getClaimBookPage();
        let claimBookUri = setClaimBookUri(responseBody);
        await this.getBook(claimBookUri);
    }
    async getClaimBookPage() {
        let options = {
            uri: this.homePageUri,
            headers: { Referer: this.homePageUri }
        };
        let response = await this.req.get(options);
        if (!this.ensureStatusCode(response.statusCode)) {
            throw new Error(`Failed to get claim book page. Status code: ${response.statusCode}`);
        }
        return response.body;
    }
    setClaimBookUri(body) {
        let $ = cheerio.load(body);
        let claimBookHref = $(".twelve-days-claim").attr("href");
        let claimBookUri = this.origin + claimBookHref;
        return claimBookUri;
    }
    async getBook(claimBookUri) {
        let options = {
            uri: claimBookUri,
            headers: { Referer: this.homePageUri }
        };
        let response = await this.req.get(options);
        if (!this.ensureStatusCode(response.statusCode)) {
            throw new Error(`Failed to claim book. Status code: ${response.statusCode}`);
        }
    }

    /* DOWNLOAD BOOK PROCESS */
    async navigateToLibrary() {
        let options = {
            uri: this.myBooksUri,
            headers: { Referer: this.homePageUri }
        };
        let response = await this.req.get(options);
        if (!this.ensureStatusCode(response.statusCode)) {
            throw new Error(`Failed to navigate to library. Status code: ${response.statusCode}`);
        }
        return response.body;
    }
    async downloadFile(type, downloadDirectory) {
        let options = {
            uri: this.origin + type.uri,
            headers: { Referer: this.myBooksUri }
        };
        try {
            console.log("Downloading...", type.name);
            let response = await this.req.get(options)
                .pipe(fs.createWriteStream(`${downloadDirectory}\\${type.fileName}`));
        }
        catch (e) {
            throw new Error(`Failed to download ${type.name}. Error: ${e}`);
        }
    }
    ensureStatusCode(statusCode) {
        return (/^[2|3]/.test("" + statusCode));
    }
}