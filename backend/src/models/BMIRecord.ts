import mongoose, { Schema } from 'mongoose';

export interface IBMIRecord extends mongoose.Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  date: Date;
  weight: number; // Weight in kg at measurement
  height: number; // Height in cm at measurement
  bmi: number; // Calculated BMI value
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  bodyFat?: number; // Optional body fat percentage
  muscleMass?: number; // Optional muscle mass in kg
  createdAt: Date;
  updatedAt: Date;
}

const bmiRecordSchema = new Schema<IBMIRecord>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  date: {
    type: Date,
    required: [true, 'Measurement date is required'],
    default: Date.now,
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [20, 'Weight must be at least 20 kg'],
    max: [500, 'Weight must be less than 500 kg'],
  },
  height: {
    type: Number,
    required: [true, 'Height is required'],
    min: [100, 'Height must be at least 100 cm'],
    max: [250, 'Height must be less than 250 cm'],
  },
  bmi: {
    type: Number,
    required: [true, 'BMI is required'],
    min: [10, 'BMI must be at least 10'],
    max: [100, 'BMI must be less than 100'],
  },
  category: {
    type: String,
    required: [true, 'BMI category is required'],
    enum: ['underweight', 'normal', 'overweight', 'obese'],
  },
  bodyFat: {
    type: Number,
    min: [3, 'Body fat percentage must be at least 3%'],
    max: [50, 'Body fat percentage must be less than 50%'],
    default: null,
  },
  muscleMass: {
    type: Number,
    min: [10, 'Muscle mass must be at least 10 kg'],
    max: [200, 'Muscle mass must be less than 200 kg'],
    default: null,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes
bmiRecordSchema.index({ userId: 1, date: -1 });
bmiRecordSchema.index({ userId: 1, createdAt: -1 });

// Static method to calculate BMI
bmiRecordSchema.statics.calculateBMI = function(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(2));
};

// Static method to get BMI category
bmiRecordSchema.statics.getBMICategory = function(bmi: number): string {
  if (bmi < 18.5) return 'underweight';
  if (bmi >= 18.5 && bmi < 25) return 'normal';
  if (bmi >= 25 && bmi < 30) return 'overweight';
  return 'obese';
};

// Pre-save middleware to calculate BMI and category
bmiRecordSchema.pre('save', function(next: any) {
  if (this.isModified('weight') || this.isModified('height')) {
    this.bmi = (this.constructor as any).calculateBMI(this.weight, this.height);
    this.category = (this.constructor as any).getBMICategory(this.bmi);
  }
  next();
});

const BMIRecord = mongoose.model<IBMIRecord>('BMIRecord', bmiRecordSchema);

export default BMIRecord;
