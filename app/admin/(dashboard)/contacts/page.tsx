import { PAGINATION_LIMITS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const limit = PAGINATION_LIMITS.CONTACTS;
  const skip = (currentPage - 1) * limit;

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.contact.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Contacts</h1>
        <p className="text-muted-foreground">View messages from the contact form.</p>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No messages yet.
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-muted/50">
                    <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">
                      {contact.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                      <a href={`mailto:${contact.email}`} className="hover:underline">
                        {contact.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="line-clamp-2 max-w-md">{contact.message}</div>
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
