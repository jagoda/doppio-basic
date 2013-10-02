var url = require("url");

module.exports = function (options) {
    
    var appUrl = process.env.APP_URL,
        port   = process.env.PORT,
        urlParts;
    
    function getDefaultPort (scheme) {
        var port;
        
        if (scheme === "http") {
            port = 80;
        }
        else if (scheme === "https") {
            port = 443;
        }
        else {
            throw new Error(
                "Cannot determine port for scheme '" + scheme + "'."
            );
        }
        
        return port;
    }
    
    function getDescriptor (name) {
        var descriptor = options[name];
        
        if (name in options && typeof descriptor !== "object") {
            descriptor = {
                private : descriptor,
                public  : descriptor
            };
        }
        
        return descriptor;
    }
    
    // Default option values.
    if (appUrl || port) {
        options.scheme         = getDescriptor("scheme") || {};
        options.scheme.public  = options.scheme.public || "http";
        options.scheme.private = "http";
        
        options.port           = getDescriptor("port") || {};
        options.port.public    = options.port.public ||
            getDefaultPort(options.scheme.private);
    }
    // Configure the public URL.
    if (appUrl) {
        urlParts          = url.parse(appUrl);
        // Ensure that protocol does not contain ':'.
        urlParts.protocol = urlParts.protocol.replace(/:$/, "");
        
        options.hostname       = urlParts.hostname;
        options.port.public    = parseInt(urlParts.port, 10) ||
            getDefaultPort(urlParts.protocol);
        options.scheme.public  = urlParts.protocol;
    }
    // Configure the private port.
    if (port) {
        options.port.private = parseInt(port, 10);
    }
    
    return options;
    
};
