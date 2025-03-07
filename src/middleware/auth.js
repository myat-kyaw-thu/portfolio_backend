
import dotenv from 'dotenv';
dotenv.config();

const apiKeyMiddleware = (req, res, next) => {
  // Allow all GET requests without authentication
  if (req.method === 'GET') {
    return next();
  }
  
  // Check for API key in headers for non-GET requests
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.APP_KEY) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Valid API key is required for this operation' 
    });
  }
  
  next();
};

export default apiKeyMiddleware;
