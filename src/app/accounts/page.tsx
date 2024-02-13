"use server";

import DataTable from "@/components/data-table";
import { AccountInTable, AccountsTableColDef } from "./col-def";
import { z } from "zod";
import { getMongoDbCrudExecutor } from "@/lib/data";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { unstable_noStore } from "next/cache";

const searchParamsSchema = z.object({
  limit: z.coerce.number(),
  page: z.coerce.number().min(1),
});

export default async function Page({
  searchParams,
}: {
  searchParams: {
    limit?: string;
    page?: string;
    query?: string;
  };
}) {
  unstable_noStore();

  const query = searchParams.query;

  const limitResult = searchParamsSchema
    .pick({ limit: true })
    .safeParse(searchParams);
  const { limit } = limitResult.success ? limitResult.data : { limit: 10 };

  const pageResult = searchParamsSchema
    .pick({ page: true })
    .safeParse(searchParams);

  const { page } = pageResult.success ? pageResult.data : { page: 1 };

  const search = !!query
    ? {
        $search: {
          index: "default",
          compound: {
            should: [
              { text: { query: query, path: "phone" } },
              { text: { query: query, path: "profession" } },
              { autocomplete: { query: query, path: "fullname" } },
              { autocomplete: { query: query, path: "address" } },
            ],
          },
        },
      }
    : {
        $sort: {
          createdAt: -1,
        },
      };

  const { accounts, count } = await getMongoDbCrudExecutor(
    "accounts",
    async (accounts) =>
      accounts
        .aggregate([
          search,
          {
            $skip: limit * (page - 1),
          },
          {
            $limit: limit,
          },
          {
            $project: {
              _id: 0,
              id: "$_id",
              phone: 1,
              fullname: 1,
              profession: 1,
              address: 1,
            },
          },
          {
            $group: {
              _id: null,
              count: {
                $sum: 1,
              },
              accounts: {
                $push: "$$ROOT",
              },
            },
          },
        ])
        .next()
        .then(
          (r) =>
            (r || { accounts: [], count: 0 }) as {
              accounts: AccountInTable[];
              count: number;
            }
        )
  )();

  const totalPages = Math.ceil(count / limit);

  return (
    <div className="py-12">
      <DataTable
        columns={AccountsTableColDef}
        data={accounts}
        limitItems={[]}
      />
      <Pagination dir="ltr" className="m-3">
        <PaginationContent>
          {page > 1 && (
            <PaginationItem>
              <PaginationPrevious
                href={`/orders/histories?page=${page - 1}&limit=${limit}`}
              />
            </PaginationItem>
          )}
          {page > 2 && (
            <PaginationItem>
              <PaginationLink href={`/orders/histories?page=1&limit=${limit}`}>
                1
              </PaginationLink>
            </PaginationItem>
          )}
          {page > 3 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          {page !== 1 && (
            <PaginationItem>
              <PaginationLink
                href={`/orders/histories?page=${page - 1}&limit=${limit}`}
              >
                {page - 1}
              </PaginationLink>
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationLink href="#" isActive={true}>
              {page}
            </PaginationLink>
          </PaginationItem>
          {page !== totalPages && (
            <PaginationItem>
              <PaginationLink
                href={`/orders/histories?page=${page + 1}&limit=${limit}`}
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          )}
          {page < totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          {page <= totalPages - 2 && (
            <PaginationItem>
              <PaginationLink
                href={`/orders/histories?page=${totalPages}&limit=${limit}`}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          )}
          {page < totalPages && (
            <PaginationItem>
              <PaginationNext
                href={`/orders/histories?page=${page + 1}&limit=${limit}`}
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}
