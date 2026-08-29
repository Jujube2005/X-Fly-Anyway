/** /ticket/[ref] — E-Ticket view page */
export default async function ETicketPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  return <div>E-Ticket: {ref} — TODO</div>;
}
