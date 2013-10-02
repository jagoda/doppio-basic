var async   = require("async"),
    doppio  = require("doppio"),
    expect  = require("chai").expect,
    request = require("request");

describe("The plugin", function () {
    
    var server;
    
    function checkUrl (url, callback) {
        async.waterfall(
            [
                request.get.bind(request, url),
                function (response, body, next) {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).to.equal("OK");
                    next();
                }
            ],
            callback
        );
    }
    
    function loadEnvironment () {
        var env = loadEnvironment.env;
        
        Object.keys(process.env).forEach(function (key) {
            if (key in env) {
                process.env[key] = env[key];
            }
            else {
                delete process.env[key];
            }
        });
    }
    
    function saveEnvironment () {
        var env = loadEnvironment.env = {};
        
        Object.keys(process.env).forEach(function (key) {
            env[key] = process.env[key];
        });
    }
    
    function testHandler (request, response) {
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.end("OK");
    }
    
    before(function () {
        doppio.loadPlugin("..");
    });
    
    after(function () {
        doppio.unloadPlugins();
    });
    
    beforeEach(function () {
        saveEnvironment();
    });
    
    afterEach(function (done) {
        loadEnvironment();
        try {
            server.stop(function () {
                // Ignore stop related errors.
                done();
            });
        }
        catch (error) {
            // Ignore errors while calling 'stop'.
            done();
        }
    });
    
    it(
        "does nothing if environment variables aren't provided",
        function (done) {
            server = doppio({ port: 12345 }, testHandler);
            
            async.waterfall(
                [
                    server.start.bind(server),
                    function (next) {
                        expect(server.url()).to.equal(
                            "http://localhost:12345/"
                        );
                        next();
                    },
                    function (next) {
                        checkUrl(server.url(), next);
                    }
                ],
                done
            );
        }
    );
    
    it(
        "uses the 'APP_URL' environment variable for external config",
        function (done) {
            var serverUrl = "https://foo.com:9443/";
            
            process.env.APP_URL = serverUrl;
            server              = doppio({ port: 12345 }, testHandler);
            
            async.waterfall(
                [
                    server.start.bind(server),
                    function (next) {
                        expect(server.url()).to.equal(serverUrl);
                        next();
                    },
                    server.stop.bind(server),
                    function (next) {
                        server = doppio(testHandler);
                        server.start(12345, next);
                    },
                    function (next) {
                        expect(server.url()).to.equal("https://foo.com:12345/");
                        next();
                    },
                    checkUrl.bind(null, "http://localhost:12345")
                ],
                done
            );
        }
    );
    
    it(
        "uses 'APP_URL' as the preferred external configuration",
        function (done) {
            process.env.APP_URL = "https://foo.com:54321";
            server              = doppio(
                {
                    hostname : "localhost",
                    port     : 12345,
                    scheme   : "http"
                },
                testHandler
            );
            
            async.waterfall(
                [
                    server.start.bind(server),
                    function (next) {
                        expect(server.url()).to.equal("https://foo.com:54321/");
                        next();
                    },
                    checkUrl.bind(null, "http://localhost:12345")
                ],
                done
            );
        }
    );
    
    it("generates the default external port from the scheme", function (done) {
        async.waterfall(
            [
                function (next) {
                    process.env.APP_URL = "http://localhost";
                    server              = doppio();
                    server.start(next);
                },
                function (next) {
                    expect(server.url()).to.equal("http://localhost:80/");
                    next();
                },
                function (next) {
                    server.stop(next);
                },
                function (next) {
                    process.env.APP_URL = "https://localhost";
                    server              = doppio();
                    server.start(next);
                },
                function (next) {
                    expect(server.url()).to.equal("https://localhost:443/");
                    next();
                },
                function (next) {
                    server.stop(next);
                },
                function (next) {
                    process.env.APP_URL = "ftp://localhost";
                    expect(function () {
                        doppio();
                    }).to.throw("Cannot determine port");
                    next();
                }
            ],
            done
        );
    });
    
    it(
        "uses the 'PORT' environment variable as the preferred internal port",
        function (done) {
            process.env.APP_URL = "https://foo.com/";
            process.env.PORT    = 54321;
            server              = doppio({ port: 12345 }, testHandler);
            
            async.waterfall(
                [
                    server.start.bind(server),
                    function (next) {
                        expect(server.url()).to.equal("https://foo.com:443/");
                        next();
                    },
                    checkUrl.bind(null, "http://localhost:54321")
                ],
                done
            );
        }
    );
    
    it(
        "can configure the PORT without configuring the APP_URL",
        function (done) {
            process.env.PORT = 54321;
            server           = doppio(testHandler);
            
            async.waterfall(
                [
                    server.start.bind(server),
                    function (next) {
                        expect(server.url()).to.equal("http://localhost:80/");
                        next();
                    },
                    checkUrl.bind(null, "http://localhost:54321")
                ],
                done
            );
        }
    );
    
    it("always uses 'http' for the internal scheme", function (done) {
        process.env.APP_URL = "https://foo.com/";
        server              = doppio({ scheme: "https" }, testHandler);
        
        async.waterfall(
            [
                server.start.bind(server, 12345),
                function (next) {
                    expect(server.url()).to.equal("https://foo.com:12345/");
                    checkUrl("http://localhost:12345/", next);
                }
            ],
            done
        );
    });
    
});
