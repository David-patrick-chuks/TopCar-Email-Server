const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Client = require('./model/Client'); // Import Client model
require("dotenv").config();
// 5-minute acknowledgment email cron job
const acknowledgmentEmailCron = () => {
  cron.schedule('* * * * *', async () => { // Runs every minute
    console.log('Running acknowledgment email cron job...');
    try {
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

      // Find clients who need an acknowledgment email
      const clients = await Client.find({
        acknowledgmentSent: false,
        createdAt: { $lte: fiveMinutesAgo },
      });

      if (clients.length > 0) {
        console.log(`Found ${clients.length} clients for acknowledgment email.`);

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        for (const client of clients) {
          const { email, firstname, message } = client;

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'We’ve Received Your Message!',
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; background-color: #f9f9f9; border-radius: 8px; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #e53935; font-size: 24px; margin-bottom: 20px;">Thank you, ${firstname}!</h2>
                <p style="font-size: 16px; margin-bottom: 20px;">We’ve received your message:</p>
                <blockquote style="color: #555; font-style: italic; font-size: 16px; border-left: 4px solid #e53935; padding-left: 15px; margin-bottom: 20px;">
                  ${message}
                </blockquote>
                <p style="font-size: 16px; margin-bottom: 30px;">Our team will get back to you shortly. We appreciate your patience.</p>
                <p style="font-size: 16px; margin-bottom: 30px;">For more information, feel free to visit our website: <a href="https://lease-car.vercel.app" style="color: #e53935; text-decoration: none;">TopCars</a></p>
                <p style="font-size: 16px;">Best regards,<br><strong>TopCars Team</strong></p>
              </div>
            </div>
          `
          
          };

          // Send the email
          await transporter.sendMail(mailOptions);

          // Mark acknowledgment as sent
          client.acknowledgmentSent = true;
          await client.save();
        }

        console.log('Acknowledgment emails sent successfully.');
      } else {
        console.log('No clients for acknowledgment email.');
      }
    } catch (error) {
      console.error('Error running acknowledgment email cron job:', error);
    }
  });
};

// Weekly follow-up cron job (runs every day at 9:00 AM)
const weeklyFollowUpCron = () => {
    cron.schedule('0 9 1 * *', async () => { // Runs at 9:00 AM on the 1st day of every month
    console.log('Running weekly follow-up cron job...');
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Find clients with listing-inquiry type and no follow-up sent
      const clients = await Client.find({
        messageType: 'listing-inquiry',
        followUpSent: false,
        createdAt: { $lte: oneWeekAgo },
      });

      if (clients.length > 0) {
        console.log(`Found ${clients.length} clients for follow-up.`);

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        for (const client of clients) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: client.email,
            subject: `We Miss You, ${client.firstname}!`,
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2 style="color: #e53935;">Hello ${client.firstname},</h2>
              <p>We hope you had a great month! As we step into this new month, we wanted to check in and see how we can assist you further.</p>
              <p>It’s been a while since you visited our site, and we’re here to help with anything you might need. Whether it’s support or any inquiries, feel free to reach out!</p>
              <p>Looking forward to connecting with you again this month.</p>
              <p>Best regards,<br>Your Company Team</p>
            </div>
          `,
          
          };

          await transporter.sendMail(mailOptions);

          // Mark follow-up as sent
          client.followUpSent = true;
          await client.save();
        }

        console.log('Weekly follow-up emails sent successfully.');
      } else {
        console.log('No clients for follow-up.');
      }
    } catch (error) {
      console.error('Error running weekly follow-up cron job:', error);
    }
  });
};

// Export cron jobs
module.exports = {
  acknowledgmentEmailCron,
  weeklyFollowUpCron,
};
