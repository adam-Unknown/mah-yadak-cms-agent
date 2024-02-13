"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { deleteOrder as deleteOrderAction } from "@/lib/action";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export const orderTableLimitShowItems = [5, 10, 20, 50, 100];

export type OrderHeistoriesInTableType = {
  id: string;
  belongsTo: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  cooperatesInvoicePrint: boolean;
  customerInvoicePrint: boolean;
};

export const OrderHistoriesColumnDef: ColumnDef<OrderHeistoriesInTableType>[] =
  [
    {
      accessorKey: "belongsTo",
      header: "متعلق به",
    },
    {
      accessorKey: "status",
      header: "وضعیت",
      cell: ({ row }) => <span>{row.original.status}</span>,
    },
    {
      header: "ایجاد شده در",
      cell: ({ row }) => (
        <span>{row.original.createdAt.toLocaleString("fa-IR")}</span>
      ),
    },
    {
      header: "بروزرسانی شده در",
      cell: ({ row }) => (
        <span>{row.original.updatedAt.toLocaleString("fa-IR")}</span>
      ),
    },
    {
      id: "actions",
      header: (() => {
        const pathname = usePathname();
        const params = useSearchParams();
        const [query, setQuery] = useState(params.get("query") || "");

        const handleChange = (e: any) => {
          setQuery(e.target.value);
        };

        return (
          <>
            <Link
              id="search-link"
              href={`${pathname}?query=${query}`}
              className="hidden"
            />
            <Input
              id="search"
              className="w-full"
              defaultValue={query}
              placeholder="جستجو"
              autoComplete="off"
              onChange={handleChange}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                document.getElementById("search-link")?.click()
              }
            />
          </>
        );
      }) as React.FC,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="link">عملیات</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(row.original.id);
              }}
            >
              کپی کردن شناسه سفارش
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Link href={`/orders/histories/${row.original.id}`}>
              <DropdownMenuItem>مشاهده جزئیات</DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => e.preventDefault()}>
              <AlertDialog>
                <AlertDialogTrigger className="text-sm text-red-500 text-start w-[100%]">
                  حذف سفارش
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-start">
                      آیا از حذف سفارش مطمئن هستید؟
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-start">
                      در صورت حذف سفارش، امکان بازگشت آن وجود ندارد.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="mx-2">
                      انصراف
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="mx-2 bg-red-500 hover:bg-red-600"
                      onClick={async () => {
                        const res = await deleteOrderAction(row.original.id);
                        if (res) alert(res.msg);
                      }}
                    >
                      حذف سفارش
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
