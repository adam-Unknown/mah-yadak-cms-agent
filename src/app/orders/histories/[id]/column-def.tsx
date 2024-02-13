"use client";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

export const orderDetailsTableLimitShowItems = [5, 10, 20, 50, 100];

export type PartOrderedDetailsInTable = {
  id: string;
  imageUrl: string;
  name: string;
  quantity: number;
  address: string;
  stock: number;
  price: number;
  totalPrice: number;
};

export const PartOrderedDetailsColumnDef: ColumnDef<PartOrderedDetailsInTable>[] =
  [
    {
      accessorKey: "imageUrl",
      header: "تصویر",
      cell: ({ row }) => (
        <Image
          alt="x"
          width={68}
          height={68}
          src={row.original.imageUrl}
          className="w-[68px] h-[68px] -m-2"
        />
      ),
    },
    {
      accessorKey: "name",
      header: "نام قطعه",
    },
    {
      accessorKey: "quantity",
      header: () => (
        <div className="flex justify-center w-full">
          <span className="mx-auto">تعداد سفارش</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center w-full">
          <span className="mx-auto">
            {row.original.quantity.toLocaleString("fa-IR")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "address",
      header: "آدرس",
    },
    {
      accessorKey: "stock",
      header: () => (
        <div className="flex justify-center w-full">
          <span className="mx-auto">موجود در انبار</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center w-full">
          <span className="mx-auto">
            {row.original.stock.toLocaleString("fa-IR")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: () => (
        <div className="flex justify-center w-full">
          <span className="mx-auto">قیمت واحد</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center w-full">
          <span className="mx-auto">
            {row.original.price.toLocaleString("fa-IR")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "totalPrice",
      header: () => (
        <div className="flex justify-center w-full">
          <span className="mx-auto">قیمت کل</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center w-full">
          <span className="mx-auto">
            {row.original.totalPrice.toLocaleString("fa-IR")}
          </span>
        </div>
      ),
    },
  ];
