ArgvInput = function(argv, definition) {
    argv = typeof argv === 'undefined' ? null : argv;
    definition = typeof definition === 'undefined' ? null : definition;

    if (null === argv) {
        throw new Error('argv parameter must an array.');
    };

    this._parsed = null;
    this._tokens = argv;

    Input.call(this, definition)
};

extend_proto(Input, ArgvInput);

ArgvInput.prototype.setTokens = function(tokens) {
    this._tokens = tokens;
};

ArgvInput.prototype.parse = function() {
    var parseOptions = true;
    this._parsed = clone(this._tokens);
    for (var i = 0; i < this._parsed.length; i++) {
        var token = this._parsed[i];
        if (parseOptions && '' == token) {
            this.parseArgument(token);
        } else if (parseOptions && '--' == token) {
            parseOptions = false;
        } else if (parseOptions && 0 === token.indexOf('--')) {
            this.parseLongOption(token);
        } else if (parseOptions && '-' === token.slice(0, 1)) {
            this.parseShortOption(token);
        } else {
            this.parseArgument(token);
        };
    };
};

ArgvInput.prototype.parseShortOption = function(token) {
    var name = token.slice(1);

    if (name.length > 1) {
        var shortcut = name.slice(0, 1);
        if (this._definition.hasShortcut(shortcut) && this._definition.getOptionForShortcut(shortcut).acceptValue()) {
            this.addShortOption(shortcut, name.slice(1));
        } else {
            this.parseShortOptionSet(name);
        };
    } else {
        this.addShortOption(name, null);
    };
};

ArgvInput.prototype.parseShortOptionSet = function(name) {
    var len = name.length;
    for (var i = len - 1; i >= 0; i--) {
        var shortcut = name.slice(i, 1);
        if (!this._definition.hasShortcut(shortcut)) {
            throw new Error('The "-'+shortcut+'" option does not exist.');
        };

        var option = this._definition.getOptionForShortcut(shortcut);
        if (option.acceptValue()) {
            this.addLongOption(option.getName(), i === len - 1 ? null : name.slice(i + 1));

            break;
        } else {
            this.addLongOption(option.getName(), true);
        };
    };
};

ArgvInput.prototype.parseLongOption = function(token) {
    var name = token.slice(2);
    var pos = name.indexOf('=');
    if (pos >= 0) {
        this.addLongOption(name.slice(0, pos), name.slice(pos + 1));
    } else {
        this.addLongOption(name, null);
    };
};

ArgvInput.prototype.parseArgument = function(token) {
    var c = Object.getOwnPropertyNames(this._arguments).length;

    if (this._definition.hasArgument(c)) {
        var arg = this._definition.getArgument(c);
        this._arguments[arg.getName()] = arg.isArray() ? [token] : token;
    } else if (this._definition.hasArgument(c - 1) && this._definition.getArgument(c - 1).isArray()) {
        var arg = this._definition.getArgument(c - 1);
        this._arguments[arg.getName()].push(token);
    } else {
        throw new Error('Too many arguments.');
    };
};

ArgvInput.prototype.addShortOption = function(shortcut, value) {
    if (!this._definition.hasShortcut(shortcut)) {
        throw new Error('The "-'+shortcut+'" option does not exist.');
    };

    this.addLongOption(this._definition.getOptionForShortcut(shortcut).getName(), value);
};

ArgvInput.prototype.addLongOption = function(name, value) {
    if (!this._definition.hasOption(name)) {
        throw new Error('The "--'+name+'" option does not exist.');
    };

    var option = this._definition.getOption(name);
    if (-1 === value) {
        value = null;
    };

    if (null === value && option.acceptValue() && this._parsed.length) {
        var next = this._parsed.shift();
        if (next.length && '-' !== next.slice(0, 1)) {
            value = next;
        } else if (0 === next.length) {
            value = '';
        } else {
            this._parsed.unshift(next);
        };
    };

    if (null === value) {
        if (option.isValueRequired()) {
            throw new Error('The "--'+name+'" option requires a value.');
        };

        if (!option.isArray()) {
            value = option.isValueOptional() ? option.getDefault() : true;
        };
    };

    if (option.isArray()) {
        this._options[name].push(value);
    } else {
        this._options[name] = value;
    };
};

ArgvInput.prototype.getFirstArgument = function() {
    for (var i in this._tokens) {
        var token = this._tokens[i];
        if (token && '-' === token.slice(0, 1)) {
            continue;
        };

        return token;
    };
};

ArgvInput.prototype.hasParameterOption = function(values) {
    values = values instanceof Array ? values : [values];

    for (var i = this._tokens.length - 1; i >= 0; i--) {
        var token = this._tokens[i];
        if (values.indexOf(token) >= 0) {
            return true;
        }
    };

    return false;
};

ArgvInput.prototype.getParameterOption = function(values, useDefault) {
    useDefault = typeof useDefault === 'undefined' ? false : useDefault;
    values = values instanceof Array ? values : [values];

    var tokens = clone(this._tokens);
    var token = null;
    while (token = tokens.shift()) {
        for (var i = values.length - 1; i >= 0; i--) {
            var value = values[i];
            if (token.indexOf(value) === 0) {
                var pos = token.indexOf('=');
                if (pos > -1) {
                    return token.slice(pos + 1);
                };

                return tokens.shift();
            };
        };
    };
};
