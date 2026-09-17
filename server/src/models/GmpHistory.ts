import mongoose, { Schema, Document } from 'mongoose';

export interface GmpHistoryDoc extends Document {
  ipoId: mongoose.Types.ObjectId | string;
  gmp: number;
  timestamp: Date;
  source: string;
}

const GmpHistorySchema = new Schema<GmpHistoryDoc>(
  {
    ipoId: { type: Schema.Types.ObjectId, ref: 'Ipo', required: true, index: true },
    gmp: { type: Number, required: true },
    timestamp: { type: Date, default: () => new Date(), index: true },
    source: { type: String, required: true },
  },
  { timestamps: false },
);

GmpHistorySchema.index({ ipoId: 1, timestamp: 1 });

export const GmpHistoryModel =
  mongoose.models.GmpHistory || mongoose.model<GmpHistoryDoc>('GmpHistory', GmpHistorySchema);
