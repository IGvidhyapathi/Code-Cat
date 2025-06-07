"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { 
  IconUsers,
  IconChevronLeft,
  IconSearch,
  IconUserPlus,
  IconUserMinus,
  IconUserCheck,
  IconUserX,
  IconSettings,
  IconRefresh
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ClerkUser {
  id: string;
  email_addresses: { email_address: string }[];
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  imageUrl?: string;
  public_metadata?: {
    role?: string;
  };
  created_at: string;
  last_sign_in_at?: string;
}

export default function UserManagement() {
  const router = useRouter();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<ClerkUser[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Check if user is admin
  const userRole = user?.publicMetadata?.role as string || 'member';
  
  useEffect(() => {
    if (userRole !== 'admin') {
      router.push('/');
      toast.error("You don't have permission to access this page");
      return;
    }

    // Fetch real users from API
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error("Failed to load users");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [userRole, router]);

  const filteredUsers = users.filter(user => {
    const searchLower = userSearchTerm.toLowerCase();
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim().toLowerCase();
    const email = user.email_addresses[0]?.email_address.toLowerCase() || '';
    const username = (user.username || '').toLowerCase();
    const role = (user.public_metadata?.role || '').toLowerCase();
    
    const matchesSearch = fullName.includes(searchLower) || 
                         email.includes(searchLower) || 
                         username.includes(searchLower);
    
    const matchesRole = selectedRole === 'all' || role === selectedRole.toLowerCase();
    
    return matchesSearch && matchesRole;
  });

  const getUserDisplayName = (user: ClerkUser) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username || user.email_addresses[0]?.email_address.split('@')[0] || 'Unknown User';
  };

  const getUserEmail = (user: ClerkUser) => {
    return user.email_addresses[0]?.email_address || '';
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      // Update local state
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, public_metadata: { ...u.public_metadata, role: newRole } }
          : u
      ));

      toast.success("User role updated successfully");
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error("Failed to update user role");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center rounded-full p-2 text-gray-400 hover:bg-slate-800 hover:text-white"
            >
              <IconChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <IconRefresh className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search users by name, email, or username..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="seller">Seller</option>
            <option value="marketer">Marketer</option>
            <option value="member">Member</option>
          </select>
        </div>

        {/* User List */}
        <div className="mt-8">
          {isLoadingUsers ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <IconUsers className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="mt-4 text-gray-400">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Joined
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-900 divide-y divide-slate-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {user.imageUrl ? (
                              <img
                                src={user.imageUrl}
                                alt={getUserDisplayName(user)}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                <IconUsers className="h-6 w-6 text-indigo-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {getUserDisplayName(user)}
                            </div>
                            <div className="text-sm text-gray-400">
                              {getUserEmail(user)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.public_metadata?.role === 'admin' ? 'bg-red-400/10 text-red-400' :
                          user.public_metadata?.role === 'seller' ? 'bg-green-400/10 text-green-400' :
                          user.public_metadata?.role === 'marketer' ? 'bg-blue-400/10 text-blue-400' :
                          'bg-gray-400/10 text-gray-400'
                        }`}>
                          {user.public_metadata?.role || 'member'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <select
                            value={user.public_metadata?.role || 'member'}
                            onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                            className="px-2 py-1 text-sm bg-slate-800 border border-slate-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="member">Member</option>
                            <option value="seller">Seller</option>
                            <option value="marketer">Marketer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 