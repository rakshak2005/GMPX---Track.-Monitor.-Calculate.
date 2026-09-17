import mongoose, { Schema, Document } from 'mongoose';

export interface SubscriptionHistoryDoc extends Document {
  ipoId: mongoose.Types.ObjectId | string;
  retail?: number | null;
  nii?: number | null;
  qib?: number | null;
  employee?: number | null;
  total?: number | null;
  label?: string;
  timestamp: Date;
}

const SubscriptionHistorySchema = new Schema<SubscriptionHistoryDoc>(
  {
    ipoId: { type: Schema.Types.ObjectId, ref: 'Ipo', required: true, index: true },
    retail: { type: Number, default: null },
    nii: { type: Number, default: null },
    qib: { type: Number, default: null },
    employee: { type: Number, default: null },
    total: { type: Number, default: null },
    label: { type: String, default: '' },
    timestamp: { type: Date, default: () => new Date() },
  },
  { timestamps: false },
);

SubscriptionHistorySchema.index({ ipoId: 1, timestamp: 1 });

export const SubscriptionHistoryModel =
  mongoose.models.SubscriptionHistory ||
  mongoose.model<SubscriptionHistoryDoc>('SubscriptionHistory', SubscriptionHistorySchema);
