JqueryTerminalOutput = function(terminal, verbosity, decorated, formatter) {
    terminal = typeof terminal === 'undefined' ? null : terminal;
    decorated = typeof decorated === 'undefined' ? null : decorated;

    if (null === terminal) {
        throw new Error('The JqueryTerminalOutput class needs a Terminal object as its first argument.');
    }

    this._terminal = terminal;
    if (null === decorated) {
        decorated = true;
    }

    Output.call(this, verbosity, decorated, formatter);
};

extend_proto(Output, JqueryTerminalOutput);

JqueryTerminalOutput.prototype.getTerminal = function() {
    return this._terminal;
};

JqueryTerminalOutput.prototype.doWrite = function(message, newline) {
    this._terminal.echo(message);
};
