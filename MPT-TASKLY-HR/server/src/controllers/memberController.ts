import { Request, Response } from 'express';
import prisma from '../prisma';

// ==========================================
// 1. GET ALL MEMBERS BY WORKSPACE
// ==========================================
export const getMembers = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.params;

        if (!workspaceId) {
            return res.status(400).json({ message: "Workspace ID diperlukan." });
        }

        // Ambil semua member (dan data user yang terkait) dari workspace ini
        const members = await prisma.workspaceMember.findMany({
            where: { workspaceId: workspaceId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    }
                }
            },
            orderBy: { joinedAt: 'asc' }
        });

        res.json({ data: members });

    } catch (error) {
        console.error("Get Members Error:", error);
        res.status(500).json({ message: "Gagal mengambil data member." });
    }
};

// ==========================================
// 2. PATCH UPDATE MEMBER ROLE
// ==========================================
export const updateMemberRole = async (req: Request, res: Response) => {
    try {
        const { memberId } = req.params;
        const { role: newRole } = req.body;

        if (!newRole) {
            return res.status(400).json({ message: "Role baru wajib diisi." });
        }

        // Cek validitas role (opsional, tapi baik untuk mencegah input asing)
        const validRoles = ['Owner', 'PM', 'Member', 'Employee']; 
        if (!validRoles.includes(newRole)) {
            return res.status(400).json({ message: "Role tidak valid." });
        }

        // Update role di database
        const updatedMember = await prisma.workspaceMember.update({
            where: { id: memberId },
            data: { role: newRole },
            include: {
                user: {
                    select: { username: true } // Ambil username untuk konfirmasi
                }
            }
        });

        res.json({ 
            message: `Role ${updatedMember.user.username} berhasil diubah menjadi ${newRole}.`, 
            data: updatedMember 
        });

    } catch (error) {
        console.error("Update Role Error:", error);
        res.status(500).json({ message: "Gagal mengupdate role member." });
    }
};

// [TODO: Tambahkan fungsi updateRole di sini nanti]