# Star History Comparer

This is a demo application created by [GPT Pilot](http://gpt-pilot.ai). The app allows you to register, login,
and compare GitHub repository stars between different repositories.

You can see it in action here: https://stars.examples.gpt-pilot.ai

## Prerequisites

Node.js environment, MongoDB server on localhost.

## Quickstart

1. Install node packages

    ```
    npm install
    ```

2. Create `.env` file with settings:

    ```
    MONGODB_URI=mongodb://127.0.0.1:27017/starcomparison
    SESSION_SECRET=your_super_secret_key
    EMAIL_PASSWORD=youremail@gmail.com
    EMAIL_USERNAME=yourpass
    FROM_EMAIL=youremail@gmail.com  # only required if different from EMAIL_USERNAME
    GITHUB_TOKEN=your_github_token
    PORT=3000
    APP_URL=https://myapp.com  # only required if different from http://localhost:3000
    ```

    GitHub token is used to connect to GitHub API and get the number of stars for repositories, MongoDB URL is the URL to connect to the database, and GMail email and password are used to send verification emails.

3. Start the server:

    ```
    npm start
    ```

## Trying it out

After starting the server, visit http://localhost:3000/register, then pick email and password. A verification email will be sent to your email address. After clicking on the verification email, you can log in.

After you've logged in, you can select *GitHub Comparison* from the menu, add two GitHub repository URL and see their start charts.

## Make your own!

This code was created by [GPT Pilot](http://gpt-pilot.ai) using [GPT Pilot VSCode](https://marketplace.visualstudio.com/items?itemName=PythagoraTechnologies.gpt-pilot-vs-code) extension. Try it out and [let us know what you think](https://discord.gg/HaqXugmxr9)!
