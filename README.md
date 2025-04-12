# Cart Whisperer

Cart Whisperer is an AI-powered abandoned cart recovery application that helps e-commerce businesses recover lost sales by sending personalized emails to customers who have abandoned their shopping carts.

## Features

- **AI-Generated Emails**: Create personalized, compelling emails using OpenAI's GPT models
- **Fallback Templates**: Pre-designed email templates for when AI generation is unavailable
- **Custom Email Templates**: Create and save your own custom email templates
- **Analytics Dashboard**: Track recovery rates and email performance metrics
- **Supabase Integration**: Persistent storage for carts, emails, and analytics
- **Authentication**: Secure user authentication and role-based access control
- **Mobile-Responsive**: Works seamlessly across desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 16+ and npm/pnpm
- Supabase account (for database and authentication)
- OpenAI API key (for AI-generated emails)
- Resend account (for sending emails)

### Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/cart-whisperer.git
   cd cart-whisperer
   ```

2. Install dependencies:
   ```
   npm install
   # or
   pnpm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your API keys and configuration.

4. Set up Supabase:
   - Create a new Supabase project
   - Create the following tables in your Supabase database:
     - `carts`: For storing abandoned cart data
     - `email_events`: For tracking email sending, opens, and clicks
     - `store_settings`: For storing store and template settings
     - `users`: For storing user information
   - Use the types defined in `lib/supabase.ts` as a guide for table schema

5. Run the development server:
   ```
   npm run dev
   # or
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. Create a new project in Vercel
2. Connect to your repository
3. Configure the environment variables
4. Deploy

### Deploy to other platforms

1. Build the application:
   ```
   npm run build
   # or
   pnpm build
   ```

2. Start the production server:
   ```
   npm start
   # or
   pnpm start
   ```

## Shopify Integration

For the full Shopify app integration, follow these additional steps:

1. Register a Shopify app in the Shopify Partner Dashboard
2. Set up the OAuth flow in `app/api/auth/shopify/` directory
3. Create webhook handlers for cart abandonment events
4. Implement the Shopify App Bridge for admin UI

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 