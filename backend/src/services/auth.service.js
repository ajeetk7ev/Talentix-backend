import prisma from '../config/prisma.js';
import { bcryptHashPassword, bcryptComparePassword } from '../utils/bcrypt.js';
import { ApiError } from '../utils/ApiError.js';

export class AuthService {
    static async signup(data){
        const { name, email, password, role } = data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new ApiError(400, "User already exists with this email");
        }

        // Hash password
        const hashedPassword = await bcryptHashPassword(password);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'CANDIDATE'
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        return newUser;
    }

    static async signin(data){
        const { email, password } = data;

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            throw new ApiError(401, "Invalid email or password");
        }

        // Check password
        const isPasswordValid = await bcryptComparePassword(password, user.password);

        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid email or password");
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return userWithoutPassword;
    }
}