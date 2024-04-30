import UserInterface from "../interfaces/user.interface";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user";
import jwt, { Secret } from "jsonwebtoken";
import multer from "multer";
import path from "path";

//store Image
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve(__dirname, "../uploads/userImages");
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

class UserController {
  //User register
  public async register(req: Request, res: Response): Promise<void> {
    console.log(req.body);
    console.log(req.file);
    try {
      const {
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
      }: UserInterface = req.body;

      //Check if user with email already exist
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(400).json({ message: "User already exists" });
        return;
      }

      //Hash Password
      const hashedPassword: string = await bcrypt.hash(password, 10);

      //process image upload
      // upload.single("userImage")(req, res, async (err: any) => {
      //   console.log(req.file);
      //   if (err) {
      //     console.error("Error uploading image:", err);
      //     return res.status(500).json({ message: "Failed to upload image" });
      //   }
      // });

      const imagePath = req.file?.path;

      //Create user
      await User.create({
        firstName,
        lastName,
        email,
        userImage: imagePath,
        phoneNumber,
        password: hashedPassword,
      });

      res.status(201).json({ message: "User Registered successfully" });
    } catch (err) {
      console.log("user not created", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  //User login
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: UserInterface = req.body;

      //check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (!existingUser) {
        res.status(400).json({ message: "Invalid Email" });
        return;
      }

      //check password

      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (!isMatch) {
        res.status(400).json({ message: "Invalid credential" });
        return;
      }

      //Access the jwt secret key from .env file
      const jwtSecret: Secret | undefined = process.env.JWT_SECRET_KEY;

      if (!jwtSecret) {
        throw new Error("JWT secret key is not found");
      }

      //Generate jwt token
      const jwtToken = jwt.sign({ userId: existingUser.id }, jwtSecret, {
        expiresIn: "1hr",
      });

      res.status(200).json({ message: "Login successfully", jwtToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export { upload };
export default new UserController();
