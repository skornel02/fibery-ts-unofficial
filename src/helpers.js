module.exports.checkRequiredArgs = (methodName, requiredArgs, argsArray) => {
    argsArray.forEach((args, i) => {
        const missingArgs = requiredArgs.filter(ra => !(ra in args));
        if (missingArgs.length > 0) {
            throw new Error(`${methodName}. Required args are missing in element #${i}: ${missingArgs.join(',')}`);
        }
    });
};
