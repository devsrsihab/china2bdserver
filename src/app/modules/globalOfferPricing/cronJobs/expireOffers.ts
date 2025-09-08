import cron from 'node-cron';
import { GlobalOfferPricing } from '../globalOfferPricing.model';

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  const now = new Date();
  await GlobalOfferPricing.updateMany(
    { status: 1, endDate: { $lt: now } },
    { $set: { status: 0 } },
  );
  console.log('✅ Expired offers deactivated automatically');
});
