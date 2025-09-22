import fs from 'fs';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');
const securityLogPath = path.join(logDir, 'security.log');

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logSecurityEvent = (level, message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = JSON.stringify({
        timestamp,
        level,
        message,
        ...meta
    });

    fs.appendFileSync(securityLogPath, logEntry + '\n', 'utf8');
    console.log(`[SECURITY] ${level}: ${message}`);
};

export const securityLogger = (req, res, next) => {
    const originalSend = res.send;

    res.send = function (body) {
        if (res.statusCode === 401 || res.statusCode === 403 || res.statusCode === 400) {
            logSecurityEvent('WARN', 'Suspicious request', {
                method: req.method,
                url: req.originalUrl,
                ip: req.ip,
                body: req.body,
                userAgent: req.get('User-Agent')
            });
        }
        return originalSend.call(this, body);
    };

    next();
};