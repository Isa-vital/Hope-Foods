import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import pool from "../config/database.js";

const categories = [
  {
    name: "Local Foods",
    slug: "local-foods",
    description: "Traditional Ugandan dishes",
    display_order: 1,
  },
  {
    name: "Fast Foods",
    slug: "fast-foods",
    description: "Quick bites and snacks",
    display_order: 2,
  },
  {
    name: "Continental",
    slug: "continental",
    description: "International cuisine",
    display_order: 3,
  },
  {
    name: "Beverages",
    slug: "beverages",
    description: "Drinks, juices, wines and spirits",
    display_order: 4,
  },
];

// Helper to parse "UGX 25,000" to 25000
const parsePrice = (str) => parseInt(str.replace(/[^0-9]/g, ""), 10);

const menuItems = {
  "Local Foods": [
    {
      name: "Luwombo",
      description:
        "Steamed beef or chicken in banana leaves with savory sauce.",
      price: "UGX 25,000",
      image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Matooke & G-Nuts",
      description: "Traditional green bananas with rich groundnut sauce.",
      price: "UGX 15,000",
      image:
        "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Katogo",
      description: "Breakfast classic: matooke cooked with beef or offals.",
      price: "UGX 18,000",
      image:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop",
    },
    {
      name: "Kalo (Millet Bread)",
      description: "Traditional millet bread served with fish stew.",
      price: "UGX 22,000",
      image:
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2072&auto=format&fit=crop",
    },
    {
      name: "Posho & Beans",
      description: "Maize meal with savory red beans in rich sauce.",
      price: "UGX 12,000",
      image:
        "https://images.unsplash.com/photo-1598511726623-d2e9996892f0?q=80&w=2074&auto=format&fit=crop",
    },
    {
      name: "Roasted Goat",
      description: "Succulent roasted goat meat with herbed potatoes.",
      price: "UGX 28,000",
      image:
        "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Sweet Potato & Beans",
      description: "Steamed sweet potato with kidney beans.",
      price: "UGX 10,000",
      image:
        "https://images.unsplash.com/photo-1557844352-761f2565b576?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Smoked Fish & Posho",
      description: "Lake Victoria smoked fish with maize meal.",
      price: "UGX 20,000",
      image:
        "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=2070&auto=format&fit=crop",
    },
  ],
  "Fast Foods": [
    {
      name: "Hope Burger",
      description:
        "Juicy beef patty with cheese, lettuce, tomato, and secret sauce.",
      price: "UGX 18,000",
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1998&auto=format&fit=crop",
    },
    {
      name: "Rolex Special",
      description: "Chapati rolled with 2 eggs, cabbage, tomato, and onion.",
      price: "UGX 6,000",
      image:
        "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Chicken & Chips",
      description: "2 pieces of fried chicken with golden french fries.",
      price: "UGX 20,000",
      image:
        "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Club Sandwich",
      description:
        "Triple decker sandwich with chicken, bacon, lettuce, and mayo.",
      price: "UGX 18,000",
      image:
        "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=2073&auto=format&fit=crop",
    },
    {
      name: "Kikomando",
      description: "Chapati with seasoned red beans in a spiced sauce.",
      price: "UGX 5,000",
      image:
        "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Beef Samosas",
      description: "4 crispy triangular pastries stuffed with spiced beef.",
      price: "UGX 8,000",
      image:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Chicken Wings",
      description: "6 spicy chicken wings with ranch dipping sauce.",
      price: "UGX 15,000",
      image:
        "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Hope Hot Dog",
      description:
        "Grilled sausage in a bun with caramelized onions and sauce.",
      price: "UGX 10,000",
      image:
        "https://images.unsplash.com/photo-1612392062798-2dbbbe8a5490?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Loaded Fries",
      description: "Crispy fries topped with cheese, bacon, and sour cream.",
      price: "UGX 12,000",
      image:
        "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Margherita Pizza",
      description:
        "Classic pizza with fresh tomato sauce, mozzarella, and basil.",
      price: "UGX 22,000",
      image:
        "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=2069&auto=format&fit=crop",
    },
    {
      name: "Pepperoni Pizza",
      description: "Loaded with pepperoni slices, cheese, and tomato sauce.",
      price: "UGX 25,000",
      image:
        "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=2080&auto=format&fit=crop",
    },
    {
      name: "BBQ Chicken Pizza",
      description: "BBQ sauce, grilled chicken, onions, and melted cheese.",
      price: "UGX 26,000",
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2081&auto=format&fit=crop",
    },
  ],
  Continental: [
    {
      name: "Pepper Steak",
      description:
        "Tender beef fillet with black pepper sauce and mashed potatoes.",
      price: "UGX 35,000",
      image:
        "https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Pasta Carbonara",
      description: "Spaghetti with creamy sauce, bacon, and parmesan.",
      price: "UGX 24,000",
      image:
        "https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=2071&auto=format&fit=crop",
    },
    {
      name: "Grilled Tilapia",
      description: "Whole fresh lake fish with lemon butter sauce.",
      price: "UGX 30,000",
      image:
        "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Caesar Salad",
      description:
        "Crisp lettuce, croutons, parmesan, and grilled chicken breast.",
      price: "UGX 20,000",
      image:
        "https://images.unsplash.com/photo-1546793665-c74683f339c1?q=80&w=2074&auto=format&fit=crop",
    },
    {
      name: "Beef Lasagna",
      description: "Layers of pasta, beef ragù, and creamy béchamel sauce.",
      price: "UGX 28,000",
      image:
        "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Chicken Alfredo",
      description:
        "Fettuccine with grilled chicken in rich garlic cream sauce.",
      price: "UGX 26,000",
      image:
        "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "BBQ Pork Ribs",
      description: "Slow-cooked ribs with tangy BBQ glaze and coleslaw.",
      price: "UGX 38,000",
      image:
        "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop",
    },
    {
      name: "Prawn Linguine",
      description: "Fresh prawns in garlic butter sauce with linguine pasta.",
      price: "UGX 32,000",
      image:
        "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Beef Tacos",
      description: "3 soft tacos with seasoned beef, salsa, and guacamole.",
      price: "UGX 22,000",
      image:
        "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=2080&auto=format&fit=crop",
    },
  ],
  Beverages: [
    {
      name: "Passion Fruit Juice",
      description: "Freshly squeezed sweet passion fruit juice.",
      price: "UGX 5,000",
      image:
        "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "African Tea",
      description: "Hot spiced tea with ginger and milk.",
      price: "UGX 4,000",
      image:
        "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Mango Smoothie",
      description: "Rich and creamy fresh mango blend.",
      price: "UGX 8,000",
      image:
        "https://images.unsplash.com/photo-1505252585461-04db1eb84625?q=80&w=2069&auto=format&fit=crop",
    },
    {
      name: "House Coffee",
      description: "Brewed coffee from local beans.",
      price: "UGX 5,000",
      image:
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2074&auto=format&fit=crop",
    },
    {
      name: "Fresh Pineapple Juice",
      description: "Chilled pineapple juice, naturally sweet.",
      price: "UGX 6,000",
      image:
        "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=2074&auto=format&fit=crop",
    },
    {
      name: "Iced Latte",
      description: "Cold espresso with milk over ice.",
      price: "UGX 8,000",
      image:
        "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?q=80&w=2035&auto=format&fit=crop",
    },
    {
      name: "Fresh Watermelon Juice",
      description: "Refreshing cold-pressed watermelon juice.",
      price: "UGX 5,000",
      image:
        "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Bottled Water",
      description: "Chilled mineral water (500ml).",
      price: "UGX 2,000",
      image:
        "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=2088&auto=format&fit=crop",
    },
    {
      name: "Coca-Cola",
      description: "Classic Coca-Cola in a bottle (500ml).",
      price: "UGX 3,000",
      image:
        "https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=2065&auto=format&fit=crop",
    },
    {
      name: "Sprite",
      description: "Refreshing lemon-lime soda (500ml).",
      price: "UGX 3,000",
      image:
        "https://images.unsplash.com/photo-1581006852262-e4307cf6283a?q=80&w=2062&auto=format&fit=crop",
    },
    {
      name: "Fanta Orange",
      description: "Sweet orange flavored soda (500ml).",
      price: "UGX 3,000",
      image:
        "https://images.unsplash.com/photo-1624517452488-04869289c4ca?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Pepsi",
      description: "Ice cold Pepsi cola (500ml).",
      price: "UGX 3,000",
      image:
        "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Red Wine",
      description: "Premium red wine by the glass.",
      price: "UGX 15,000",
      image:
        "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "White Wine",
      description: "Chilled white wine by the glass.",
      price: "UGX 15,000",
      image:
        "https://images.unsplash.com/photo-1547595628-c61a29f496f0?q=80&w=2087&auto=format&fit=crop",
    },
    {
      name: "Whiskey",
      description: "Premium whiskey on the rocks or neat.",
      price: "UGX 20,000",
      image:
        "https://images.unsplash.com/photo-1527281400683-1aae777175f8?q=80&w=2068&auto=format&fit=crop",
    },
    {
      name: "Vodka",
      description: "Premium vodka with mixer of choice.",
      price: "UGX 18,000",
      image:
        "https://images.unsplash.com/photo-1597290282695-edc43d0e7129?q=80&w=2075&auto=format&fit=crop",
    },
    {
      name: "Gin & Tonic",
      description: "Classic gin and tonic with lime.",
      price: "UGX 18,000",
      image:
        "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Rum & Coke",
      description: "Caribbean rum mixed with Coca-Cola.",
      price: "UGX 16,000",
      image:
        "https://images.unsplash.com/photo-1536935338788-846bb9981813?q=80&w=2066&auto=format&fit=crop",
    },
    {
      name: "Local Beer",
      description: "Nile Special or Club beer (500ml).",
      price: "UGX 6,000",
      image:
        "https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Imported Beer",
      description: "Heineken, Corona or Guinness (330ml).",
      price: "UGX 10,000",
      image:
        "https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Fresh Orange Juice",
      description: "Freshly squeezed orange juice.",
      price: "UGX 6,000",
      image:
        "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=2074&auto=format&fit=crop",
    },
    {
      name: "Milkshake (Vanilla)",
      description: "Creamy vanilla milkshake with whipped cream.",
      price: "UGX 10,000",
      image:
        "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Milkshake (Chocolate)",
      description: "Rich chocolate milkshake topped with cream.",
      price: "UGX 10,000",
      image:
        "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Mojito",
      description: "Refreshing mint and lime cocktail.",
      price: "UGX 15,000",
      image:
        "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Energy Drink",
      description: "Red Bull or local energy drink (250ml).",
      price: "UGX 8,000",
      image:
        "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?q=80&w=2080&auto=format&fit=crop",
    },
  ],
};

