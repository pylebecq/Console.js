function Command(name) {
    this._application = null;
    this._name = null;
    this._aliases = [];
    this._definition = new InputDefinition();
    this._help = null;
    this._description = null;
    this._ignoreValidationErrors = false;
    this._applicationDefinitionMerged = false;
    this._applicationDefinitionMergedWithArgs = false;
    this._code = null;
    this._synopsis = null;
    this._helperSet = null;

    if (name) {
        this.setName(name);
    };

    this.configure();

    if (!this._name) {
        throw new Error('The command name cannot be empty.');
    };
};

Command.prototype.execute = function(input, output) {
    throw new Error('You must override the execute() method in the concrete command class.');
};

Command.prototype.interact = function(input, output) {};

Command.prototype.initialize = function(input, output) {};

Command.prototype.run = function(input, output) {
    // Force the creation of the synopsis before the merge with the application definition
    this.getSynopsis();

    // Add the application arguments and options
    this.mergeApplicationDefinition();

    // Bind the input agains the command specific arguments/options
    try {
        input.bind(this._definition);
    } catch (error) {
        if (!this._ignoreValidationErrors) {
            throw error;
        };
    };

    this.initialize(input, output);

    if (input.isInteractive()) {
        this.interact(input, output);
    };

    input.validate();

    if (this._code) {
        var statusCode = this._code.call(undefined, input, output);
    } else {
        var statusCode = this.execute(input, output);
    };

    return isNaN(parseInt(statusCode, 10)) ? 0 : parsetInt(statusCode, 10);
};

Command.prototype.setCode = function(code) {
    if (typeof code !== 'function') {
        throw new Error('Invalid callable provided to Command::setCode.');
    };

    this._code = code;

    return this;
};

Command.prototype.mergeApplicationDefinition = function(mergeArgs) {
    mergeArgs = typeof mergeArgs !== 'undefined' ? mergeArgs : true;

    if (null === this._application || (true === this._applicationDefinitionMerged && (this._applicationDefinitionMergedWithArgs || !mergeArgs))) {
        return;
    };

    if (mergeArgs) {
        var currentArguments = this._definition.getArguments();
        this._definition.setArguments(clone(this._application.getDefinition().getArguments()));
        this._definition.addArguments(currentArguments);
    };

    this._definition.addOptions(this._application.getDefinition().getOptions());

    this._applicationDefinitionMerged = true;
    if (mergeArgs) {
        this._applicationDefinitionMergedWithArgs = true;
    };
};

Command.prototype.setDefinition = function(definition) {
    if (definition instanceof InputDefinition) {
        this._definition = definition;
    } else {
        this._definition.setDefinition(definition);
    };

    this._applicationDefinitionMerged = false;

    return this;
};

Command.prototype.addArgument = function(name, mode, description, _default) {
    this._definition.addArgument(new InputArgument(name, mode, description, _default));

    return this;
};

Command.prototype.addOption = function(name, shortcut, mode, description, _default) {
    this._definition.addOption(new InputOption(name, shortcut, mode, description, _default));

    return this;
};

Command.prototype.getProcessedHelp = function() {
    if (null !== this._help) {
        return this._help.replace('%command.name%', this._name);
    };

    return null;
};

Command.prototype.setAliases = function(aliases) {
    for (var i = aliases.length - 1; i >= 0; i--) {
        this.validateName(aliases[i]);
    };

    this._aliases = aliases;

    return this;
};

Command.prototype.getAliases = function() {
    return this._aliases;
};

Command.prototype.getHelper = function(name) {
    return this._helperSet[name];
};

Command.prototype.asText = function() {
    if (this._application && !this._applicationDefinitionMerged) {
        this.getSynopsis();
        this.mergeApplicationDefinition(false);
    };

    var messages = [
        '<comment>Usage:</comment>',
        ' '+this.getSynopsis(),
        '',
    ];

    if (this._aliases.length) {
        messages.push('<comment>Aliases:</comment> <info>'+this._aliases.join(', ')+'</info>');
    };

    messages = messages.concat(this._definition.asText());

    var help = this.getProcessedHelp();
    if (help) {
        console.log(help);
        messages.push('<comment>Help:</comment>');
        messages.push(' '+help.replace('\n', '\n ')+'\n');
    };

    return messages.join('\n');
};

Command.prototype.getSynopsis = function() {
    if (null === this._synopsis) {
        this._synopsis = this._name+" "+this._definition.getSynopsis();
    };

    return this._synopsis;
};

Command.prototype.configure = function() {
    return;
};

Command.prototype.isSecret = function() {
    return false;
};

Command.prototype.isEnabled = function() {
    return true;
};

Command.prototype.setApplication = function(application) {
    this._application = application;
    if (application) {
        this._helperSet = application.helperSet;
    } else {
        this._helperSet = null;
    };
};

Command.prototype.setName = function(name) {
    this.validateName(name);
    this._name = name;

    return this;
};

Command.prototype.getName = function() {
    return this._name;
};

Command.prototype.validateName = function(name) {
    if (!name.match(/^[^\:]+(\:[^\:]+)*$/)) {
        throw new Error('Command name "'+name+'" is invalid.');
    };
};

Command.prototype.setDescription = function(description) {
    this._description = description;

    return this;
};

Command.prototype.getDescription = function() {
    return this._description;
};

Command.prototype.setHelp = function(help) {
    this._help = help;

    return this;
};

Command.prototype.getHelp = function() {
    return this._help;
};

Command.prototype.ignoreValidationErrors = function() {
    this._ignoreValidationErrors = true;
};

Command.prototype.getApplication = function() {
    return this._application;
};
