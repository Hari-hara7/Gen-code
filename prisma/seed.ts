import { PrismaClient } from "../generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const products = [
  {
    title: "Wireless Bluetooth Headphones",
    description:
      "Premium noise-cancelling wireless headphones with 30-hour battery life. Features deep bass, comfortable over-ear design, and built-in microphone for hands-free calls.",
    price: 79.99,
    image: "https://picsum.photos/seed/headphones/400/400",
    category: "Electronics",
    rating: 4.5,
    reviewCount: 2847,
    inStock: true,
  },
  {
    title: "Slim Laptop Stand - Adjustable Height",
    description:
      "Ergonomic aluminum laptop stand with adjustable height and angle. Compatible with all laptops 10-17 inches. Improves posture and airflow for cooler performance.",
    price: 34.99,
    image: "https://picsum.photos/seed/laptopstand/400/400",
    category: "Electronics",
    rating: 4.3,
    reviewCount: 1523,
    inStock: true,
  },
  {
    title: "Organic Green Tea - 100 Bags",
    description:
      "Premium organic green tea sourced from Japanese highlands. Rich in antioxidants with a smooth, refreshing taste. Individually wrapped for freshness.",
    price: 12.49,
    image: "https://picsum.photos/seed/greentea/400/400",
    category: "Grocery",
    rating: 4.7,
    reviewCount: 5621,
    inStock: true,
  },
  {
    title: "Men's Classic Fit Cotton T-Shirt",
    description:
      "Ultra-soft 100% ring-spun cotton t-shirt. Pre-shrunk fabric with reinforced collar. Available in multiple colors. Perfect for everyday wear.",
    price: 18.99,
    image: "https://picsum.photos/seed/tshirt/400/400",
    category: "Clothing",
    rating: 4.2,
    reviewCount: 8934,
    inStock: true,
  },
  {
    title: "Stainless Steel Water Bottle - 32oz",
    description:
      "Double-wall vacuum insulated water bottle keeps drinks cold for 24 hours or hot for 12 hours. BPA-free, leak-proof lid, and sweat-proof exterior.",
    price: 24.95,
    image: "https://picsum.photos/seed/waterbottle/400/400",
    category: "Sports",
    rating: 4.6,
    reviewCount: 3412,
    inStock: true,
  },
  {
    title: "Portable Bluetooth Speaker",
    description:
      "Compact waterproof Bluetooth speaker with 360-degree sound. 12-hour playtime, built-in mic, and USB-C charging. Perfect for outdoor adventures.",
    price: 49.99,
    image: "https://picsum.photos/seed/speaker/400/400",
    category: "Electronics",
    rating: 4.4,
    reviewCount: 6723,
    inStock: true,
  },
  {
    title: "Non-Stick Cookware Set - 10 Piece",
    description:
      "Professional-grade non-stick cookware set including frying pans, saucepans, and stockpot. Dishwasher safe with heat-resistant handles.",
    price: 89.99,
    image: "https://picsum.photos/seed/cookware/400/400",
    category: "Home & Kitchen",
    rating: 4.1,
    reviewCount: 1892,
    inStock: true,
  },
  {
    title: "Yoga Mat - Premium 6mm Thick",
    description:
      "Extra thick non-slip yoga mat with carrying strap. High-density foam provides superior cushioning for joints. Perfect for yoga, pilates, and floor exercises.",
    price: 29.99,
    image: "https://picsum.photos/seed/yogamat/400/400",
    category: "Sports",
    rating: 4.5,
    reviewCount: 4156,
    inStock: true,
  },
  {
    title: "Bestselling Novel - The Silent Echo",
    description:
      "A gripping thriller that keeps you on the edge of your seat. Follow detective Sarah Chen as she unravels a mystery spanning two decades. Over 1 million copies sold.",
    price: 14.99,
    image: "https://picsum.photos/seed/novel/400/400",
    category: "Books",
    rating: 4.8,
    reviewCount: 12453,
    inStock: true,
  },
  {
    title: "Smart Watch Fitness Tracker",
    description:
      "Advanced fitness tracker with heart rate monitor, GPS, sleep tracking, and 50+ workout modes. Water resistant to 50m with 7-day battery life.",
    price: 129.99,
    image: "https://picsum.photos/seed/smartwatch/400/400",
    category: "Electronics",
    rating: 4.3,
    reviewCount: 7891,
    inStock: true,
  },
  {
    title: "Scented Candle Gift Set - 4 Pack",
    description:
      "Luxury soy wax candles in four calming scents: lavender, vanilla, eucalyptus, and ocean breeze. 25-hour burn time each. Beautifully packaged for gifting.",
    price: 22.99,
    image: "https://picsum.photos/seed/candles/400/400",
    category: "Home & Kitchen",
    rating: 4.6,
    reviewCount: 2345,
    inStock: true,
  },
  {
    title: "USB-C Hub Multiport Adapter",
    description:
      "7-in-1 USB-C hub with 4K HDMI, 3x USB 3.0, SD/TF card reader, and 100W power delivery. Compact aluminum design compatible with all USB-C laptops.",
    price: 39.99,
    image: "https://picsum.photos/seed/usbhub/400/400",
    category: "Electronics",
    rating: 4.4,
    reviewCount: 3567,
    inStock: true,
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.recentlyViewed.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create test user
  const hashedPassword = await bcrypt.hash("password123", 10);
  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
    },
  });
  console.log(`✅ Created test user: ${user.email} (password: password123)`);

  // Create products
  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }
  console.log(`✅ Created ${products.length} products`);

  console.log("🎉 Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
