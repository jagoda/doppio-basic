var url = require("url");

module.exports = function (options) {
    
    var appUrl = process.env.APP_URL,
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
    
    if (appUrl) {
        urlParts = url.parse(appUrl);
        
        // Ensure that protocol does not contain ':'.
        urlParts.protocol = urlParts.protocol.replace(/:$/, "");
        
        options.hostname    = urlParts.hostname;
        options.port        = getDescriptor("port") || {};
        options.port.public = parseInt(urlParts.port, 10) ||
            getDefaultPort(urlParts.protocol);
        options.port.private = "PORT" in process.env ?
            parseInt(process.env.PORT, 10) :
            options.port.private;
        
        options.scheme         = getDescriptor("scheme") || {};
        options.scheme.public  = urlParts.protocol;
        options.scheme.private = "http";
    }
    
    return options;
    
};
