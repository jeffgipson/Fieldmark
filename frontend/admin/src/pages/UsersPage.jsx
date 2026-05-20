import { useEffect, useState } from 'react';
import { listUsers, updateUser } from '../api/users';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input, { Label } from '../components/ui/Input';
import Modal from '../components/ui/Modal';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);

  async function loadUsers() {
    try {
      setLoading(true);
      const { data } = await listUsers({ per_page: 100 });
      setUsers(data);
    } catch (err) {
      setError(
        err?.field === "authorization"
          ? "Session expired or not an admin. Log out and sign in again."
          : err?.message || "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function saveUser() {
    if (!editing) return;
    try {
      await updateUser(editing.id, { 
        first_name: editing.first_name,
        last_name: editing.last_name,
        email: editing.email,
        role: editing.role
      });
      setEditing(null);
      await loadUsers();
    } catch (err) {
      setError('Failed to update user.');
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div>
      <PageHeader title="Users" />
      <div className="space-y-3">
        {users.length === 0 && (
          <p className="text-fm-gray-medium">
            No users found. Run <code className="text-sm">cd api && bin/rails db:seed</code> to load sample farmers.
          </p>
        )}
        {users.map((user) => (
          <Card key={user.id} className="flex justify-between items-center">
            <div>
              <p className="font-bold">{user.first_name} {user.last_name}</p>
              <p className="text-sm text-gray-500">{user.email} - {user.role}</p>
            </div>
            <Button variant="secondary" onClick={() => setEditing({ ...user })}>
              Edit
            </Button>
          </Card>
        ))}
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing ? `Edit ${editing.first_name} ${editing.last_name}` : undefined}
        placement="mainPanel"
      >
        {editing && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="edit-first-name">First name</Label>
                <Input
                  id="edit-first-name"
                  value={editing.first_name}
                  onChange={(e) => setEditing({ ...editing, first_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-last-name">Last name</Label>
                <Input
                  id="edit-last-name"
                  value={editing.last_name}
                  onChange={(e) => setEditing({ ...editing, last_name: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editing.email}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="edit-role">Role</Label>
                <select
                  id="edit-role"
                  className="w-full rounded-lg border-[1.5px] border-fm-input-border bg-white px-4 py-3 text-base text-fm-charcoal focus:border-fm-teal focus:outline-none focus:ring-[3px] focus:ring-fm-teal/15"
                  value={editing.role}
                  onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                >
                  <option value="farmer">farmer</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={saveUser}>Save</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
