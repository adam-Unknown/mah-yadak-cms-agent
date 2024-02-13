"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

interface LimiterProps extends React.HTMLAttributes<HTMLDivElement> {
  items: number[];
}

export const Limiter: React.FC<LimiterProps> = ({ items, ...htmlAtt }) => {
  const limit = useSearchParams().get("limit") ?? items[0];
  return (
    <div className="flex flex-row" {...htmlAtt}>
      <Label className="inline my-auto">تعداد نمایش:</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="inline my-auto">
          <Button variant="link">{limit}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {items.map((item, index) => (
            <React.Fragment key={item}>
              {index !== 0 && <DropdownMenuSeparator />}
              <Link
                href={{
                  pathname: "/warehouse",
                  query: {
                    limit: item,
                  },
                }}
              >
                <DropdownMenuItem>{item}</DropdownMenuItem>
              </Link>
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Limiter;
