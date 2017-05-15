# PacktPub_node
This is a node script that claims the free e-book offered at [PacktPub.com](https://www.packtpub.com/packt/offers/free-learning/) and then downloads it to the directory of your choice.  
However, I don't know how to make the Kindle download work, because I don't have a Kindle.

# How it works
1. Clone the repository and run npm --install.
2. Open script.js in a text editor and enter your username and password into the appropriate variables (you'll need an account setup on PacktPub, duh!). Enter the path for the directory you want the books downloaded to between the backticks (`).
```javascript
const username = "YourName"; // Enter your username here
const password = "YourPassword"; // Enter your password here
// Enter the path for the directory where you want the files downloaded between the backticks (`).
// String.raw is a verbatim string which allows you to put in a file path without needing to escape the slashes.
const rootDirectory = String.raw`C:\Your\Directory`;
```
3. Set the following variables to false if you **_do not_** want that file type downloaded (default is true for all). Save your changes.
```javascript
const pdf = true;
const ePub = true;
const mobi = true;
// I don't know how the Kindle download works because I don't have a Kindle to try it on.
// const kindle = true;
const code = true;
```
4. To run manually, navigate to the project folder in a command prompt or terminal and run "node script.js".
5. The app creates a directory, using the book title (delimited with underscores, "_") as the directory name, in the directory you set as the `rootDirectory` above, e.g.
```
C:\Your\Directory\Unity_AI_Game_Programming_-_Second_Edition
```
6. All files are then downloaded to that directory using the naming convention that PacktPub uses when you download them manually from the website, e.g.
```
// Inside of C:\Your\Directory\Unity_AI_Game_Programming_-_Second_Edition
// The number is the ISBN
9781785288272.epub
9781785288272.mobi
9781785288272_code.zip
9781785288272-UNITY_AI_GAME_PROGRAMMING_SECOND_EDITION.pdf
```
7. Right now, if the book directory already exists (either because the app erred or you have downloaded it before), it will delete the contents before downloading the files. I might change that functionality later. Leave a comment or submit an issue or pull request if you have any feedback on that.
8. To schedule as a Windows Task, create a new task. Under the "Action" settings:
    - `Action: Start a program`
    - `Program/script: C:\Windows\System32\cmd.exe`
    - `Add arguments: /c "node script.js"`
    - `Start in: C:\TheFolder\WhereTheScript\Resides` (no trailing backslash)
9. The e-book offer changes everyday at midnight UTC.

# Dependencies
### [Node](https://nodejs.org/)
You'll need version >=6.5 beacuse I use some ES6 features like Promises and async/await.

### [Cheerio](https://cheerio.js.org/)
Fast, flexible, and lean implementation of core jQuery designed specifically for the server.

### [Request](https://github.com/request/request#request---simplified-http-client)
Simplified HTTP request client.

### [Request-promise-native](https://github.com/request/request-promise-native#request-promise-native)
The simplified HTTP request client 'request' with Promise support. Powered by native ES6 promises.
