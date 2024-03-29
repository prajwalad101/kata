import Timer from '../models/timerModel';
import User from '../models/userModel';
import cron from 'node-cron';

export const userSchedule = () => {
  cron.schedule(
    '0 */3 * * *',
    async () => {
      // find the documents that have exceeded their timer duration
      const timers = await Timer.aggregate([
        {
          $project: {
            createdAt: 1,
            duration: 1,
            action: 1,
            user: 1,
            timeDifference: { $subtract: [new Date(), '$createdAt'] },
          },
        },
        {
          $addFields: {
            timeDifferenceInHours: {
              $divide: ['$timeDifference', 1000 * 60 * 60], // convert milliseconds to hours
            },
          },
        },
        {
          $match: {
            $expr: {
              $gte: ['$timeDifferenceInHours', '$duration'],
            },
          },
        },
      ]);

      timers.forEach(async (timer) => {
        await Timer.findByIdAndDelete(timer._id);
        await User.findByIdAndUpdate(
          timer.user,
          {
            ...(timer.action === 'suspend' && { suspended: false }),
            ...(timer.action === 'cooldown' && { onCooldown: false }),
          },
          { new: true }
        );
      });
    },
    {
      scheduled: true,
      timezone: 'Asia/Kathmandu',
    }
  );
};
