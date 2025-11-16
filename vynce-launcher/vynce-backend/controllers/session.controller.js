export const clientLog = async (req, res) => {
  console.log("CLIENT LOG:", req.body);
  return res.json({ success: true });
};
