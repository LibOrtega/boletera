//make a small library of actions

const settingsLib = {
  getSettings: async (db) => {
    try {
      const settings = await db.collection("settings").findOne();
      return settings;
    } catch (error) {
      console.error("error in getSettings function", error);
      return false;
    }
  },
};

export default settingsLib;
