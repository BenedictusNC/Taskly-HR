import { Request, Response } from 'express';
import prisma from '../prisma';
import { Status } from '@prisma/client';

// --- PLACEHOLDER UNTUK LOGIKA MATEMATIKA ---
// Anda akan mengisi fungsi-fungsi ini di service layer di masa depan
const getPriorityMultiplier = (priority: string): number => {
    switch (priority) {
        case 'URGENT': return 1.2;
        case 'HIGH': return 1.1;
        case 'NORMAL': return 1.0;
        case 'LOW': return 0.8;
        default: return 1.0;
    }
};

const calculateTimenessValue = (dueDate: Date | null, completedAt: Date): number => {
    if (!dueDate) return 1.0; // Jika tidak ada Due Date, anggap netral (1.0)

    // Hitung selisih dalam hari (Timeness)
    const diffMs = dueDate.getTime() - completedAt.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24); // Selisih hari (positif jika lebih cepat)

    if (diffDays >= 3) {
        return 1.2; // Lebih dari 3 hari lebih cepat
    } else if (diffDays >= 1) {
        return 1.1; // Lebih dari 1 hari lebih cepat
    } else if (diffDays >= 0) {
        return 1.0; // Tepat waktu (termasuk hari deadline)
    } else {
        // Terlambat: diffDays negatif
        const daysLate = Math.ceil(Math.abs(diffDays)); // Hitung hari terlambat
        const penalty = daysLate * 0.05;
        return 1.0 - penalty; // Contoh: terlambat 2 hari = 1.0 - 0.10 = 0.90
    }
};

const calculateQualityValue = (task: any): number => {
    // Score Kualitas dimulai dari 1.0
    let qualityScore = 1.0;

    // Kurangi Penalty berdasarkan counter di database
    
    // Penalty Major Revision (-0.1)
    qualityScore -= (task.revisionMajor * 0.1); 
    
    // Penalty Minor Revision (-0.05)
    qualityScore -= (task.revisionMinor * 0.05); 
    
    // Penalty Complain (-0.2)
    qualityScore -= (task.clientComplaints * 0.2); 

    // Score bisa bernilai negatif jika penalty terlalu besar, sesuai dengan rumus Anda.
    return qualityScore;
};
// --- END PLACEHOLDER ---


// Helper Function: Enum to String (Untuk dikirim ke Frontend)
function mapStatusToString(status: Status): string {
    switch (status) {
        case Status.TODO: return 'To Do';
        case Status.IN_PROGRESS: return 'In Progress';
        case Status.REVIEW: return 'Review';
        case Status.DONE: return 'Done';
        default: return 'To Do';
    }
}


// ==========================================
// 1. GET TASKS BY WORKSPACE (Dipakai oleh loadTasks)
// ==========================================
export const getTasks = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.params;
        
        const tasks = await prisma.task.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' }
        });

        // Mapping Enum Status kembali ke format String yang dimengerti Frontend
        const formattedTasks = tasks.map(task => ({
            ...task,
            status: mapStatusToString(task.status as Status),
            // Pastikan Priority adalah string agar aman
            priority: task.priority as string
        }));

        res.json({ data: formattedTasks });

    } catch (error) {
        console.error("Get Tasks Error:", error);
        res.status(500).json({ message: "Gagal mengambil data task" });
    }
};


