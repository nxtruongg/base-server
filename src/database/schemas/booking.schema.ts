import { Prop, Schema } from '@nestjs/mongoose';
import { BaseDocument, CreateSchema } from '@/base/base.schema';

@Schema()
export class Booking extends BaseDocument {
  @Prop()
  service: string;
  @Prop()
  employee: string;
  @Prop()
  customerName: string;
  @Prop()
  customerPhone: string;
  @Prop()
  bookingDateTime: Date;
  @Prop({
    enum: ['pending', 'confirmed', 'done', 'canceled'],
    default: 'pending',
  })
  status: string;
  @Prop()
  notes: string;
}
export const BookingSchema = CreateSchema(Booking);
BookingSchema.index({ employee: 1 });
BookingSchema.index({ customerName: 1 });
BookingSchema.index({ customerPhone: 1 });
BookingSchema.index({ service: 1 });
