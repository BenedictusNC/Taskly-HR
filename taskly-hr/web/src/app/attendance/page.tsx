import { apiGet } from '@/src/lib/api';

type Attendance = {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  type: string;
};

export default async function AttendancePage() {
  const data = await apiGet<Attendance[]>('/attendance');
  return (
    <div className="card">
      <h1>Attendance (Read-only, Mock)</h1>
      <ul>
        {data.map(a => (
          <li key={a.id}>
            {a.date} — {a.employeeId} — in: {a.checkIn || '-'} / out: {a.checkOut || '-'} ({a.type})
          </li>
        ))}
      </ul>
    </div>
  );
}
