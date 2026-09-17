import mongoose, { Schema, Document } from 'mongoose';

export type IpoStatus =
  | 'Available'
  | 'Applied'
  | 'Allotment Pending'
  | 'Allotted'
  | 'Not Allotted'
  | 'Refund Pending'
  | 'Listed'
  | 'Sold';

export interface SubscriptionBreakdown {
  retail?: number | null;
  nii?: number | null;
  qib?: number | null;
  employee?: number | null;
  total?: number | null;
}

export interface IpoDoc extends Document {
  name: string;
  companyName?: string;
  symbol?: string;
  logoUrl?: string;
  issuePrice: number;
  lotSize: number;
  lotsApplied: number;
  allottedLots?: number | null;
  openDate?: Date | null;
  closeDate?: Date | null;
  allotmentDate?: Date | null;
  listingDate?: Date | null;
  status: IpoStatus;
  isApplied?: boolean;
  category?: string;
  marketStatus?: string;
  currentGmp?: number | null;
  lastGmpAt?: Date | null;
  gmpSource?: string | null;
  lastGmpFetchAt?: Date | null;
  gmpStale?: boolean;
  subscription: SubscriptionBreakdown;
  actualListingPrice?: number | null;
  notes?: string;
  userId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<SubscriptionBreakdown>(
  {
    retail: { type: Number, default: null },
    nii: { type: Number, default: null },
    qib: { type: Number, default: null },
    employee: { type: Number, default: null },
    total: { type: Number, default: null },
  },
  { _id: false },
);

const IpoSchema = new Schema<IpoDoc>(
  {
    name: { type: String, required: true, trim: true, index: true },
    companyName: { type: String, default: '' },
    symbol: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    issuePrice: { type: Number, required: true, min: 0 },
    lotSize: { type: Number, required: true, min: 1 },
    lotsApplied: { type: Number, required: true, min: 0 },
    allottedLots: { type: Number, default: null },
    openDate: { type: Date, default: null },
    closeDate: { type: Date, default: null },
    allotmentDate: { type: Date, default: null },
    listingDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ['Available', 'Applied', 'Allotment Pending', 'Allotted', 'Not Allotted', 'Refund Pending', 'Listed', 'Sold'],
      default: 'Available',
    },
    isApplied: { type: Boolean, default: false },
    category: { type: String, default: 'Mainboard' },
    marketStatus: { type: String, default: 'Upcoming' },
    currentGmp: { type: Number, default: null },
    lastGmpAt: { type: Date, default: null },
    gmpSource: { type: String, default: null },
    lastGmpFetchAt: { type: Date, default: null },
    gmpStale: { type: Boolean, default: false },
    subscription: { type: SubscriptionSchema, default: () => ({}) },
    actualListingPrice: { type: Number, default: null },
    notes: { type: String, default: '' },
    userId: { type: String, default: null },
  },
  { timestamps: true },
);

export const IpoModel = mongoose.models.Ipo || mongoose.model<IpoDoc>('Ipo', IpoSchema);
