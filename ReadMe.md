# PacktPub_node
This is a node script that claims the free e-book offered at [PacktPub.com](https://www.packtpub.com/packt/offers/free-learning/) and then downloads it to the directory of your choice.
I only implemented functions to download the PDF, ePub, and code (.zip) files. I might add functions to download the Kindle and mobi files later and make them all optional.

# How it works
1. Clone the repository locally and run npm --install.
2. Open script.js in a text editor and enter your username and password into the appropriate variables. Enter the path for the directory you want the files downloaded to between the backticks (`). Save your changes.
```javascript
const username = "YourName"; // Enter your username here
const password = "YourPassword"; // Enter your password here
// Enter the path for the directory where you want the files downloaded between the backticks (`).
// String.raw is a verbatim string which allows you to put in a file path without needing to escape the slashes.
const rootDirectory = String.raw`C:\Your\Directory`;
```
3. To run manually, navigate to the project folder in a command prompt or terminal and run "node script.js".
4. To schedule as a Windows Task, create a new task. Under the "Action" settings:
    - `Action: Start a program`
    - `Program/script: C:\Windows\System32\cmd.exe`
    - `Add arguments: /c "node script.js"`
    - `Start in: C:\TheFolder\WhereTheScript\Resides`
5. The e-book offer changes everyday at midnight UTC.

# Dependencies
### [Node](https://nodejs.org/)
You'll need version >=6.5 beacuse I use some ES6 features like Promises and async/await.

### [Cheerio](https://cheerio.js.org/)
Fast, flexible, and lean implementation of core jQuery designed specifically for the server.

### [Request](https://github.com/request/request#request---simplified-http-client)
Simplified HTTP request client.

### [Request-promise-native](https://github.com/request/request-promise-native#request-promise-native)
The simplified HTTP request client 'request' with Promise support. Powered by native ES6 promises.
