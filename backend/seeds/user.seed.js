import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.js"; // pastikan ekstensi .js ada

const data = [
  {
    _id: new mongoose.Types.ObjectId("67f023259a0e77614f51a077"),
    email: "superadmin@gmail.com",
    nama: "SuperAdmin",
    telepon: "08123456789",
    alamat: "Jl. Cat Lovers No. 9",
    password: "superadmin123",
    aktor: "superadmin",
    gambar: "/images/default.png",
    gender: "Laki-laki",
    tanggal_lahir: new Date("1990-01-01"),
  },
  {
    _id: new mongoose.Types.ObjectId("67f0bbaac83a8ce540c7e9c4"),
    email: "dokter@gmail.com",
    nama: "Dokter",
    telepon: "08123456780",
    alamat: "Jl. Dokter No. 10",
    password: "dokter123",
    aktor: "dokter",
    gambar: "/images/default.png",
    gender: "Laki-laki",
    tanggal_lahir: new Date("1985-05-15"),
  },
  {
    _id: new mongoose.Types.ObjectId("67f023259a0e77614f51a079"),
    email: "administrasi1@gmail.com",
    nama: "Administrasi1",
    telepon: "08123456781",
    alamat: "Jl. Cat Lovers No. 10",
    password: "administrasi123",
    aktor: "administrasi",
    gambar: "/images/default.png",
    gender: "Perempuan",
    tanggal_lahir: new Date("1992-07-22"),
  },
  {
    _id: new mongoose.Types.ObjectId("67f023259a0e77614f51a080"),
    email: "administrasi2@gmail.com",
    nama: "Administrasi2",
    telepon: "08123456782",
    alamat: "Jl. Cat Lovers No. 10",
    password: "administrasi123",
    aktor: "administrasi",
    gambar: "/images/default.png",
    gender: "Perempuan",
    tanggal_lahir: new Date("1992-07-22"),
  },
  {
    _id: new mongoose.Types.ObjectId("67f023259a0e77614f51a07a"),
    email: "klien1@gmail.com",
    nama: "Klien1",
    telepon: "08123456782",
    alamat: "Jl. Klien No. 11",
    password: "klien123",
    aktor: "klien",
    gambar: "/images/default.png",
    gender: "Laki-laki",
    tanggal_lahir: new Date("2000-03-10"),
  },
  {
    _id: new mongoose.Types.ObjectId("67f0bbaac83a8ce540c7e9c8"),
    email: "pembayaran@gmail.com",
    nama: "Pembayaran",
    telepon: "08123456783",
    alamat: "Jl. Pembayaran No. 12",
    password: "pembayaran123",
    aktor: "pembayaran",
    gambar: "/images/default.png",
    gender: "Perempuan",
    tanggal_lahir: new Date("1995-09-30"),
  },
  {
    _id: new mongoose.Types.ObjectId("67f0bbaac83a8ce540c7e9c9"),
    email: "paramedis@gmail.com",
    nama: "Paramedis",
    telepon: "08123456784",
    alamat: "Jl. medis No. 12",
    password: "paramedis123",
    aktor: "paramedis",
    gambar: "/images/default.png",
    gender: "Perempuan",
    tanggal_lahir: new Date("1995-09-30"),
  },
  {
    email: "klien2@gmail.com",
    nama: "Klien2",
    telepon: "08123456782",
    alamat: "Jl. Klien No. 11",
    password: "klien123",
    aktor: "klien",
    gambar: "/images/default.png",
    gender: "Perempuan",
    tanggal_lahir: new Date("2000-03-10"),
  },
];

const seed = async () => {
  try {
    await User.deleteMany();
    console.log("Old data deleted");

    for (let user of data) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }

    await User.insertMany(data);
    console.log("Seeded: users");
  } catch (err) {
    console.error("Error seeding users:", err);
  }
};

export default seed;
