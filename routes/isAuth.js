const jwt = require("jsonwebtoken");

exports.verifyToken = async (req, res, next) => {
  console.log('/verifyToken', req);
  try {
    const token = req.cookies.auth;

    if (!token) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const decoded = await jwt.verify(
      token,
      "1234!@#%<{*&)",
    );

    if (!decoded) {
      throw new Error();
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Error Validating Token" });
  }
};
