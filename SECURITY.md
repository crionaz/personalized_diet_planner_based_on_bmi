# Security Policy

This document outlines the security measures and practices implemented in the application to protect user data, especially health-related information.

## Security Measures

### Backend Security

#### Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication for user sessions
- **Password Hashing**: bcrypt with salt rounds for user accounts
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for diet plan access
- **Session Management**: Secure session handling with refresh tokens

#### Health Data Protection

```typescript
// User profile validation for health data
import { body, validationResult } from 'express-validator';

export const validateUserProfile = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('age').isInt({ min: 13, max: 120 }),
  body('weight').isFloat({ min: 20, max: 500 }),
  body('height').isFloat({ min: 50, max: 300 }),
  body('gender').isIn(['male', 'female', 'other']),
  body('activityLevel').isIn(['sedentary', 'light', 'moderate', 'active', 'very_active']),
];
```

#### Security Headers

```typescript
// Helmet.js configuration for diet planner
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "https://images.unsplash.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

#### Rate Limiting

```typescript
// Rate limiting for diet plan generation
const dietPlanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit diet plan generations
  message: 'Too many diet plan requests from this IP',
});

const bmiCalculatorLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit BMI calculations
  message: 'Too many BMI calculations from this IP',
});
```

#### CORS Configuration

```typescript
// CORS setup for diet planner
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://dietplanner.com', 'https://admin.dietplanner.com']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
};
```

### Frontend Security

#### Secure Health Data Storage

```typescript
// Health data storage utilities
export const HealthDataStorage = {
  setUserProfile(profile: UserProfile) {
    // Encrypt sensitive health data before storage
    const encryptedProfile = encrypt(JSON.stringify(profile));
    sessionStorage.setItem('userProfile', encryptedProfile);
  },
  
  getUserProfile(): UserProfile | null {
    const encrypted = sessionStorage.getItem('userProfile');
    if (!encrypted) return null;
    
    const decrypted = decrypt(encrypted);
    return JSON.parse(decrypted);
  },
  
  clearHealthData() {
    sessionStorage.removeItem('userProfile');
    sessionStorage.removeItem('dietPlan');
    sessionStorage.removeItem('calorieTracker');
  },
};
```

#### XSS Prevention for Diet Content

```tsx
// Sanitize diet plan content
import DOMPurify from 'dompurify';

const SafeDietContent: React.FC<{ content: string }> = ({ content }) => {
  const sanitizedContent = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
};

// Secure meal plan display
const MealPlanCard: React.FC<{ meal: Meal }> = ({ meal }) => {
  return (
    <div className="meal-card">
      <h3>{DOMPurify.sanitize(meal.name)}</h3>
      <p>Calories: {meal.calories}</p>
      <SafeDietContent content={meal.description} />
    </div>
  );
};
```

### Database Security

#### MongoDB Security for Health Data

```typescript
// User schema with health data validation
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email: string) => validator.isEmail(email),
      message: 'Invalid email format',
    },
  },
  healthProfile: {
    age: {
      type: Number,
      required: true,
      min: 13,
      max: 120,
    },
    weight: {
      type: Number,
      required: true,
      min: 20,
      max: 500,
    },
    height: {
      type: Number,
      required: true,
      min: 50,
      max: 300,
    },
    bmi: {
      type: Number,
      required: true,
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      required: true,
    },
    dietaryPreferences: {
      type: [String],
      enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo'],
    },
    healthGoals: {
      type: String,
      enum: ['weight_loss', 'weight_gain', 'maintenance', 'muscle_gain'],
      required: true,
    },
  },
}, {
  timestamps: true,
});

// Encrypt sensitive health data at rest
userSchema.pre('save', function(next) {
  if (this.isModified('healthProfile')) {
    // Encrypt health profile data
    this.healthProfile = encrypt(this.healthProfile);
  }
  next();
});
```

#### Diet Plan Schema Security

```typescript
const dietPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  meals: [{
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    calories: {
      type: Number,
      required: true,
      min: 0,
      max: 5000,
    },
    nutrients: {
      protein: { type: Number, min: 0 },
      carbs: { type: Number, min: 0 },
      fat: { type: Number, min: 0 },
      fiber: { type: Number, min: 0 },
    },
    ingredients: [{
      type: String,
      maxlength: 50,
    }],
  }],
  totalCalories: {
    type: Number,
    required: true,
    min: 800,
    max: 5000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '90d', // Auto-delete old diet plans
  },
});
```

## Diet Planner Specific Security Checklist

### Health Data Security

- [ ] User health information is encrypted at rest
- [ ] BMI calculations are validated server-side
- [ ] Diet plan generation includes input sanitization
- [ ] Calorie tracking data is validated for realistic ranges
- [ ] Personal health goals are properly validated
- [ ] Age, weight, and height inputs are within safe ranges
- [ ] Dietary preferences are validated against allowed values

### Nutritional Data Integrity

- [ ] Meal nutritional information is validated
- [ ] Calorie calculations are verified for accuracy
- [ ] Food ingredient lists are sanitized
- [ ] Recipe instructions are XSS-safe
- [ ] Nutritional database queries are parameterized
- [ ] Daily calorie limits are enforced

### User Privacy Protection

- [ ] Health profiles are anonymized in logs
- [ ] Diet plans can be deleted by users
- [ ] Personal metrics are not shared without consent
- [ ] Progress tracking data is user-controlled
- [ ] Export functionality excludes sensitive identifiers

## Diet Planner Security Dependencies

### Backend Security Dependencies
```json
{
  "dependencies": {
    "bcrypt": "^5.1.0",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0",
    "express-validator": "^7.0.0",
    "express-mongo-sanitize": "^2.2.0",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.0",
    "crypto-js": "^4.1.1"
  }
}
```

### Frontend Security Dependencies
```json
{
  "dependencies": {
    "dompurify": "^3.0.0",
    "validator": "^13.11.0",
    "crypto-js": "^4.1.1"
  }
}
```