import { apiGet } from '@/src/lib/api';

type Employee = {
  id: string;
  fullName: string;
  email: string;
  position: string;
  department: string;
  joinedAt: string;
  status: string;
};

export default async function EmployeesPage() {
  const employees = await apiGet<Employee[]>('/employees');
  return (
    <div className="card">
      <h1>Employees</h1>
      <table className="table" style={{marginTop:12}}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Position</th>
            <th>Department</th>
            <th>Joined</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(e => (
            <tr key={e.id}>
              <td>{e.fullName}</td>
              <td>{e.email}</td>
              <td>{e.position}</td>
              <td>{e.department}</td>
              <td>{e.joinedAt}</td>
              <td><span className="badge">{e.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
