import appSingleton from "./appSingleton.js";

const PORT = process.env.PORT || 5500;

appSingleton.getApp().listen(PORT, () => {
  console.log(`🔥 Backend running on http://localhost:${PORT}`);
});