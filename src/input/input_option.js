var OPTION_VALUE_NONE = 1;
var OPTION_VALUE_REQUIRED = 2;
var OPTION_VALUE_OPTIONAL = 4;
var OPTION_VALUE_IS_ARRAY = 8;

InputOption = function(name, shortcut, mode, description, defaultValue) {
    this._shortcut = null;
    this._mode = null;
    this._default = null;

    if (0 === name.indexOf('--')) {
        name = name.slice(2);
    };

    if (0 === name.length) {
        throw new Error('An option name cannot be empty.');
    };

    if (typeof shortcut === 'undefined' || (typeof shortcut === 'String' && 0 === shortcut.length)) {
        shortcut = null;
    };

    if (null !== shortcut) {
        if ('-' === shortcut.slice(0, 1)) {
            shortcut = shortcut.slice(1);
        };

        if (0 === shortcut.length) {
            throw new Error('An option shortcut cannot be empty.');
        };
    };

    mode = typeof mode === 'undefined' ? null : parseInt(mode);
    if (null === mode) {
        mode = OPTION_VALUE_NONE;
    } else if (isNaN(mode) || mode > 15 || mode < 1) {
        throw new Error('Option mode "'+mode+'" is not valid.');
    };

    this._name = name;
    this._shortcut = shortcut;
    this._mode = mode;
    this._description = (undefined === description || null === description ? '' : description);

    if (this.isArray() && !this.acceptValue()) {
        throw new Error('Impossible to have an option mode OPTION_VALUE_IS_ARRAY if the option does not accept a value.');
    };

    this.setDefault(defaultValue);
}

InputOption.prototype.getShortcut = function() {
    return this._shortcut;
};

InputOption.prototype.getName = function() {
    return this._name;
};

InputOption.prototype.acceptValue = function() {
    return this.isValueRequired() || this.isValueOptional();
};

InputOption.prototype.isValueRequired = function() {
    return OPTION_VALUE_REQUIRED === (OPTION_VALUE_REQUIRED & this._mode);
};

InputOption.prototype.isValueOptional = function() {
    return OPTION_VALUE_OPTIONAL === (OPTION_VALUE_OPTIONAL & this._mode);
};

InputOption.prototype.isArray = function() {
    return OPTION_VALUE_IS_ARRAY === (OPTION_VALUE_IS_ARRAY & this._mode);
};

InputOption.prototype.setDefault = function(defaultValue) {
    defaultValue = typeof defaultValue === 'undefined' ? null : defaultValue;
    if (OPTION_VALUE_NONE === (OPTION_VALUE_NONE & this._mode) && null !== defaultValue) {
        throw new Error('Cannot set a default value when using OPTION_VALUE_NONE mode.');
    };

    if (this.isArray()) {
        if (null === defaultValue) {
            defaultValue = [];
        } else if (typeof defaultValue !== 'Array') {
            throw new Error('A default value for an array option must be an array.');
        };
    };

    this._default = this.acceptValue() ? defaultValue : false;
};

InputOption.prototype.getDefault = function() {
    return this._default;
};

InputOption.prototype.getDescription = function() {
    return this._description;
};

InputOption.prototype.equals = function(option) {
    return this.getName() === option.getName()
        && this.getShortcut() === option.getShortcut()
        && this.getDefault() === option.getDefault()
        && this.isArray() === option.isArray()
        && this.isValueRequired() === option.isValueRequired()
        && this.isValueOptional() === option.isValueOptional()
    ;
};
