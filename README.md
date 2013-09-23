doppio-basic
============

`doppio-basic` is a plugin that allows [doppio][1] to configured with just a
couple of environment variables.

## Usage

First install the packages:

    npm install doppio
    npm install doppio-basic

Then load the plugin:

    var doppio = require("doppio"),
        server;
    
    doppio.loadPlugin("doppio-basic");
    server = doppio();

See the [doppio.loadPlugin()][2] documentation for more details.

## Configuration

The following environment variables are recognized:

### APP_URL

The fully qualified URL that will be used to access the server. This essentially
just updates what is returned by `server.url()`.

### PORT

This sets the port that the server process shoul listen on (does not affect
`server.url()`). It should be noted that the server _always_ uses the 'http'
scheme when cofigured with `doppio-basic`.

[1]: https://github.com/jagoda/doppio "Doppio"
[2]: https://github.com/jagoda/doppio#doppioloadpluginid "doppio.loadPlugin()"
