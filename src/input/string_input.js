function StringInput(input, definition) {
    definition = typeof definition === 'undefined' ? null : definition;

    ArgvInput.call(this, [], null);

    //this.REGEX_STRING = '([^ ]+?)(?: |(?<!\\\\)"|(?<!\\\\)\'|$)';
    this.REGEX_STRING = '([^ ]+?)(?: |(?=")\\\\|(?=\')\\\\|$)';
    this.REGEX_QUOTED_STRING = '(?:"([^"\\\\]*(?:\\\\.[^"\\\\]*)*)"|\'([^\'\\\\]*(?:\\\\.[^\'\\\\]*)*)\')';

    this.setTokens(this.tokenize(input));

    if (null !== definition) {
        this.bind(definition);
    };
};

StringInput.prototype = Object.create(ArgvInput.prototype);

StringInput.prototype.tokenize = function(input) {
    input = input.replace(/(\r\n|\r|\n|\t)/g, ' ');

    var tokens = [];
    var length = input.length;
    var cursor = 0;
    while (cursor < length) {
        var str = input.slice(cursor);
        var matches = null;
        if (matches = str.match(/^\s+/)) {
        } else if (matches = str.match(new RegExp('^([^="\' ]+?)(=?)('+this.REGEX_QUOTED_STRING+'+)'))) {
            var token = matches[1]+matches[2]+matches[3].slice(1, matches[3].length - 1).replace(/("'|'"|''|"")/g, '').replace(/(\\(?![rnt]))/g, '');
            tokens.push(token);
        } else if (matches = str.match(new RegExp('^'+this.REGEX_QUOTED_STRING))) {
            var token = matches[0].slice(1, matches[0].length - 1).replace(/\\(?![rnt])/g, '');
            tokens.push(token);
        } else if (matches = str.match(new RegExp('^'+this.REGEX_STRING))) {
            var token = matches[1].replace(/\\(?![rnt])/g, '');
            tokens.push(token);
        } else {
            throw new Error('Unable to parse input near "... '+str.slice(0, 10)+' ..."');
        };

        cursor += matches[0].length;
    };

    return tokens;
};
