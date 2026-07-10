import './requirements'

const commandAliases = {
    crm3: () => import('./commands/crm3')
} as const;

type CommandName = keyof typeof commandAliases;

async function loadCommand(...args: string[]) {
    const commandName = args[0] as CommandName;
    const commandLoader = commandAliases[commandName];
    if (!commandLoader) {
        throw new Error(`Command "${commandName}" not found.`);
    }
    const commandModule = await commandLoader();
    const cmd = new commandModule.default();
    const options = args.slice(1).map((arg) => arg.trim().split('=')).reduce((acc, [key, value]) => {
        acc[key] = value || true; // If no value is provided, set it to true (for flags)
        return acc;
    }, {} as Record<string, string|boolean>);
    if (options.help) {
        cmd.help();
        return;
    }
    await cmd.run.apply(cmd, [options]);
}

const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('No command provided.');
    process.exit(1);
}

// const commandName = args[0] as CommandName;
loadCommand(...args);