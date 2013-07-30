Input = function(definition) {
    definition = typeof definition === 'undefined' ? null : definition;

    this._interactive = true;
    if (null === definition) {
        this._arguments = {};
        this._options = {};
        this._definition = new InputDefinition();
    } else {
        this.bind(definition);
        this.validate();
    };
};

Input.prototype.bind = function(definition) {
    this._arguments = {};
    this._options = {};
    this._definition = definition;

    this.parse();
};

Input.prototype.parse = function() {
    throw new Error('You must override this method.');
};

Input.prototype.validate = function() {
    if (Object.getOwnPropertyNames(this._arguments).length < this._definition.getArgumentRequiredCount()) {
        throw new Error('Not enough arguments.');
    };
};

Input.prototype.isInteractive = function() {
    return this._interactive;
};

Input.prototype.setInteractive = function(interactive) {
    this._interactive = interactive;
};

Input.prototype.getArguments = function() {
    return merge(this._definition.getArgumentDefaults(), this._arguments);
};

Input.prototype.getArgument = function(name) {
    if (!this._definition.hasArgument(name)) {
        throw new Error('The "'+name+'" argument does not exist.');
    };

    return (this._arguments.hasOwnProperty(name) && null !== this._arguments[name]) ? this._arguments[name] : this._definition.getArgument(name).getDefault();
};

Input.prototype.setArgument = function(name, value) {
    if (!this._definition.hasArgument(name)) {
        throw new Error('The "'+name+'" argument does not exist.');
    };

    this._arguments[name] = value;
};

Input.prototype.hasArgument = function(name) {
    return this._definition.hasArgument(name);
};

Input.prototype.getOptions = function() {
    return merge(this._options.getOptionDefaults(), this._options);
};

Input.prototype.getOption = function(name) {
    if (!this._definition.hasOption(name)) {
        throw new Error('The "'+name+'" option does not exist.');
    };

    return (this._options.hasOwnProperty(name) && null !== this._options[name]) ? this._options[name] : this._definition.getOption(name).getDefault();
};

Input.prototype.setOption = function(name, value) {
    if (!this._definition.hasOption(name)) {
        throw new Error('The "'+name+'" option does not exist.');
    };

    this._options[name] = value;
};

Input.prototype.hasOption = function(name) {
    return this._definition.hasOption(name);
};
