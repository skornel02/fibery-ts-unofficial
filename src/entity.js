const checkRequiredArgs = require('./helpers').checkRequiredArgs;

function queryEntityCmd(query, params = null) {
    checkRequiredArgs('Select Entities', ['q/from', 'q/select'], [query]);

    return {
        command: 'fibery.entity/query',
        args: { query, params }
    };
}

// TODO: select rich text

function createEntityBatchCmds(argsArray) {
    checkRequiredArgs('Create Entities', ['type', 'entity'], argsArray);

    return argsArray.map(args => ({
        'command': 'fibery.entity/create',
        args
    }));
}

// TODO: create with rich text

function updateEntityBatchCmds(argsArray) {
    checkRequiredArgs('Update Entities', ['fibery/id'], argsArray.map(args => args.entity));

    return argsArray.map(args => ({
        'command': 'fibery.entity/update',
        args
    }));
}

// TODO: update rich text

function addToEntityCollectionFieldBatchCmds(argsArray) {
    checkRequiredArgs('Add to entity collection', ['type', 'field', 'entity', 'items'], argsArray);

    return argsArray.map(args => ({
        'command': 'fibery.entity/add-collection-items',
        args
    }));
}

function removeFromEntityCollectionFieldBatchCmds(argsArray) {
    checkRequiredArgs('Remove from entity collection', ['type', 'field', 'entity', 'items'], argsArray);

    return argsArray.map(args => ({
        'command': 'fibery.entity/remove-collection-items',
        args
    }));
}

function deleteEntityBatchCmds(argsArray) {
    checkRequiredArgs('Delete Entities', ['type', 'entity'], argsArray);

    return argsArray.map(args => ({
        'command': 'fibery.entity/delete',
        args
    }));
}

// TODO: attach Files
// TODO: download attachments

module.exports = {
    commands: {
        queryEntityCmd,
        createEntityBatchCmds,
        updateEntityBatchCmds,
        addToEntityCollectionFieldBatchCmds,
        removeFromEntityCollectionFieldBatchCmds,
        deleteEntityBatchCmds
    },
    meta: {

    }
};
