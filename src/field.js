const crypto = require('crypto');
const checkRequiredArgs = require('./helpers').checkRequiredArgs;


function createPrimitiveFieldBatchCmd(argsArray) {
    return {
        'command': 'fibery.schema/batch',
        'args': {
            'commands': argsArray.map(args => ({
                'command': 'schema.field/create',
                'args': args
            }))
        }
    };
}

function createRelationFieldBatchCmd(argsArray) {
    checkRequiredArgs('Create relation Fields',
        ['to', 'toName', 'isFromMany', 'isToMany'], argsArray.map(args => args.meta));

    const commands = argsArray.reduce((acc, args) => {
        const relation = crypto.randomUUID();
        const pair = [
            {
                'fibery/holder-type': args['fibery/holder-type'],
                'fibery/name': args['fibery/name'],
                'fibery/type': args.meta.to,
                'fibery/meta': {'fibery/collection?': args.meta.isToMany, 'fibery/relation': relation}
            },
            {
                'fibery/holder-type': args.meta.to,
                'fibery/name': args.meta.toName,
                'fibery/type': args['fibery/holder-type'],
                'fibery/meta': {'fibery/collection?': args.meta.isFromMany, 'fibery/relation': relation}
            }
        ];

        const pairCommands = pair.map(field => ({
            'command': 'schema.field/create',
            'args': field
        }));

        return acc.concat(pairCommands);
    }, []);

    return {
        'command': 'fibery.schema/batch',
        'args': {'commands': commands}
    };
}

function createSingleSelectFieldBatchCmd(argsArray) {
    checkRequiredArgs('Create single-select Fields',
        ['options'], argsArray.map(args => args.meta));

    const commands = argsArray.reduce((acc, args) => {
        if (!args.meta.options.length) {
            throw new Error(`Create single-select Fields. Values are missing for ${args['fibery/name']}`);
        }

        const [namespace, typeName] = args['fibery/holder-type'].split('/');
        const fieldName = args['fibery/name'].split('/')[1];
        const enumName = `${namespace}/${fieldName}_${namespace}/${typeName}`;

        const schemaCommand = {
            'command': 'fibery.schema/batch',
            'args': {
                'commands': [
                    {
                        'command': 'schema.enum/create',
                        'args': {'fibery/name': enumName}
                    },
                    {
                        'command': 'schema.field/create',
                        'args': {
                            'fibery/holder-type': args['fibery/holder-type'],
                            'fibery/name': args['fibery/name'],
                            'fibery/type': enumName
                        }
                    }
                ]
            }
        };

        const options = args.meta.options.map(option => Object.assign({id: crypto.randomUUID()}, option));
        const RANK_DISTANCE = 10 ** 6;
        const entityCommands = options.map((option, i) => ({
            'command': 'fibery.entity/create',
            'args': {
                'type': enumName,
                'entity': {
                    'enum/name': option.name,
                    'fibery/id': option.id,
                    'fibery/rank': i * RANK_DISTANCE
                }
            }

        }));

        const metaCommand = {
            'command': 'fibery.schema/batch',
            'args': {
                'commands': [
                    {key: 'fibery/default-value', value: {'fibery/id': options[0].id}},
                    {key: 'fibery/required?', value: true}
                ].map(meta => ({
                    'command': 'schema.field/set-meta',
                    'args': Object.assign({
                        'name': args['fibery/name'],
                        'holder-type': args['fibery/holder-type']
                    }, meta)
                }))
            }
        };

        return acc.concat(schemaCommand, ...entityCommands, metaCommand);
    }, []);

    return {
        'command': 'fibery.command/batch',
        'args': {'commands': commands}
    }
}

function createFieldBatchCmd(argsArray) {
    if (!argsArray.length) {
        return null;
    }

    checkRequiredArgs('Create Fields',
        ['fibery/holder-type', 'fibery/name', 'fibery/type'], argsArray);


    const fields = argsArray.reduce((acc, args) => {
        if (args['fibery/type'] === 'relation') {
            acc.relation.push(args);
        } else if (args['fibery/type'] === 'single-select') {
            acc.singleSelect.push(args);
        } else {
            acc.primitive.push(args);
        }

        return acc;
    }, {primitive: [], relation: [], singleSelect: []});


    const commands = [];
    if (fields.primitive.length) {
        commands.push(createPrimitiveFieldBatchCmd(fields.primitive));
    }

    if (fields.relation.length) {
        commands.push(createRelationFieldBatchCmd(fields.relation));
    }

    if (fields.singleSelect.length) {
        commands.push(createSingleSelectFieldBatchCmd(fields.singleSelect));
    }

    return commands.length === 1 ? commands[0] : {
        command: 'fibery.command/batch',
        args: {commands: commands}
    }
}

function renameFieldBatchCmd(argsArray) {
    checkRequiredArgs('Rename Fields', ['holder-type', 'from-name', 'to-name'], argsArray);

    return {
        command: 'fibery.schema/batch',
        args: {
            'commands': argsArray.map(args => ({
                'command': 'schema.field/rename',
                'args': args
            }))
        }
    };
}

function deleteFieldBatchCmd(argsArray) {
    checkRequiredArgs('Delete Fields', ['holder-type', 'name'], argsArray);

    return {
        command: 'fibery.schema/batch',
        args: {
            'commands': argsArray.map(args => ({
                'command': 'schema.field/delete',
                'args': args
            }))
        }
    };
}


const PRIMITIVE_FIELD_TYPES = [
    'fibery/int',
    'fibery/decimal',
    'fibery/rank',
    'fibery/text',
    'fibery/rich-text',
    'fibery/email',
    'fibery/emoji',
    'fibery/uuid',
    'fibery/date',
    'fibery/date-time',
    'fibery/bool',
    'fibery/json-value',
    'fibery/date-time-range',
    'fibery/date-range'
];

const SYNTHETIC_FIELD_TYPES = [
    'single-select',
    'relation'
];

module.exports = {
    commands: {
        createFieldBatchCmd,
        renameFieldBatchCmd,
        deleteFieldBatchCmd
    },
    meta: {
        PRIMITIVE_FIELD_TYPES,
        SYNTHETIC_FIELD_TYPES
    }
};
