function NullOutput() {};

NullOutput.prototype = Object.create(Output.prototype);

NullOutput.prototype.doWrite = function(message, newline) {
    return;
};
