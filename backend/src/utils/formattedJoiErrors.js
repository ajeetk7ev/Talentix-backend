

export const formattedJoiErrors = (error) => {
    const errors = {};
    error.details.forEach((err) => {
        const field = err.path[0];
        errors[field] = err.message;
    })

    return errors;
}