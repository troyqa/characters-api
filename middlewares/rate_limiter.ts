import {
  Request, Response, NextFunction,
} from 'express';

interface IRateLimiterOptions {
  windowMs: number;
  maxRequests: number;
}

const rateLimiter = ({ windowMs, maxRequests }: IRateLimiterOptions) => {
  const requests = new Map<string, number[]>();

  return (req: Request, res: Response, next: NextFunction) => {
    const currentTime = Date.now();
    const userIP = req.ip || 'unknown';

    if (!requests.has(userIP)) {
      requests.set(userIP, []);
    }

    const userRequests = requests.get(userIP) ?? [];
    const recent = userRequests
      .filter((timestamp: number) => currentTime - timestamp < windowMs * 1000);

    requests.set(userIP, recent);

    if (recent.length >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }

    recent.push(currentTime);
    next();
  };
};

export default rateLimiter;
