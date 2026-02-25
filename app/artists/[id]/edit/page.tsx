import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import EnterpriseDashboardLayout from "@/components/layouts/enterprise-dashboard-layout";

type EditArtistPageProps = {
  params: { id: string };
};

export default async function EditArtistPage({ params }: EditArtistPageProps) {
  const artist = await prisma.artist.findUnique({
    where: { id: params.id },
  });

  if (!artist) notFound();

  async function updateArtist(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;

    await prisma.artist.update({
      where: { id: params.id },
      data: { name },
    });

    redirect(`/artists/${params.id}`);
  }

  return (
    <EnterpriseDashboardLayout>
      <div className="max-w-xl mx-auto space-y-8 text-black">

        <div>
          <h1 className="text-3xl font-bold text-white">Edit Artist</h1>
          <p className="text-gray-300">Update artist information</p>
        </div>

        <form
          action={updateArtist}
          className="bg-white p-6 rounded-xl shadow space-y-6"
        >
          <div>
            <label className="block text-sm font-medium mb-2">
              Artist Name
            </label>
            <input
              name="name"
              defaultValue={artist.name}
              required
              className="w-full border rounded-lg p-2"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Save Changes
          </button>
        </form>
      </div>
    </EnterpriseDashboardLayout>
  );
}
