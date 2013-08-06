function HelpCommand() {
    Command.call(this, 'help');

    this._command = null;
};

HelpCommand.prototype = Object.create(Command.prototype);

HelpCommand.prototype.configure = function() {
    this.ignoreValidationErrors();

    this
        .setName('help')
        .setDefinition([
            new InputArgument('command_name', ARGUMENT_OPTIONAL, 'The command name.', 'help')
        ])
        .setDescription('Display help for a command.')
        .setHelp('The <info>%command.name%</info> command displays help for a given command:\n\
\n\
  <info>help list</info>\n\
\n\
 To display the list of available commands, please use the <info>list</info> command.')
    ;
};

HelpCommand.prototype.setCommand = function(command) {
    this._command = command;

    return this;
};

HelpCommand.prototype.execute = function(input, output) {
    if (null === this._command) {
        this._command = this.getApplication().find(input.getArgument('command_name'));
    };

    output.writeln(this._command.asText());

    this._command = null;
};
