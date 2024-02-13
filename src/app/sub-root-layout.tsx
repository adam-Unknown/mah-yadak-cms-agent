"use client";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { DirectionProvider } from "@radix-ui/react-direction";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SubRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  return (
    <DirectionProvider dir="rtl">
      <div className="my-2 flex justify-center">
        <NavigationMenu className="z-50 ">
          <NavigationMenuList className="relative ">
            <NavigationMenuItem className="mx-2" dir="ltr">
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink
                  className={`${navigationMenuTriggerStyle()} ${
                    pathname === "/" && "bg-gray-100"
                  }`}
                >
                  داشبورد
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Popover>
                <PopoverTrigger
                  className={`${
                    pathname.includes("accounts") && "bg-gray-100"
                  } font-bold ${cn(navigationMenuTriggerStyle())} group `}
                >
                  {" "}
                  <ChevronDown
                    className="top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
                    aria-hidden="true"
                  />
                  مدیریت حساب ها
                </PopoverTrigger>
                <PopoverContent className="flex flex-col w-auto">
                  <Link href="/accounts" legacyBehavior passHref>
                    <a className={navigationMenuTriggerStyle()}>حساب ها</a>
                  </Link>
                  <Link href="/accounts/add" legacyBehavior passHref>
                    <a className={navigationMenuTriggerStyle()}>
                      افزودن حساب جدید
                    </a>
                  </Link>
                </PopoverContent>
              </Popover>
            </NavigationMenuItem>
            <NavigationMenuItem className="mx-2" dir="ltr">
              <Link href="/orders" legacyBehavior passHref>
                <NavigationMenuLink
                  className={`${navigationMenuTriggerStyle()} ${
                    pathname === "/orders" && "bg-gray-100"
                  }`}
                >
                  تاریخچه سفارشات
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Button
                onClick={async () => {
                  const res = await fetch("/api/logout", { method: "post" });
                  if (res.status === 200) window.location.reload();
                  else alert(await res.json());
                }}
              >
                خروج
              </Button>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <Separator />
      {children}
      <Toaster />
    </DirectionProvider>
  );
}
