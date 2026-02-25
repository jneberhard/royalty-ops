import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import EnterpriseDashboardLayout from "@/components/layouts/enterprise-dashboard-layout";

async function createArtist(formData: FormData) {
  "use server";

  const name = formData.get("name") as string;

  if (!name) throw new Error("Artist name is required");

  const artist = await prisma.artist.create({
    data: {
      name,
    },
  });

  redirect(`/artists/${artist.id}`);
}

export default function CreateArtistPage() {
  return (
    <EnterpriseDashboardLayout>
      <div className="max-w-xl mx-auto space-y-8 text-black">

        <h1 className="text-3xl font-bold text-white">Create Artist</h1>

        <form
          action={createArtist}
          className="bg-white p-8 rounded-xl shadow space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Artist Name
            </label>
            <input
              name="name"
              required
              className="mt-1 w-full border px-3 py-2 rounded-lg"
              placeholder="e.g. Taylor Swift"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700"
          >
            Create Artist
          </button>
        </form>
      </div>
    </EnterpriseDashboardLayout>
  );
}
