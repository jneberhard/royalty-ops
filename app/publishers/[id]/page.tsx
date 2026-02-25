import ComingSoon from "@/components/ComingSoon";

export default function PublisherDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <ComingSoon />
      <p className="text-center text-gray-500 mt-4">
        Publisher ID: {params.id}
      </p>
    </div>
  );
}
