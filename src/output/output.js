var OUTPUT_VERBOSITY_QUIET   = 0;
var OUTPUT_VERBOSITY_NORMAL  = 1;
var OUTPUT_VERBOSITY_VERBOSE = 2;

Output = function(verbosity, decorated, formatter) {
    this.VERBOSITY_QUIET   = 0;
    this.VERBOSITY_NORMAL  = 1;
    this.VERBOSITY_VERBOSE = 2;

    this.OUTPUT_NORMAL = 0;
    this.OUTPUT_RAW    = 1;
    this.OUTPUT_PLAIN  = 2;

    this._verbosity = typeof verbosity === 'undefined' ? this.VERBOSITY_NORMAL : verbosity;
    this._formatter = typeof formatter === 'undefined' ? new OutputFormatter() : formatter;
    this._formatter.setDecorated(decorated);
};

Output.prototype.setFormatter = function(formatter) {
    this._formatter = formatter;
};

Output.prototype.getFormatter = function(formatter) {
    return this._formatter;
};

Output.prototype.setDecorated = function(decorated) {
    this._formatter.setDecorated(decorated);
};

Output.prototype.isDecorated = function() {
    return this._formatter.isDecorated();
};

Output.prototype.setVerbosity = function(level) {
    this._verbosity = level;
};

Output.prototype.getVerbosity = function() {
    return this._verbosity;
};

Output.prototype.writeln = function(messages, type) {
    type = typeof type === 'undefined' ? 0 : type;
    this.write(messages, true, type);
};

Output.prototype.write = function(messages, newline, type) {
    if (this.VERBOSITY_QUIET === this._verbosity) {
        return;
    };

    messages = messages instanceof Array ? messages : [messages];
    for (var i = messages.length - 1; i >= 0; i--) {
        var message = messages[i];
        switch (type) {
            case this.OUTPUT_NORMAL:
                message = this._formatter.format(message);
                break;
            case this.OUTPUT_RAW:
                break;
            case this.OUTPUT_PLAIN:
                message = strip_tags(this._formatter.format(message));
                break;
            default:
                throw new Error('Unknown output type given ('+type+')');
        };

        this.doWrite(message, newline);
    };
};

Output.prototype.doWrite = function(message, newline) {
    throw new Error('You must override this method.');
};
