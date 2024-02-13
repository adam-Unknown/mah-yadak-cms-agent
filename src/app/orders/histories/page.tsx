"use server";
import { getMongoDbCrudExecutor } from "@/lib/data";
import { z } from "zod";
import DataTable from "@/components/data-table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  OrderHeistoriesInTableType,
  OrderHistoriesColumnDef,
} from "./column-def";

const limitItems = [5, 10, 20, 50, 100];

const searchParamsSchema = z.object({
  limit: z.coerce.number().refine((val) => limitItems.includes(val)),
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
              { autocomplete: { query: query, path: "belongsTo" } },
              { autocomplete: { query: query, path: "status" } },
            ],
          },
        },
      }
    : {
        $sort: {
          "warehouse.updatedAt": -1,
        },
      };
  const fetchOrderHistories = getMongoDbCrudExecutor<any, { query?: string }>(
    "orders",
    async (orders, query) =>
      orders
        .aggregate([
          search,
          {
            $match: {
              status: { $nin: ["در انتظار تایید", "تایید شده و در حال ارسال"] },
            },
          },
          {
            $sort: { updatedAt: -1 },
          },
          {
            $addFields: {
              id: { $toString: "$_id" },
            },
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              data: { $push: "$$ROOT" },
            },
          },
          {
            $unwind: "$data",
          },
          {
            $skip: (page - 1) * limit,
          },
          {
            $limit: limit,
          },
        ])
        .toArray()
        .then((r) => r.map((elem) => ({ count: elem.count, ...elem.data })))
  );

  const orderHistories = await fetchOrderHistories({ query });
  const totalPages = Math.ceil(orderHistories[0]?.count / limit);

  return (
    <div>
      <h2 className="font-bold m-3">تاریخچه سفارشات</h2>
      <DataTable
        columns={OrderHistoriesColumnDef}
        data={orderHistories}
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
