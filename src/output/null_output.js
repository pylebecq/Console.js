NullOutput = function() {
};

extend_proto(Output, NullOutput);

NullOutput.prototype.doWrite = function(message, newline) {
    return;
};