const users = [
  {
    full_name: "System Administrator",
    email: "admin@hopefoods.com",
    phone: "+256700000001",
    password: "Admin@123",
    role: "admin",
  },
  {
    full_name: "Restaurant Manager",
    email: "manager@hopefoods.com",
    phone: "+256700000002",
    password: "Manager@123",
    role: "manager",
  },
  {
    full_name: "John Waiter",
    email: "waiter@hopefoods.com",
    phone: "+256700000003",
    password: "Waiter@123",
    role: "waiter",
  },
  {
    full_name: "Mary Kitchen",
    email: "kitchen@hopefoods.com",
    phone: "+256700000004",
    password: "Kitchen@123",
    role: "kitchen",
  },
  {
    full_name: "Sarah Cashier",
    email: "cashier@hopefoods.com",
    phone: "+256700000005",
    password: "Cashier@123",
    role: "cashier",
  },
  {
    full_name: "Peter Reception",
    email: "reception@hopefoods.com",
    phone: "+256700000006",
    password: "Reception@123",
    role: "receptionist",
  },
];

async function seed() {
  console.log("🌱 Starting database seed...\n");

  try {
    // Seed Users
    console.log("👥 Seeding users...");
    for (const user of users) {
      const hash = await bcrypt.hash(user.password, 10);
      await pool.query(
        `INSERT IGNORE INTO users (uuid, full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), user.full_name, user.email, user.phone, hash, user.role],
      );
    }
    console.log(`✅ ${users.length} users seeded\n`);

    // Seed Categories
    console.log("🍽️  Seeding categories...");
    const categoryMap = {};
    for (const cat of categories) {
      await pool.query(
        `INSERT IGNORE INTO categories (name, slug, description, display_order) VALUES (?, ?, ?, ?)`,
        [cat.name, cat.slug, cat.description, cat.display_order],
      );
      const [rows] = await pool.query(
        `SELECT id FROM categories WHERE slug = ?`,
        [cat.slug],
      );
      categoryMap[cat.name] = rows[0].id;
    }
    console.log(`✅ ${categories.length} categories seeded\n`);

    // Seed Menu Items
    console.log("🍔 Seeding menu items...");
    let count = 0;
    for (const [catName, items] of Object.entries(menuItems)) {
      const catId = categoryMap[catName];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await pool.query(
          `INSERT IGNORE INTO menu_items (category_id, name, description, price, image, display_order) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            catId,
            item.name,
            item.description,
            parsePrice(item.price),
            item.image,
            i,
          ],
        );
        count++;
      }
    }
    console.log(`✅ ${count} menu items seeded\n`);

    // Seed Restaurant Tables
    console.log("🪑 Seeding restaurant tables...");
    for (let i = 1; i <= 12; i++) {
      const capacity = i <= 4 ? 2 : i <= 8 ? 4 : 6;
      const location = i <= 6 ? "Indoor" : "Outdoor";
      await pool.query(
        `INSERT IGNORE INTO restaurant_tables (table_number, capacity, location) VALUES (?, ?, ?)`,
        [`T${String(i).padStart(2, "0")}`, capacity, location],
      );
    }
    console.log("✅ 12 tables seeded\n");

    // Seed Room Types & Rooms
    console.log("🛏️  Seeding rooms...");
    const roomTypes = [
      {
        name: "Standard",
        description: "Comfortable standard room",
        base_price: 80000,
        capacity: 2,
      },
      {
        name: "Deluxe",
        description: "Spacious deluxe room",
        base_price: 120000,
        capacity: 2,
      },
      {
        name: "Suite",
        description: "Premium suite with living area",
        base_price: 200000,
        capacity: 4,
      },
    ];
    for (const rt of roomTypes) {
      await pool.query(
        `INSERT IGNORE INTO room_types (name, description, base_price, capacity, amenities) VALUES (?, ?, ?, ?, ?)`,
        [
          rt.name,
          rt.description,
          rt.base_price,
          rt.capacity,
          JSON.stringify(["WiFi", "AC", "TV"]),
        ],
      );
    }
    const [rtRows] = await pool.query("SELECT id, name FROM room_types");
    let roomNum = 101;
    for (const rt of rtRows) {
      const count = rt.name === "Standard" ? 8 : rt.name === "Deluxe" ? 4 : 2;
      for (let i = 0; i < count; i++) {
        await pool.query(
          `INSERT IGNORE INTO rooms (room_number, room_type_id, floor) VALUES (?, ?, ?)`,
          [String(roomNum), rt.id, Math.floor(roomNum / 100)],
        );
        roomNum++;
      }
    }
    console.log("✅ 14 rooms seeded\n");

    console.log("🎉 Seeding completed!\n");
    console.log("📋 Default Login Credentials:");
    console.log("   Admin:    admin@hopefoods.com / Admin@123");
    console.log("   Manager:  manager@hopefoods.com / Manager@123");
    console.log("   Waiter:   waiter@hopefoods.com / Waiter@123");
    console.log("   Kitchen:  kitchen@hopefoods.com / Kitchen@123");
    console.log("   Cashier:  cashier@hopefoods.com / Cashier@123");
    console.log("   Reception: reception@hopefoods.com / Reception@123\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
}

seed();
