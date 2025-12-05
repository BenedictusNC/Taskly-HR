import express from 'express';
import cors from 'cors';

// Import Routes
import authRoutes from './routes/authRoutes';
import workspaceRoutes from './routes/workspaceRoutes';
import taskRoutes from './routes/taskRoutes';
import employeeRoutes from './routes/employeeRoutes';
import performanceRoutes from './routes/performanceRoutes';
// import memberRoutes from './routes/memberRoutes'; // Uncomment jika file routes-nya sudah ada

const app = express();
const PORT = 3000;

// 1. MIDDLEWARE
app.use(cors()); // <--- PENTING! Izinkan Frontend akses Backend
app.use(express.json()); // Supaya bisa baca req.body (JSON)

// 2. REGISTER ROUTES
// Sesuai dengan fetch di frontend: http://localhost:3000/api/auth/...
app.use('/api/auth', authRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/member', employeeRoutes);
app.use('/api/performance', performanceRoutes);
// app.use('/api/member', memberRoutes);

// 3. ROOT CHECK (Opsional, buat ngecek di browser)
app.get('/', (req, res) => {
  res.send('Taskly HR Server is Running! 🚀');
});

// 4. JALANKAN SERVER
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});