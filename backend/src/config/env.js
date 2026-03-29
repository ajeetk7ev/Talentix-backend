import 'dotenv/config';


const envVar = process.env;

export const env = {
    PORT: envVar.PORT,
    DATABASE_URL: envVar.DATABASE_URL
}