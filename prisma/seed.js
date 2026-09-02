
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// Username -> plaintext password (monkey breed + number).
// Kept here in plain sight because the app isn't security critical -
// this is printed out at the end so you can hand them out.
const ACCOUNTS = [
  { username: "neo", displayName: "Neo", password: "orangutan42", role: "PLAYER" },
  { username: "gabriel", displayName: "Gabriel", password: "chimpanzee88", role: "PLAYER" },
  { username: "cairo", displayName: "Cairo", password: "gorilla23", role: "PLAYER" },
  { username: "reece", displayName: "Reece", password: "baboon56", role: "PLAYER" },
  { username: "tylen", displayName: "Tylen", password: "macaque11", role: "PLAYER" },
  { username: "sifiso", displayName: "Sifiso", password: "mandrill77", role: "PLAYER" },
  { username: "jonny", displayName: "Jonny", password: "capuchin34", role: "PLAYER" },
  { username: "admin", displayName: "Admin", password: "gibbon99", role: "ADMIN" },
];

async function main() {
  console.log("Seeding Rock My Billys league...\n");

  for (const acc of ACCOUNTS) {
    const hashed = await bcrypt.hash(acc.password, 10);
    await prisma.user.upsert({
      where: { username: acc.username },
      update: {},
      create: {
        username: acc.username,
        displayName: acc.displayName,
        password: hashed,
        role: acc.role,
        elo: 1000,
      },
    });
  }

  console.log("Accounts created. LOGIN DETAILS (save these somewhere safe):\n");
  console.log("username".padEnd(12), "password");
  console.log("-".repeat(30));
  for (const acc of ACCOUNTS) {
    console.log(acc.username.padEnd(12), acc.password);
  }
  console.log("\nEveryone starts at 1000 elo / Advanced rank.");
  console.log("Drop profile pics in public/avatars/ named <username>.png, e.g. neo.png");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
