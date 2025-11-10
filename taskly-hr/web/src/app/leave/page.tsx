import { apiGet } from '@/src/lib/api';

type Leave = {
  id: string;
  employeeId: string;
  dateFrom: string;
  dateTo: string;
  type: string;
  status: string;
};

export default async function LeavePage() {
  const data = await apiGet<Leave[]>('/leave');
  return (
    <div className="card">
      <h1>Leave (Read-only, Mock)</h1>
      <ul>
        {data.map(l => (
          <li key={l.id}>
            {l.employeeId} — {l.type} ({l.dateFrom} → {l.dateTo}) [{l.status}]
          </li>
        ))}
      </ul>
    </div>
  );
}
