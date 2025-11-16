export const getLiveUsers = async (req, res) => {
  return res.json({
    activeUsers: 42,
    last5: ["vuid123", "vuid999", "vuid555"],
  });
};

export const getEvents = async (req, res) => {
  return res.json({
    events: [
      "User login",
      "Username set",
      "Age verified",
    ],
  });
};