// ==========================================
// 2. PATCH UPDATE TASK STATUS (Dipakai oleh moveTask)
// ==========================================
export const updateTaskStatus = async (req: Request, res: Response) => {
    try {
        const { taskId } = req.params;
        const { status: newStatus } = req.body; // NewStatus: "To Do", "In Progress", "Done", dll
        
        const prismaStatus = Status[newStatus.replace(/\s/g, '_').toUpperCase() as keyof typeof Status];

        if (!prismaStatus) {
            return res.status(400).json({ message: "Status yang diberikan tidak valid." });
        }
        
        // Data yang akan diupdate (base update)
        let updateData: any = { 
            status: prismaStatus,
            updatedAt: new Date()
        };

        // --- LOGIKA KALKULASI PERFORMANCE ---
        if (newStatus === 'Done') {
            const completedAt = new Date();
            updateData.completedAt = completedAt; // Catat waktu selesai

            // 1. Ambil data Task saat ini untuk perhitungan
            const currentTask = await prisma.task.findUnique({ where: { id: taskId } });

            if (currentTask) {
                // Konversi string Effort ke number
                const effortValue = currentTask.effort; // Sudah berupa integer
                
                // 2. Hitung Multiplier (Timeness, Quality)
                const timenessValue = calculateTimenessValue(currentTask.dueDate, completedAt);
                const qualityValue = calculateQualityValue(currentTask); 
                const priorityMultiplier = getPriorityMultiplier(currentTask.priority as string);
                
                // 3. Rumus Final: Contribution Score = Effort x Value x Timeness x Quality
                const rawScore = effortValue * priorityMultiplier * timenessValue * qualityValue;
                
                // Simpan skor ke database
                updateData.contributionScore = parseFloat(rawScore.toFixed(4)); 
                
                console.log(`[PERF CALC] Task ${taskId}: Score calculated as ${updateData.contributionScore}`);
            }
        }
        
        // Lakukan update database
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: updateData,
        });

        res.json({ message: "Status dan Score berhasil diupdate", data: updatedTask });

    } catch (error) {
        console.error("Update Task Status Error:", error);
        res.status(500).json({ message: "Gagal memproses update status dan skor." });
    }
};
const findOrCreateGeneralProject = async (workspaceId: string, projectName: string = "General Project") => {
    let project = await prisma.project.findFirst({
        where: { 
            workspaceId,
            name: projectName
        }
    });

    if (!project) {
        project = await prisma.project.create({
            data: {
                workspaceId,
                name: projectName,
                allocatedBudget: 0
            }
        });
    }
    return project;
};


// ==========================================
// 3. POST CREATE TASK (Endpoint untuk membuat task baru)
// ==========================================
export const createTask = async (req: Request, res: Response) => {
    try {
        const { 
            title, 
            description, 
            workspaceId, 
            assignedTo, 
            effort, 
            priority // Dikirim sebagai string: 'HIGH', 'LOW', dll.
        } = req.body;

        // 1. Validasi Input Kritis
        if (!title || !workspaceId || !effort || !priority) {
            return res.status(400).json({ message: "Judul, Workspace ID, Effort, dan Priority wajib diisi." });
        }

        // 2. Tentukan Project ID (Cari atau buat Project 'General')
        const project = await findOrCreateGeneralProject(workspaceId);

        // 3. Simpan Task Baru
        const newTask = await prisma.task.create({
            data: {
                title,
                description,
                workspaceId,
                projectId: project.id,
                assignedTo: assignedTo, // User ID yang ditugaskan (bisa null/diisi nanti)
                
                // Metrik Core: Disimpan sebagai Enum/Integer
                effort: parseInt(effort), // Harus Int (1, 2, 3, 5, 8...)
                priority: priority, // 'HIGH', 'URGENT', dll.
                
                status: Status.TODO, // Default Status
            }
        });

        res.status(201).json({ message: "Task berhasil dibuat!", task: newTask });

    } catch (error) {
        console.error("Create Task Error:", error);
        res.status(500).json({ message: "Gagal membuat task di server." });
    }
};
// ==========================================
// 4. GET TASKS BY ASSIGNED USER (DIPAKAI MEMBER POV)
// ==========================================
export const getTasksByAssignedUser = async (req: Request, res: Response) => {
    try {
        const { workspaceId, userId } = req.params;

        // Filter tasks HANYA yang ditugaskan ke userId ini
        const tasks = await prisma.task.findMany({
            where: { 
                workspaceId: workspaceId,
                assignedTo: userId 
            },
            // Asumsi include dan order by ada di sini
            orderBy: { createdAt: 'desc' }
        });

        // [TODO: Sertakan include Project dan Assignee jika diperlukan]

        // Mapping Enum Status kembali ke format String
        const formattedTasks = tasks.map(task => ({
            ...task,
            // Asumsi mapping status ada di sini
            status: task.status
        }));
        
        res.json({ data: formattedTasks });

    } catch (error) {
        console.error("Get Tasks By User Error:", error);
        res.status(500).json({ message: "Gagal mengambil data tugas user." });
    }
};