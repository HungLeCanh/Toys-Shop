import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Thêm sản phẩm
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const product = await prisma.product.create({ data: body });
    return NextResponse.json(product);
  } catch (err) {
    console.error("Lỗi khi thêm sản phẩm:", err);
    return NextResponse.json({ error: "Lỗi khi thêm sản phẩm" }, { status: 500 });
  }
}

// Cập nhật sản phẩm
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(product);
  } catch (err) {
    console.error("Lỗi khi cập nhật sản phẩm:", err);
    return NextResponse.json({ error: "Lỗi khi cập nhật sản phẩm" }, { status: 500 });
  }
}

// Xoá sản phẩm
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));

  if (!id) return NextResponse.json({ error: "Thiếu ID sản phẩm" }, { status: 400 });

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Xoá thành công" });
  } catch (err) {
    console.error("Lỗi khi xoá sản phẩm:", err);
    return NextResponse.json({ error: "Lỗi khi xoá sản phẩm" }, { status: 500 });
  }
}

// Lấy sản phẩm theo ID
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));

  if (!id) return NextResponse.json({ error: "Thiếu ID sản phẩm" }, { status: 400 });

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    console.error("Lỗi khi lấy sản phẩm:", err);
    return NextResponse.json({ error: "Lỗi khi lấy sản phẩm" }, { status: 500 });
  }
}
