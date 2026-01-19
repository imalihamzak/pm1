// Hardcoded configuration values
// Update these values as needed for your deployment

export const config = {
  // NextAuth Configuration
  nextAuthSecret: "development-secret-key-change-in-production-use-random-string",
  nextAuthUrl: "", // Leave empty for auto-detection, or set your production URL here

  // Database Configuration
  databaseUrl: "mongodb+srv://imalishahzadk:imalihamzak@cluster0.yxiquws.mongodb.net/pm?retryWrites=true&w=majority",

  // SMTP Configuration
  smtp: {
    host: "softechinc.ai",
    port: 465,
    user: "noreply@softechinc.ai",
    pass: "y&S@!UoK83&S",
  },
};

