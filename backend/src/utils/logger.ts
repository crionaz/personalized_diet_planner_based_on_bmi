import morgan from 'morgan';
import { config } from '../config/config';

// Custom Morgan token for timestamp
morgan.token('timestamp', () => {
  return new Date().toLocaleTimeString('en-US', { 
    hour12: false,
    timeZone: 'Asia/Kolkata' 
  });
});

// Custom Morgan token for colored status codes
morgan.token('status-colored', (req, res) => {
  const status = res.statusCode;
  let color = '';
  
  if (status >= 500) color = '\x1b[31m'; // Red
  else if (status >= 400) color = '\x1b[33m'; // Yellow  
  else if (status >= 300) color = '\x1b[36m'; // Cyan
  else if (status >= 200) color = '\x1b[32m'; // Green
  else color = '\x1b[37m'; // White
  
  return `${color}${status}\x1b[0m`;
});

// Custom format for development
const devFormat = ':timestamp :method :url :status-colored :response-time ms';

// Custom format for production
const prodFormat = ':remote-addr :method :url :status :response-time ms';

// Create Morgan middleware
export const requestLogger = morgan(
  config.nodeEnv === 'production' ? prodFormat : devFormat,
  {
    stream: {
      write: (message: string) => {
        // Clean output - remove newlines and extra spaces
        const clean = message.trim();
        console.log(`${clean}`);
      }
    }
  }
);

// Simple console logger for application logs
export const logger = {
  info: (message: string, ...args: any[]) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    console.log(`${timestamp} ℹ  ${message}`, ...args);
  },
  
  error: (message: string, ...args: any[]) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    console.error(`${timestamp} ${message}`, ...args);
  },
  
  warn: (message: string, ...args: any[]) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    console.warn(`${timestamp}  ${message}`, ...args);
  },
  
  success: (message: string, ...args: any[]) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    console.log(`${timestamp}  ${message}`, ...args);
  },
  
  debug: (message: string, ...args: any[]) => {
    if (config.nodeEnv === 'development') {
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
      console.log(`${timestamp}  ${message}`, ...args);
    }
  }
};

export default logger;
