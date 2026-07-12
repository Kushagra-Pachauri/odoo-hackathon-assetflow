import jwt from "jsonwebtoken";

export const generateToken = (employee) => {
  return jwt.sign(
    {
      employeeId: employee.id,
      role: employee.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "8h",
    }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};