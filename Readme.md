# PricePing

A price monitoring application that tracks eBay product prices and alerts users when prices drop below their target threshold.

## Features

- **Google OAuth Authentication** - Secure user authentication via Google
- **eBay Price Tracking** - Monitor product prices in real-time from eBay
- **Price Alerts** - Receive email notifications when prices drop to your target price
- **Price History** - View historical price data for tracked products
- **Smart Alerting** - Only alerts on significant price drops (5% threshold) to avoid alert fatigue
- **Session Management** - Secure session handling with express-session

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js with Google OAuth 2.0
- **Email Service**: Brevo (Sendinblue)
- **eBay Integration**: eBay Browse API
- **Scheduled Tasks**: node-cron for background synchronization
- **Rate Limiting**: express-rate-limit

## Prerequisites

- Node.js (v14 or higher)
- MongoDB instance
- eBay API credentials (Client ID & Secret)
- Google OAuth credentials
- Brevo API key for email notifications

## Installation

1. Clone the repository:
```bash
git clone <https://github.com/vinayak-88/PricePing>
cd PricePing/Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the Backend directory with the following variables:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/priceping
SECRET_KEY=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CALLBACK_URL=http://localhost:3000/auth/google/callback

# eBay API
EBAY_CLIENT_ID=your-ebay-client-id
EBAY_CLIENT_SECRET=your-ebay-client-secret
EBAY_MARKETPLACE_ID=EBAY_US

# Email Service
BREVO_API_KEY=your-brevo-api-key
EMAIL_USER=your-email@example.com

# Frontend
FRONTEND_URL=http://localhost:5137

# Images
DEFAULT_ITEM_PIC_URL=https://via.placeholder.com/150
```

4. Start the development server:
```bash
npm run dev
```

Or start the production server:
```bash
npm start
```

## Project Structure

```
Backend/
├── src/
│   ├── app.js                 # Express app setup
│   ├── config/
│   │   └── database.js        # MongoDB connection
│   ├── controllers/           # Route controllers (empty - routes handle logic)
│   ├── middlewares/
│   │   └── passport.js        # Passport authentication config
│   ├── models/
│   │   ├── item.js            # Product schema
│   │   └── user.js            # User schema
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   └── product.js         # Product tracking routes
│   ├── services/
│   │   ├── cronService.js     # Scheduled price sync
│   │   ├── ebayAuth.js        # eBay OAuth token management
│   │   ├── ebayService.js     # eBay API integration
│   │   └── emailService.js    # Email notifications
│   └── utils/
│       ├── ebay.js            # eBay URL validation & parsing
│       └── Error.js           # Custom error class
└── package.json
```

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/logout` - Logout user

### Products
- `GET /api/products/get-history?rawUrl=<ebay-url>` - Get product price history
- `POST /api/products/set-price-alert` - Set price alert for a product
  - Body: `{ rawUrl: string, targetPrice: number }`
- `GET /api/products/tracking-list` - Get list of tracked products (requires auth)

## Background Jobs

### Price Synchronization Cron
Runs every 6 hours to:
1. Sync prices for all tracked products from eBay
2. Check if prices meet user target prices
3. Send email alerts if thresholds are met
4. Track alert history to avoid duplicate notifications

Alert Logic:
- Alerts send when price ≤ target price
- Alert threshold: 5% price drop from last alert prevents spam
- Resets alert when price goes above target

## Security Features

- **Rate Limiting**: 10 requests per 15 minutes on auth endpoints
- **Session Security**: 
  - HTTPOnly cookies
  - Secure flag enabled for HTTPS
  - SameSite=Lax protection
- **Authentication Middleware**: Protected routes require valid session
- **Input Validation**: URL and price validation on all product endpoints
- **Error Handling**: Custom error handler with proper HTTP status codes

## Error Handling

All errors are caught and passed through a centralized error handler that returns:
```json
{
  "status": "error",
  "message": "Error description",
  "statusCode": 400
}
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload (requires nodemon)
- `npm test` - Run tests (not configured yet)

## Known Limitations

- Controllers directory is empty - logic is in route handlers
- No user-initiated sync endpoint - prices update only via cron jobs
- No delete/remove tracking endpoint
- No price alert history per user

## Future Enhancements

- Add controllers for better separation of concerns
- Implement more detailed price charts/analytics
- Add support for tracking other e-commerce platforms
- User notification preferences (frequency, channels)
- Product comparison features
- Mobile app integration

## Troubleshooting

**"FAILED_TO_AUTHENTICATE_WITH_EBAY"**
- Verify eBay API credentials are correct
- Check if API credentials have required scopes

**"MongoDB connection failed"**
- Ensure MongoDB is running
- Verify MONGODB_URI is correct

**Email not sending**
- Verify Brevo API key is valid
- Check if email address is verified in Brevo

**OAuth callback not working**
- Verify CALLBACK_URL matches Google OAuth app settings
- Ensure FRONTEND_URL is accessible

## License

ISC
