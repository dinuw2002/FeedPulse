import { rateLimit } from 'express-rate-limit';

export const feedbackRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    error: "Too many submissions. Please try again after an hour."
  },
  standardHeaders: true,
  legacyHeaders: false,
});