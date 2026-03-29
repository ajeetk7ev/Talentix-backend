import 'dotenv/config';


const envVar = process.env;

export const env = {
    PORT: envVar.PORT,
}