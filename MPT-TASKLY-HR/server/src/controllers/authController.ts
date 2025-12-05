import { Request, Response } from 'express';
import prisma from '../prisma';
import bcrypt from 'bcrypt';

// ==========================
// 1. REGISTER
// ==========================
const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar!" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
      }
    });

    res.status(201).json({
      message: "Registrasi Berhasil!",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      },
      redirectTo: './login.html' // PATH EKSPLISIT
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// ==========================
// 2. LOGIN
// ==========================
const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(400).json({ message: "Password salah!" });
        }

        // Ambil membership pertama
        const membership = await prisma.workspaceMember.findFirst({
            where: { userId: user.id },
            orderBy: { joinedAt: 'asc' } 
        });

        let redirectTo = './new.html'; // Default: Onboarding
        let workspaceId = null; // Default ID Workspace
        
        if (membership) {
            const userRole = membership.role.trim().toUpperCase(); 
            workspaceId = membership.workspaceId;
            
            // LOGIKA PENTING: Penentuan Role Redirect
            if (userRole === 'OWNER' || userRole === 'ADMIN') {
                redirectTo = './admin-management.html'; // Admin ke Management Page
            } else if (userRole === 'PM') {
                redirectTo = './pm-dashboard.html'; // PM ke PM Dashboard
            } else {
                redirectTo = './user-dashboard.html'; // Employee/Member ke User Dashboard
            }
        }

        res.status(200).json({
            message: "Login Berhasil",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                workspaceId: workspaceId 
            },
            redirectTo: redirectTo
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};
// ==========================
// 3. GET USER PROFILE (Dashboard Fetch Logic)
// ==========================
const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        memberships: {
          include: { workspace: true } // Sekarang kita butuh semua workspace yang user ikuti
        },
        // ownedWorkspaces tidak diperlukan di sini, cukup membership
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let activeWorkspace = null;
    
    // Logika pemilihan workspace aktif: Ambil dari membership pertama
    if (user.memberships && user.memberships.length > 0) {
      activeWorkspace = user.memberships[0].workspace;
    }
    
    // SUCCESS: Kirim data user, workspace aktif, DAN SEMUA membership (untuk sidebar)
    res.json({
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        workspace: activeWorkspace, // Workspace aktif (untuk dashboard utama)
        allMemberships: user.memberships // <--- BARU: Daftar semua workspace (untuk sidebar)
      }
    });

  } catch (error) {
    console.error("CRASHED IN GET USER PROFILE:", error); 
    res.status(500).json({ message: "Server Error" });
  }
};

// ==========================
// FINAL EXPORT (Mengatasi TS2305)
// ==========================
export default {
    register,
    login,
    getUserProfile
};