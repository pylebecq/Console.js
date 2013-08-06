function OutputFormatterStyleStack(emptyStyle) {
    this._emptyStyle = typeof emptyStyle === 'undefined' ? new OutputFormatterStyle() : emptyStyle;
    this.reset();
};

OutputFormatterStyleStack.prototype.reset = function() {
    this._styles = [];
};

OutputFormatterStyleStack.prototype.push = function(style) {
    this._styles.push(style);
};

OutputFormatterStyleStack.prototype.pop = function(style) {
    if (this._styles.length === 0) {
        return this._emptyStyle;
    };

    if (null === style) {
        return this._styles.pop();
    }

    for (var i = this._styles.length - 1; i >= 0; i--) {
        var currentstyle = this._styles[i];
        if (style.apply('') === currentstyle.apply('')) {
            this._styles = this._styles.slice(0, i);

            return currentstyle;
        };
    };

    throw new Error('Incorrectly nested style tag found.');
};

OutputFormatterStyleStack.prototype.getCurrent = function() {
    if (this._styles.length === 0) {
        return this._emptyStyle;
    };

    return this._styles[this._styles.length - 1];
};

OutputFormatterStyleStack.prototype.setEmptyStyle = function(style) {
    this._emptyStyle = style;

    return this;
};

OutputFormatterStyleStack.prototype.getEmptyStyle = function() {
    return this._emptyStyle;
};
