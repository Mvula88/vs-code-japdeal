# JapDEAL - Japanese Car Import Auction Platform

A comprehensive auction platform for Namibians to pre-bid on Japanese import cars up to 24 hours before the final overseas auction. Built with Next.js 14, TypeScript, Supabase, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- **Real-time Auctions**: Live bidding with WebSocket updates
- **Three Auction States**: Live, Upcoming, and Ended auctions
- **Auto-Extension**: Automatic time extension when bids are placed near the end
- **Bid Increments**: Configurable tiered bid increments based on current price
- **Cost Calculator**: Real-time total cost estimation with all import fees
- **Watchlist**: Save and track lots of interest
- **Notifications**: Real-time outbid and auction ending notifications

### User Features
- **Authentication**: Email/password and magic link authentication
- **Buyer Dashboard**: Track active bids, won auctions, watchlist, and invoices
- **Advanced Filtering**: Search by make, model, year, price, mileage, and more
- **Image Gallery**: Multiple images per vehicle with fullscreen viewing
- **Bid History**: Real-time bid history with user anonymization

### Admin Features (In Development)
- Full CRUD operations for lots and users
- Cost settings management
- Analytics dashboard
- Invoice generation
- System configuration

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide Icons, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Deployment**: Optimized for Vercel/Edge runtime

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd japdeal
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. **Set up Supabase database**

Run the migrations in your Supabase SQL editor in order:
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_rls_policies.sql`

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🗄 Database Schema

### Core Tables
- `profiles` - User profiles with roles and status
- `cars` - Vehicle in
formation
- `lots` - Auction lots with state management
- `lot_images` - Vehicle images
- `bids` - Bid history with audit trail
- `watchlists` - User watchlists
- `cost_settings` - Import cost configuration
- `invoices` - Generated invoices
- `bid_increment_tiers` - Bid increment rules
- `notifications` - User notifications
- `audit_logs` - System audit trail

### Key Features
- Row Level Security (RLS) on all tables
- Automated triggers for bid validation
- Real-time subscriptions for live updates
- Optimized indexes for performance

## 🎯 Regional Settings

- **Currency**: Namibian Dollar (N$)
- **Timezone**: Africa/Windhoek
- **Language**: English (i18n ready)
- **Shipping**: Walvis Bay port → Windhoek

## 📱 Key Pages

- `/` - Landing page with auction sections
- `/auctions/live` - Live auctions with filtering
- `/auctions/upcoming` - Upcoming auctions
- `/auctions/ended` - Completed auctions
- `/lot/[lotNumber]` - Detailed lot view with bidding
- `/dashboard` - User dashboard
- `/admin` - Admin panel (requires admin role)

## 🔐 Security Features

- Row Level Security (RLS) policies
- Input validation with Zod
- CSRF protection
- Rate limiting on bid endpoints
- Secure authentication with Supabase Auth
- Admin role enforcement

## 🚦 Auction Rules

1. **No Buy Now** - All vehicles go through auction
2. **No Reserve Prices** - Transparent pricing
3. **Auto-Extension** - Bids in final minutes extend the auction
4. **Minimum Increments** - Tiered based on current price:
   - Under N$50,000: +N$5,000
   - N$50,000-200,000: +N$10,000
   - Over N$200,000: +N$25,000

## 📊 Cost Breakdown

The platform calculates total import costs including:
- Vehicle price
- Japan transport & auction fees
- Shipping to Walvis Bay
- Transport to Windhoek
- Customs clearance & documentation
- Custom duty (%)
- VAT (%)
- Admin fee (%)

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests (when implemented)
npm test
```

## 📈 Performance Optimizations

- Server-side rendering for SEO
- Optimistic UI updates
- Image optimization with Next.js Image
- Database indexes for fast queries
- Real-time updates via WebSockets
- CDN caching for static assets

## 🚀 Deployment

The application is optimized for deployment on Vercel:

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support, email support@japdeal.na or open an issue in the repository.

## 🎯 Roadmap

- [ ] Admin dashboard completion
- [ ] Email notification system
- [ ] PDF invoice generation
- [ ] Mobile app (React Native)
- [ ] Payment gateway integration
- [ ] Vehicle inspection reports
- [ ] Shipping tracker integration
- [ ] Multi-language support

## 👥 Team

Developed with ❤️ for the Namibian market

---

**Note**: This is a production-ready platform with enterprise-grade features. Ensure all environment variables are properly configured before deployment.