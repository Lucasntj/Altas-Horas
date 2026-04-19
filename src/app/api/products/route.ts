import { NextResponse } from "next/server";
import {
  listProducts,
  updateProductAvailability,
  updateProductData,
} from "@/lib/products-store";
import type { Product } from "@/data/products";

interface UpdateAvailabilityPayload {
  productId: string;
  isAvailable: boolean;
}

interface UpdateProductPayload {
  productId: string;
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  category?: Product["category"];
}

const validCategories: Product["category"][] = [
  "lanches",
  "acompanhamentos",
  "bebidas",
];

export async function GET() {
  const products = await listProducts();
  return NextResponse.json({ success: true, products });
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as UpdateAvailabilityPayload;

    if (!body?.productId || typeof body?.isAvailable !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Dados invalidos para produto." },
        { status: 400 },
      );
    }

    const product = await updateProductAvailability(
      body.productId,
      body.isAvailable,
    );

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Produto nao encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      product,
      message: "Disponibilidade atualizada com sucesso.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Erro interno ao atualizar produto." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as UpdateProductPayload;

    if (!body?.productId) {
      return NextResponse.json(
        { success: false, message: "ID do produto obrigatório." },
        { status: 400 },
      );
    }

    const updates: Partial<
      Omit<Product, "id" | "isFeatured" | "isPopular" | "isAvailable">
    > = {};

    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.description !== undefined)
      updates.description = String(body.description).trim();
    if (body.price !== undefined) updates.price = Number(body.price);
    if (body.image !== undefined) updates.image = String(body.image).trim();
    if (
      body.category !== undefined &&
      validCategories.includes(body.category)
    ) {
      updates.category = body.category;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "Nenhum campo para atualizar." },
        { status: 400 },
      );
    }

    const product = await updateProductData(body.productId, updates);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Produto nao encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      product,
      message: "Produto atualizado com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno ao atualizar produto." },
      { status: 500 },
    );
  }
}
