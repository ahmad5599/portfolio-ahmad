"use client";

import { deleteContact, toggleReadStatus } from "@/app/actions/contact";
import { CheckCircle, ChevronLeft, ChevronRight, Mail, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Contact = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  replied: boolean;
  createdAt: string;
};

type Props = {
  initialContacts: Contact[];
  totalPages: number;
  currentPage: number;
};

export default function ContactsClient({ initialContacts, totalPages, currentPage }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    
    startTransition(async () => {
      const result = await deleteContact(id);
      if (!result.success) {
        alert("Failed to delete contact");
      } else {
        router.refresh();
      }
    });
  };

  const handleToggleRead = async (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const result = await toggleReadStatus(id, currentStatus);
      if (!result.success) {
        alert("Failed to update status");
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Message</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {initialContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No messages yet.
                  </td>
                </tr>
              ) : (
                initialContacts.map((contact) => (
                  <tr key={contact.id} className={`hover:bg-muted/50 ${!contact.read ? "bg-blue-50/50 dark:bg-blue-950/10" : ""}`}>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleRead(contact.id, contact.read)}
                        disabled={isPending}
                        title={contact.read ? "Mark as unread" : "Mark as read"}
                      >
                        {contact.read ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <div className="h-3 w-3 rounded-full bg-blue-500" />
                        )}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">
                      {contact.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                      <a href={`mailto:${contact.email}`} className="hover:underline flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground max-w-xs">
                      <div className={expandedId === contact.id ? "" : "line-clamp-2"}>
                        {contact.message}
                      </div>
                      {contact.message.length > 100 && (
                        <button 
                          onClick={() => setExpandedId(expandedId === contact.id ? null : contact.id)}
                          className="text-xs text-blue-500 hover:underline mt-1"
                        >
                          {expandedId === contact.id ? "Show less" : "Show more"}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`mailto:${contact.email}?subject=Re: Contact from Portfolio`}
                          className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                          title="Reply via Email"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(contact.id)}
                          disabled={isPending}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md text-red-500 transition-colors"
                          title="Delete Message"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Link
            href={`/admin/contacts?page=${currentPage - 1}`}
            className={`rounded-md border p-2 ${
              currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-muted/50"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Link
            href={`/admin/contacts?page=${currentPage + 1}`}
            className={`rounded-md border p-2 ${
              currentPage >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-muted/50"
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
