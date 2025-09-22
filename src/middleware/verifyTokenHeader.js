import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const verifyTokenHeader = async (req, res, next) => {
    console.log('🔐 Verifying token for:', req.path);
    try {
        const authHeader = req.headers.authorization;
        let token;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); 
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token not found in Authorization header'
            });
        }

        const secret = process.env.JWT_SECRET || 'jwt-secret';
        const decoded = jwt.verify(token, secret);
        req.user = decoded;

        console.log('✅ Token verified:', decoded);
        next();

    } catch (error) {
        console.error('❌ Token verification error:', error.message);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export default verifyTokenHeader;