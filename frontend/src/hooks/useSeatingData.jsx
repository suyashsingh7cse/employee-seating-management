import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";

export function useSeatingData() {
  const [employees, setEmployees] = useState([]);
  const [seats, setSeats] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const refresh = useCallback(async () => {
    setLoadError("");
    try {
      const [employeesData, seatsData, assignmentsData] = await Promise.all([
        api.get("/employees"),
        api.get("/seats"),
        api.get("/assignments"),
      ]);
      setEmployees(employeesData);
      setSeats(seatsData);
      setAssignments(assignmentsData);
    } catch (err) {
      setLoadError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function assignmentForEmployee(employeeId) {
    return assignments.find((a) => a.employee_id === employeeId);
  }

  function assignmentForSeat(seatId) {
    return assignments.find((a) => a.seat_id === seatId);
  }

  // Every mutation re-fetches rather than optimistically patching local
  // state — for a dataset this small the round trip is cheap, and it
  // guarantees the UI always reflects what the backend actually
  // validated and persisted (important once the AI assistant is also
  // writing to the same data in Phase 3).
  async function assignSeat(employeeId, seatId) {
    await api.post("/assignments", { employee_id: employeeId, seat_id: seatId });
    await refresh();
  }

  async function moveAssignment(assignmentId, seatId) {
    await api.put(`/assignments/${assignmentId}`, { seat_id: seatId });
    await refresh();
  }

  async function removeAssignment(assignmentId) {
    await api.del(`/assignments/${assignmentId}`);
    await refresh();
  }

  async function createEmployee(payload) {
    const employee = await api.post("/employees", payload);
    await refresh();
    return employee;
  }

  async function updateEmployee(id, payload) {
    const employee = await api.put(`/employees/${id}`, payload);
    await refresh();
    return employee;
  }

  async function deleteEmployee(id) {
    await api.del(`/employees/${id}`);
    await refresh();
  }

  return {
    employees,
    seats,
    assignments,
    loading,
    loadError,
    refresh,
    assignmentForEmployee,
    assignmentForSeat,
    assignSeat,
    moveAssignment,
    removeAssignment,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
}
