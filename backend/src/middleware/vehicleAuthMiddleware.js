const VEHICLE_SECRET_TOKEN = process.env.VEHICLE_SECRET_TOKEN || "vehicle_secret_token_123";

const verifyVehicle = (req, res, next) => {
  const token = req.headers["x-vehicle-token"];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No vehicle verification token provided"
    });
  }

  if (token !== VEHICLE_SECRET_TOKEN) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Invalid vehicle verification token"
    });
  }

  next();
};

module.exports = verifyVehicle;
