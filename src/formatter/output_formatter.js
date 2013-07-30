OutputFormatter = function(decorated, styles) {
    this.FORMAT_PATTERN = new XRegExp('(\\\\?)<(/?)([a-z][a-z0-9_=;-]+)?>((?: [^<\\\\]+ | (?!<(?:/?[a-z]|/>)). | \\\\<. )*)', 'gisx');

    styles = typeof styles === 'undefined' ? [] : styles;
    this._decorated = typeof decorated === 'undefined' ? false : decorated;
    this._styles = {};
    this._styleStack = null;

    this.setStyle('error', new OutputFormatterStyle('white', 'red'));
    this.setStyle('info', new OutputFormatterStyle('green'));
    this.setStyle('comment', new OutputFormatterStyle('yellow'));
    this.setStyle('question', new OutputFormatterStyle('black', 'cyan'));

    for (var i = styles.length - 1; i >= 0; i--) {
        this.setStyle(styles[i]);
    };

    this._styleStack = new OutputFormatterStyleStack();
};

OutputFormatter.prototype.escape = function(text) {
    return text.replace(/([^\\\\]?)</i, '$1\\<');
};

OutputFormatter.prototype.setDecorated = function(decorated) {
    this._decorated = decorated;
};

OutputFormatter.prototype.isDecorated = function() {
    return this._decorated;
};

OutputFormatter.prototype.setStyle = function(name, style) {
    this._styles[name.toLowerCase()] = style;
};

OutputFormatter.prototype.hasStyle = function(name) {
    return undefined !== this._styles[name.toLowerCase()];
};

OutputFormatter.prototype.getStyle = function(name) {
    if (!this.hasStyle(name)) {
        throw new Error('Undefined style: '+name);
    };

    return this._styles[name.toLowerCase()];
};

OutputFormatter.prototype.format = function(message) {
    var that = this;
    message = message.replace(this.FORMAT_PATTERN, function(match, n1, n2, n3, n4, offset, input) {
        if ('\\' === n1) {
            return that.applyCurrentStyle(match);
        };

        if ('' === n3) {
            if ('/' === n2) {
                that._styleStack.pop();

                return that.applyCurrentStyle(n4);
            };

            // we got "<>" tag
            return '<>'+that.applyCurrentStyle(n4);
        };

        if (undefined !== n3 && undefined !== that._styles[n3.toLowerCase()]) {
            var style = that._styles[n3.toLowerCase()];
        } else {
            var style = that.createStyleFromString(n3);

            if (false === style) {
                return that.applyCurrentStyle(match);
            };
        };

        if ('/' === n2) {
            that._styleStack.pop(style);
        } else {
            that._styleStack.push(style);
        };

        return that.applyCurrentStyle(n4);
    });

    return message.replace('\\<', '<');
};

OutputFormatter.prototype.createStyleFromString = function(string) {
    if (undefined === string) {
        return false;
    }

    var match = string.toLowerCase().match(/([^=]+)=([^;]+)(;|$)/g);
    if (!match) {
        return false;
    }

    return false;

    throw new Error('Not implemented');
};

OutputFormatter.prototype.applyCurrentStyle = function(text) {
    return this.isDecorated() && text.length > 0 ? this._styleStack.getCurrent().apply(text) : text;
};
