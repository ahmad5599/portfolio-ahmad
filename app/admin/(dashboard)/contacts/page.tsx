import { PAGINATION_LIMITS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import ContactsClient from "./contacts-client";

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

  const formattedContacts = contacts.map((contact) => ({
    ...contact,
    createdAt: contact.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Contacts</h1>
        <p className="text-muted-foreground">View messages from the contact form.</p>
      </div>

      <ContactsClient 
        initialContacts={formattedContacts}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </div>
  );
}
