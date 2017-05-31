# PacktPub_node
~~This is a node script that claims the free e-book offered at [PacktPub.com](https://www.packtpub.com/packt/offers/free-learning/) and then downloads it to the directory of your choice.  
However, I don't know how to make the Kindle download work, because I don't have a Kindle.~~

### UPDATE (5/30/17):

PacktPub has now implemented reCaptchas on their website including the button to claim the free e-book. A work-around is too complicated right now, so this script's default configuration is to login and download the book if it's already in your library.

I personally have a separate python script that uses the Selenium Webdriver to start up a firefox instance and log me in. I then navigate the captcha and claim the book. Once I close the firefox window, the python script then executes this node script, and I'm happily on my way. It's a couple more manual steps than previously, but it's the least amount of manual interaction that I can get away with right now.

# How it works
1. Clone the repository and run npm --install.
2. Open `config.js` in a text editor and enter your username and password into the appropriate variables (you'll need an account setup on PacktPub, duh!).
```javascript
credentials: {
        username: "YourAccountName", // Enter your PacktPub account username here.
        password: "YourAccountPass" // Enter your PacktPub account password here.
    },
```
3. Enter the path for the directory you want the books downloaded to between the backticks (`).
```javascript
// Enter the path for the directory where you want the files downloaded between the backticks (`).
// String.raw is a verbatim string which allows you to put in a file path without needing to escape the slashes.
rootDirectory: String.raw`C:\Your\Directory`,
```
4. Set the rest of the configurable options as you wish. They are explained well in the file.
5. To run manually, navigate to the project folder in a command prompt or terminal and run "node script.js".
6. The app creates a directory, using the book title (delimited with underscores, "_") as the directory name, in the directory you set as the `rootDirectory` above, e.g.
```
C:\Your\Directory\Unity_AI_Game_Programming_-_Second_Edition
```
7. All files are then downloaded to that directory using the naming convention that PacktPub uses when you download them manually from the website, e.g.
```
// Inside of C:\Your\Directory\Unity_AI_Game_Programming_-_Second_Edition
9781785288272.epub
9781785288272.mobi
9781785288272_code.zip
9781785288272-UNITY_AI_GAME_PROGRAMMING_SECOND_EDITION.pdf
// The number is the ISBN
```
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