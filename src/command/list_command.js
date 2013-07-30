ListCommand = function() {
    Command.call(this, 'list');
};

extend_proto(Command, ListCommand);

ListCommand.prototype.configure = function() {
    this
        .setName('list')
        .setDefinition([
            new InputArgument('namespace', ARGUMENT_OPTIONAL, 'The namespace name.')
        ])
        .setDescription('List commands.')
        .setHelp('The <info>%command.name%</info> command list all commands.\n\
\n\
  <info>list</info>\n\
\n\
  You can also display the commands for a specific namespace:\n\
\n\
  <info>list contact</info>')
    ;
};

ListCommand.prototype.execute = function(input, output) {
    output.writeln(this.getApplication().asText(input.getArgument('namespace'), false));
};
