import PermitNotice from "./PermitNotice";

export const metadata = {
  title: "Permit Notice | Ajeer HR Solutions",
  description: "Official printable Ajeer HR Solutions work permit notice with QR verification.",
};

type Props = { params: Promise<{ id: string }> };

export default async function NoticePage({ params }: Props) {
  const { id } = await params;
  return <PermitNotice id={decodeURIComponent(id)} />;
}
