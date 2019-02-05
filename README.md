## Getting Started

### Requirements

* Mac OS X, Windows, or Linux
* [npm](https://www.npmjs.com/) package + [Node.js](https://nodejs.org/) v7.9.0 or
  newer

### Directory Layout

Before you start, take a moment to see how the project structure looks like:

```
.
├── /dist/                      # The folder for compiled output
├── /node_modules/              # 3rd-party libraries and utilities
├── /src/                       # The source code of the application
│   ├── /lib/                   # Our library
│   ├── /routes/                # API routes folder
│   ├── /system/                # System plugins / modules
│   ├── /app.js                 # Application layer component
│   ├── /server.js              # Server layer component
│   ├── /start.js               # Main entry point
│   └── ...                     # Others
├── /test/                      # Unit and end-to-end tests
├── /tools/                     # ... TBD
├── Dockerfile                  # Commands for building a Docker image for production
├── docker-compose.yml          # Commands for building a Docker image for production
├── package.json                # The list of 3rd party libraries and utilities
```

### Quick Start

#### 1. Get the latest version

You can start by cloning the latest version on your local machine by running:

```shell
$ git clone -o node-koa-api -b master --single-branch https://USER_NAME@bitbucket.org/pennyarcade2017/node-koa-api.git MyApp
$ cd MyApp
```

#### 2. Run `npm install`

#### 3. Run `npm start`

> [http://127.0.0.1:1337/](http://127.0.0.1:3000/) — Node.js server

Now you can open your web app in a browser.

### How to Build, Test, Deploy

TBD

### How to Update

If you need to keep your project up to date with the recent changes made to RSK,
you can always fetch and merge them from
[this repo](https://bitbucket.org/pennyarcade2017/node-koa-api/) back into your own
project by running:

```shell
$ git checkout master
$ git fetch node-koa-api
$ git merge node-koa-api/master
$ yarn install
```
