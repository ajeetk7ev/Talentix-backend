import bcrypt from 'bcryptjs';


export const bcryptHashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
}

export const bcryptComparePassword = async (password, hashPassword) => {
     return await bcrypt.compare(password, hashPassword);
}