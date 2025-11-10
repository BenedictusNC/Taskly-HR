export default function DashboardPage() {
  return (
    <div className="card">
      <h1>Taskly HR — Dashboard</h1>
      <div className="row" style={{marginTop: 12}}>
        <a className="badge" href="/employees">Employees</a>
        <a className="badge" href="/attendance">Attendance</a>
        <a className="badge" href="/leave">Leave</a>
      </div>
    </div>
  );
}
