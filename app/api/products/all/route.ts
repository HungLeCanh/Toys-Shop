import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { priority: "asc" }, // Ưu tiên cao trước
    });
    return NextResponse.json(products);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", err);
    return NextResponse.json({ error: "Lỗi khi lấy danh sách sản phẩm " }, { status: 500 });
  }
}
