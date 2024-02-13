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
import {
  acceptOrder,
  cancelOrder as cancelOrderAction,
  completeOrder,
  deleteOrder,
} from "@/lib/action";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export const orderTableLimitShowItems = [5, 10, 20, 50, 100];

export type OrdersInProcessInTable = {
  id: string;
  belongsTo: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  cooperatesInvoicePrint: boolean;
  customerInvoicePrint: boolean;
};

export const OrdersInProcessColumnDef: ColumnDef<OrdersInProcessInTable>[] = [
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
    id: "invoicePrint",
    header: () => <div className="flex justify-center ml-10">چاپ فاکتور</div>,
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <Checkbox
          id="c2"
          disabled
          checked={row.original.cooperatesInvoicePrint}
        />
        <label
          htmlFor="c2"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          سفارش کننده
        </label>
        <Checkbox
          id="c1"
          disabled
          checked={row.original.customerInvoicePrint}
        />
        <label
          htmlFor="c1"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          مشتری
        </label>
      </div>
    ),
  },
  {
    id: "actions",
    header: (() => {
      const [seconds, setSeconds] = useState(45);
      const router = useRouter();

      useEffect(() => {
        if (seconds > 0) {
          setTimeout(() => setSeconds(seconds - 1), 1000);
        } else {
          router.refresh();
          setSeconds(45);
        }
      }, [seconds]);

      return (
        <div className="text-gray-400">
          {seconds.toLocaleString("fa-IR")} ثانیه مانده به تازه سازی
        </div>
      );
    }) as React.FC,
    cell: ((info: any) => {
      const pathname = usePathname();
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="link">عملیات دیگر</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {info.row.original.status === "در انتظار تایید" && (
              <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                <AlertDialog>
                  <AlertDialogTrigger className="text-sm text-green-500 text-start w-[100%]">
                    پذیرفتن سفارش
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-start">
                        بریم!
                      </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="mx-2">
                        انصراف
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="mx-2 bg-green-500 hover:bg-green-600"
                        onClick={async () => {
                          toast("در حال انجام عملیات...");
                          const res = await acceptOrder(info.row.original.id);
                          if (res) toast(res.msg);
                          else {
                            toast("با موفقیت انجام شد.");
                          }
                        }}
                      >
                        پذیرفتن سفارش
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuItem>
            )}
            {info.row.original.status === "تایید شده و در حال ارسال" && (
              <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                <AlertDialog>
                  <AlertDialogTrigger className="text-sm text-green-500 text-start w-[100%]">
                    تایید تکمیل سفارش
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-start">
                        «وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِنْ شَكَرْتُمْ
                        لَأَزِيدَنَّكُمْ ۖ وَلَئِنْ كَفَرْتُمْ إِنَّ عَذَابِي
                        لَشَدِيدٌ»
                      </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="mx-2">
                        انصراف
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="mx-2 bg-green-500 hover:bg-green-600"
                        onClick={async () => {
                          toast("در حال انجام عملیات...");
                          const msg = await completeOrder(info.row.original.id);
                          if (msg) toast(msg);
                          else {
                            toast("با موفقیت انجام شد.");
                          }
                        }}
                      >
                        تایید
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(info.row.original.id);
              }}
            >
              کپی کردن شناسه سفارش
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Link href={`/orders/${info.row.original.id}`}>
              <DropdownMenuItem>مشاهده جزئیات</DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => e.preventDefault()}>
              <AlertDialog>
                <AlertDialogTrigger className="text-sm text-red-500 text-start w-[100%]">
                  رد سفارش
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-start">
                      آیا از رد سفارش مطمئن هستید؟
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-start">
                      در صورت رد سفارش، امکان بازگشت آن وجود ندارد.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="mx-2">
                      انصراف
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="mx-2 bg-red-500 hover:bg-red-600"
                      onClick={async () => {
                        toast("در حال انجام عملیات...");
                        const res = await cancelOrderAction(
                          info.row.original.id,
                          pathname
                        );
                        if (res) toast(res.msg);
                        else {
                          toast("با موفقیت انجام شد.");
                        }
                      }}
                    >
                      رد سفارش
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuItem>
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
                        toast("در حال انجام عملیات...");
                        const res = await deleteOrder(info.row.original.id);
                        if (res) toast(res.msg);
                        else {
                          toast("با موفقیت انجام شد.");
                        }
                      }}
                    >
                      رد سفارش
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }) as React.FC,
  },
];
