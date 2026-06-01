const checkRequiredArgs = require('./helpers').checkRequiredArgs;


function createDomainTypeCmds(args) {
    const meta = args['fibery/meta'] || {};
    const fields = args['fibery/fields'] || [];

    const fieldNames = fields.map(f => f['fibery/name']);
    const missingDomainFields = DOMAIN_TYPE_FIELDS.filter(df => !fieldNames.includes(df['fibery/name']));
    fields.push(...missingDomainFields);

    return [
        {
            command: 'schema.type/create',
            args: {
                'fibery/name': args['fibery/name'],
                'fibery/meta': meta,
                'fibery/fields': fields
            },
        },
        {
            command: 'fibery.app/install-mixins',
            args: {
                types: {
                    [args['fibery/name']]: ['fibery/rank-mixin']
                }
            },
        }
    ];
}


function createTypeBatchCmd(argsArray) {
    checkRequiredArgs('Create Types', ['fibery/name'], argsArray);

    const commands = argsArray.reduce((acc, args) => {
        if (args['fibery/meta'] && args['fibery/meta']['fibery/domain?']) {
            return acc.concat(createDomainTypeCmds(args));
        } else {
            return acc.concat({
                'command': 'schema.type/create',
                'args': args
            })
        }
    }, []);

    return {
        command: 'fibery.schema/batch',
        args: {
            'commands': commands
        }
    };
}


function renameTypeBatchCmd(argsArray) {
    checkRequiredArgs('Rename Types', ['from-name', 'to-name'], argsArray);

    return {
        command: 'fibery.schema/batch',
        args: {
            'commands': argsArray.map(args => ({
                'command': 'schema.type/rename',
                'args': args
            }))
        }
    };
}


function deleteTypeBatchCmd(argsArray) {
    checkRequiredArgs('Delete Types', ['name'], argsArray);

    return {
        command: 'fibery.schema/batch',
        args: {
            'commands': argsArray.map(args => ({
                'command': 'schema.type/delete',
                'args': args
            }))
        }
    };
}


const DOMAIN_TYPE_FIELDS = [
    {
        'fibery/name': `fibery/name`,
        'fibery/type': 'fibery/text',
        'fibery/meta': {
            'fibery/secured?': false,
            'ui/title?': true
        }
    },
    {
        'fibery/name': 'fibery/id',
        'fibery/type': 'fibery/uuid',
        'fibery/meta': {
            'fibery/secured?': false,
            'fibery/id?': true,
            'fibery/readonly?': true
        }
    },
    {
        'fibery/name': 'fibery/public-id',
        'fibery/type': 'fibery/text',
        'fibery/meta': {
            'fibery/secured?': false,
            'fibery/public-id?': true,
            'fibery/readonly?': true
        }
    },
    {
        'fibery/name': 'fibery/creation-date',
        'fibery/type': 'fibery/date-time',
        'fibery/meta': {
            'fibery/secured?': false,
            'fibery/creation-date?': true,
            'fibery/readonly?': true,
            'fibery/default-value': '$now'
        }
    },
    {
        'fibery/name': 'fibery/modification-date',
        'fibery/type': 'fibery/date-time',
        'fibery/meta': {
            'fibery/modification-date?': true,
            'fibery/required?': true,
            'fibery/readonly?': true,
            'fibery/default-value': '$now',
            'fibery/secured?': false
        }
    }
];

module.exports = {
    commands: {
        createTypeBatchCmd,
        renameTypeBatchCmd,
        deleteTypeBatchCmd
    },
    meta: {
        DOMAIN_TYPE_FIELDS
    }
};