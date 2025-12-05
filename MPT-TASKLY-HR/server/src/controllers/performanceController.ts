// src/controllers/performanceController.ts - KODE SUDAH DIKOREKSI UNTUK DECIMAL

import { Request, Response } from 'express';
import prisma from '../prisma';
import { Status } from '@prisma/client';

export const getPerformanceMetrics = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.params;

        const members = await prisma.workspaceMember.findMany({
            where: { workspaceId },
            include: { user: true }
        });
        
        const completedTasks = await prisma.task.findMany({
            where: { 
                workspaceId,
                status: Status.DONE
            },
            select: {
                id: true,
                assignedTo: true,
                contributionScore: true,
            }
        });

        // 1. Hitung Total Skor Kontribusi Global
        // FIX 1: Gunakan .toNumber() pada setiap task.contributionScore
        const totalContributionScore = completedTasks.reduce((sum, task) => sum + task.contributionScore.toNumber(), 0);

        // 2. Agregasi Skor per User
        const userScores = members.map(member => {
            const userTasks = completedTasks.filter(task => task.assignedTo === member.userId);
            
            // FIX 2: Gunakan .toNumber() pada setiap task.contributionScore
            const userTotalScore = userTasks.reduce((sum, task) => sum + task.contributionScore.toNumber(), 0);
            
            // Logika Wage Allocation
            const contributionRate = totalContributionScore > 0 ? (userTotalScore / totalContributionScore) : 0;

            return {
                memberId: member.id,
                username: member.user.username,
                role: member.role,
                totalScore: parseFloat(userTotalScore.toFixed(4)), // Pastikan skor di-format sebelum dikirim
                contributionRate: parseFloat(contributionRate.toFixed(4)),
            };
        });

        res.json({
            data: {
                metrics: {
                    totalUsers: members.length,
                    totalScore: parseFloat(totalContributionScore.toFixed(4)),
                },
                userMetrics: userScores
            }
        });

    } catch (error) {
        console.error("Get Performance Metrics Error:", error);
        res.status(500).json({ message: "Gagal mengambil data performa." });
    }
};