import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = await req.json();

  await prisma.product.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  const product = await prisma.product.create({
    data,
  });

  return NextResponse.json({ id: product.id });
}


export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.product.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}

