"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { 
  IconMail, 
  IconSend,
  IconTrash,
  IconChevronLeft,
  IconSearch,
  IconX,
  IconRefresh,
  IconUserCircle,
  IconUsers
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Email {
  id: string;
  subject: string;
  recipient: string;
  content: string;
  status: 'sent' | 'draft' | 'scheduled';
  sentAt?: string;
  scheduledFor?: string;
  targetedUsers?: string[];
}

interface ClerkUser {
  id: string;
  email_addresses: { email_address: string }[];
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  public_metadata?: {
    role?: string;
  };
}

export default function MailManagement() {
  const router = useRouter();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [emails, setEmails] = useState<Email[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [newEmail, setNewEmail] = useState({
    subject: "",
    content: "",
    sendToAll: false,
    selectedUsers: [] as string[]
  });
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
    
    // Mock email data
    setEmails([
      {
        id: '1',
        subject: 'Welcome to CodeCat',
        recipient: 'all@codecat.com',
        content: 'Welcome to our platform!',
        status: 'sent',
        sentAt: '2024-03-20T10:00:00Z'
      },
      {
        id: '2',
        subject: 'New Feature Announcement',
        recipient: 'users@codecat.com',
        content: 'Check out our latest features!',
        status: 'scheduled',
        scheduledFor: '2024-03-25T15:00:00Z'
      }
    ]);
    setIsLoading(false);
  }, [userRole, router]);

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.recipient.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || email.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(user => {
    const searchLower = userSearchTerm.toLowerCase();
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim().toLowerCase();
    const email = user.email_addresses[0]?.email_address.toLowerCase() || '';
    const username = (user.username || '').toLowerCase();
    
    return fullName.includes(searchLower) || 
           email.includes(searchLower) || 
           username.includes(searchLower);
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

  const handleNewEmail = () => {
    setShowCompose(true);
  };

  const handleDeleteEmail = (id: string) => {
    setEmails(emails.filter(email => email.id !== id));
    toast.success("Email deleted successfully");
  };

  const handleSendEmail = async (id: string) => {
    const email = emails.find(e => e.id === id);
    if (!email) return;

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: email.subject,
          content: email.content,
          recipients: email.targetedUsers || [],
          sendToAll: !email.targetedUsers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      toast.success(data.message);
      
      // Update email status
      setEmails(emails.map(e => 
        e.id === id 
          ? { ...e, status: 'sent' as const, sentAt: new Date().toISOString() }
          : e
      ));

      // Show detailed results if there were any failures
      const failedEmails = data.results?.filter((r: any) => !r.success);
      if (failedEmails?.length > 0) {
        console.error('Failed to send to some recipients:', failedEmails);
        toast.error(`Failed to send to ${failedEmails.length} recipient(s). Check console for details.`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error instanceof Error ? error.message : "Failed to send email");
    }
  };

  const toggleUserSelection = (email: string) => {
    setNewEmail({
      ...newEmail,
      selectedUsers: newEmail.selectedUsers.includes(email)
        ? newEmail.selectedUsers.filter(e => e !== email)
        : [...newEmail.selectedUsers, email]
    });
  };

  const handleSendNewEmail = async () => {
    if (!newEmail.subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }
    if (!newEmail.sendToAll && newEmail.selectedUsers.length === 0) {
      toast.error("Please select recipients or choose to send to all");
      return;
    }

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: newEmail.subject,
          content: newEmail.content,
          recipients: newEmail.selectedUsers,
          sendToAll: newEmail.sendToAll,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      toast.success(data.message);

      // Show detailed results if there were any failures
      const failedEmails = data.results?.filter((r: any) => !r.success);
      if (failedEmails?.length > 0) {
        console.error('Failed to send to some recipients:', failedEmails);
        toast.error(`Failed to send to ${failedEmails.length} recipient(s). Check console for details.`);
      }

      const newEmailObj: Email = {
        id: (emails.length + 1).toString(),
        subject: newEmail.subject,
        recipient: newEmail.sendToAll ? 'all@codecat.com' : newEmail.selectedUsers.join(', '),
        content: newEmail.content,
        status: 'sent',
        sentAt: new Date().toISOString(),
        targetedUsers: !newEmail.sendToAll ? newEmail.selectedUsers : undefined
      };

      setEmails([newEmailObj, ...emails]);
      setShowCompose(false);
      setNewEmail({
        subject: "",
        content: "",
        sendToAll: false,
        selectedUsers: []
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error instanceof Error ? error.message : "Failed to send email");
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
            <h1 className="text-2xl font-bold text-white">Mail Management</h1>
          </div>
          <Button
            onClick={handleNewEmail}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <IconMail className="h-4 w-4" />
            Compose
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="sent">Sent</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        {/* Email List */}
        <div className="mt-8">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading emails...</p>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="text-center py-8">
              <IconMail className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="mt-4 text-gray-400">No emails found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className="bg-slate-800 rounded-lg p-4 border border-slate-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">{email.subject}</h3>
                      <p className="mt-1 text-sm text-gray-400">{email.recipient}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        email.status === 'sent' ? 'bg-green-400/10 text-green-400' :
                        email.status === 'draft' ? 'bg-yellow-400/10 text-yellow-400' :
                        'bg-blue-400/10 text-blue-400'
                      }`}>
                        {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                      </span>
                      <button
                        onClick={() => handleSendEmail(email.id)}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        <IconSend className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmail(email.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <IconTrash className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  {email.sentAt && (
                    <p className="mt-2 text-xs text-gray-500">
                      Sent at: {new Date(email.sentAt).toLocaleString()}
                    </p>
                  )}
                  {email.scheduledFor && (
                    <p className="mt-2 text-xs text-gray-500">
                      Scheduled for: {new Date(email.scheduledFor).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Compose Modal */}
        <AnimatePresence>
          {showCompose && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-slate-900 rounded-lg p-6 w-full max-w-2xl border border-slate-700"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">New Email</h2>
                  <button
                    onClick={() => setShowCompose(false)}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <IconX className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={newEmail.subject}
                      onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                      placeholder="Enter email subject"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Content
                    </label>
                    <textarea
                      value={newEmail.content}
                      onChange={(e) => setNewEmail({ ...newEmail, content: e.target.value })}
                      placeholder="Enter email content"
                      rows={4}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-4">
                      <input
                        type="checkbox"
                        checked={newEmail.sendToAll}
                        onChange={(e) => setNewEmail({ ...newEmail, sendToAll: e.target.checked })}
                        className="rounded border-gray-700 bg-slate-900 text-blue-500 focus:ring-blue-500"
                      />
                      Send to all users
                    </label>

                    {!newEmail.sendToAll && (
                      <div>
                        <div className="relative mb-4">
                          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="text"
                            placeholder="Search users by name, email, or username..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="bg-slate-800 rounded-lg border border-slate-700 divide-y divide-slate-700 max-h-60 overflow-y-auto">
                          {isLoadingUsers ? (
                            <div className="p-4 text-center text-gray-400">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                              <p>Loading users...</p>
                            </div>
                          ) : filteredUsers.length === 0 ? (
                            <div className="p-4 text-center text-gray-400">
                              <IconUsers className="h-8 w-8 mx-auto mb-2" />
                              <p>No users found</p>
                            </div>
                          ) : (
                            filteredUsers.map((user) => (
                              <label
                                key={user.id}
                                className="flex items-center gap-3 p-3 hover:bg-slate-700 cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={newEmail.selectedUsers.includes(getUserEmail(user))}
                                  onChange={() => toggleUserSelection(getUserEmail(user))}
                                  className="rounded border-gray-700 bg-slate-900 text-blue-500 focus:ring-blue-500"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm font-medium text-white truncate">
                                      {getUserDisplayName(user)}
                                    </div>
                                    {user.public_metadata?.role && (
                                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-400/10 text-blue-400">
                                        {user.public_metadata.role}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-400 truncate">{getUserEmail(user)}</div>
                                </div>
                              </label>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <Button
                      onClick={() => setShowCompose(false)}
                      variant="outline"
                      className="bg-transparent border-slate-700 text-white hover:bg-slate-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendNewEmail}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Send Email
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 