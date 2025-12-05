import { Request, Response } from 'express';
import prisma from '../prisma';

// Helper: Bikin kode unik acak (misal: "A1B2C")
const generateCode = (length: number = 5) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// ==========================================
// 1. CREATE WORKSPACE
// ==========================================
export const createWorkspace = async (req: Request, res: Response) => {
    try {
        const { userId, name } = req.body;

        // 1. Validasi Input
        if (!userId || !name) {
            return res.status(400).json({ message: "User ID dan Nama Workspace wajib diisi" });
        }

        // 2. Generate Workspace Code Unik
        let code = generateCode();
        let isUnique = false;
        
        // Loop kecil untuk memastikan kode belum dipakai
        while (!isUnique) {
            const check = await prisma.workspace.findUnique({ where: { workspaceCode: code } });
            if (!check) isUnique = true;
            else code = generateCode();
        }

        // 3. Simpan ke Database (Pakai Nested Write Prisma)
        // Kita buat Workspace SEKALIGUS buat Member-nya
        const newWorkspace = await prisma.workspace.create({
            data: {
                name: name,
                workspaceCode: code,
                ownerId: userId, // Set Pemilik (User ID String)
                
                // Otomatis masukkan si pembuat sebagai member pertama dengan role 'Owner'
                members: {
                    create: {
                        userId: userId,
                        role: 'Owner'
                    }
                }
            }
        });

        res.status(201).json({
            message: "Workspace berhasil dibuat!",
            workspace: newWorkspace
        });

    } catch (error) {
        console.error("Create Workspace Error:", error);
        res.status(500).json({ message: "Gagal membuat workspace" });
    }
};

// ==========================================
// 2. JOIN WORKSPACE
// ==========================================
export const joinWorkspace = async (req: Request, res: Response) => {
    try {
        const { userId, workspaceCode } = req.body;

        // 1. Cari Workspace berdasarkan Kode
        const targetWorkspace = await prisma.workspace.findUnique({
            where: { workspaceCode: workspaceCode }
        });

        if (!targetWorkspace) {
            return res.status(404).json({ message: "Kode Workspace tidak ditemukan!" });
        }

        // 2. Cek apakah user sudah join sebelumnya?
        // (Mencegah error unique constraint)
        const existingMember = await prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId: targetWorkspace.id,
                    userId: userId
                }
            }
        });

        if (existingMember) {
            return res.status(400).json({ message: "Anda sudah bergabung di workspace ini!" });
        }

        // 3. Masukkan User ke Workspace Member
        const newMember = await prisma.workspaceMember.create({
            data: {
                userId: userId,
                workspaceId: targetWorkspace.id,
                role: 'Employee' // Role default saat join
            },
            include: {
                workspace: true // Supaya kita bisa kirim balik nama workspace-nya
            }
        });

        res.status(200).json({
            message: "Berhasil bergabung!",
            workspace: newMember.workspace
        });

    } catch (error) {
        console.error("Join Workspace Error:", error);
        res.status(500).json({ message: "Gagal bergabung ke workspace" });
    }
};