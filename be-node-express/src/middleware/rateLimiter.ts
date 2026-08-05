import rateLimit from 'express-rate-limit';

// Throttles brute-force credential guessing against login/register.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later' },
});
