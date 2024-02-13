"use client";

import Limiter from "@/components/limiter";
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
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteAccount } from "./actions";

export type AccountInTable = {
  id: string;
  fullname: string;
  phone: string;
  profession: string;
  address: string;
};

export const AccountsTableColDef: ColumnDef<AccountInTable>[] = [
  {
    accessorKey: "phone",
    header: "شماره همراه",
  },
  {
    accessorKey: "fullname",
    header: "نام و نام خانوادگی",
  },
  {
    accessorKey: "profession",
    header: "نوع خدمات تعمیرگاهی",
  },
  {
    accessorKey: "address",
    header: "آدرس",
  },
  {
    id: "actions",
    header: (() => {
      const pathname = usePathname();
      const params = useSearchParams();
      const [query, setQuery] = useState(params.get("query") || "");

      useEffect(() => {
        setQuery(params.get("query") || "");
      }, [params]);

      const handleChange = (e: any) => {
        setQuery(e.target.value);
      };

      return (
        <div className="grid grid-cols-3 min-w-[280px]">
          <Limiter items={[5, 10, 20, 50, 100]} className="mr-2" />
          <Link
            id="search-link"
            href={`${pathname}?query=${query}`}
            className="hidden"
          />
          <Input
            id="search"
            className="w-max-[160px] col-span-2 my-auto"
            defaultValue={query}
            placeholder="جستجو"
            autoComplete="off"
            onChange={handleChange}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              document.getElementById("search-link")?.click()
            }
          />
        </div>
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
            کپی کردن شناسه حساب
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <Link href={`/accounts/${row.original.phone}`}>
            <DropdownMenuItem>مشاهده جزئیات</DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={(e) => e.preventDefault()}>
            <AlertDialog>
              <AlertDialogTrigger className="text-sm text-red-500 text-start w-[100%]">
                حذف حساب
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-start">
                    آیا از حذف حساب با شماره {row.original.phone} مطمئن هستید؟
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-start">
                    در صورت حذف حساب، امکان بازگشت آن وجود ندارد.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="mx-2">انصراف</AlertDialogCancel>
                  <AlertDialogAction
                    className="mx-2 bg-red-500 hover:bg-red-600"
                    onClick={async () => {
                      const res = await deleteAccount(row.original.phone);
                      if (res) alert(res.msg);
                    }}
                  >
                    حذف حساب
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
