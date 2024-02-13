"use server";

import { z } from "zod";
import { MongoClient, Collection, ObjectId } from "mongodb";
import { SuggestionSchema } from "./definition";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OrdersInProcessInTable } from "@/app/column-def";

export const getMongoDbCrudExecutor =
  <T = any, U = void>(
    collection: string,
    crud: (collection: Collection, args: U) => Promise<T>
  ) =>
  async (args: U): Promise<T> => {
    const client = new MongoClient(process.env.MONGODB_URL ?? "");
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      return await crud(client.db("mah_yadak").collection(collection), args);
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
    return await crud(client.db("mah_yadak").collection(collection), args);
  };

export const fetchSuggestions = getMongoDbCrudExecutor(
  "suggestions",
  async (Suggessions) =>
    Suggessions.aggregate([
      {
        $lookup: {
          from: "parts",
          let: {
            suggestion_part_ids: "$partIds",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [
                    "$_id",
                    {
                      $map: {
                        input: "$$suggestion_part_ids",
                        as: "partId",
                        in: {
                          $toObjectId: "$$partId",
                        },
                      },
                    },
                  ],
                },
              },
            },
            {
              $project: {
                id: { $toString: "$_id" },
                imageUrl: { $arrayElemAt: ["$imageUrls", 0] },
                category: 1,
                model: 1,
                brand: 1,
                "sale.salesPrice": 1,
                usedFor: 1,
                suitableFor: 1,
              },
            },
          ],
          as: "parts",
        },
      },
    ])
      .toArray()
      .then((r) => SuggestionSchema.parse(r))
);

export const fetchOrderable = getMongoDbCrudExecutor<
  boolean,
  { belongsTo: string }
>("carts", async (carts, { belongsTo }) =>
  carts
    .aggregate([
      {
        $match: {
          belongsTo: belongsTo,
        },
      },
      {
        $unwind: { path: "$items" },
      },
      {
        $lookup: {
          from: "parts",
          let: {
            item: {
              partId: {
                $toObjectId: "$items.partId",
              },
              qty: "$items.quantity",
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$item.partId"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                salable: { $gte: ["$warehouse.stock", "$$item.qty"] },
              },
            },
          ],
          as: "status",
        },
      },
      {
        $project: {
          status: 1,
        },
      },
      {
        $unwind: { path: "$status" },
      },
    ])
    .toArray()
    .then((res) => {
      return res.every((r) => r.status.salable);
    })
);

export const fetchPartFormInitData = getMongoDbCrudExecutor("parts", (parts) =>
  parts
    .aggregate([
      {
        $unwind: {
          path: "$category",
        },
      },
      {
        $unwind: {
          path: "$usedFor",
        },
      },
      {
        $group: {
          _id: "a",
          categories: {
            $push: "$category",
          },
          usedForItems: {
            $push: "$usedFor",
          },
        },
      },
      {
        $project: {
          categories: {
            $setUnion: ["$categories"],
          },
          usedForItems: {
            $setUnion: ["$usedForItems"],
          },
        },
      },
    ])
    .next()
    .then((res) => res as { categories: string[]; usedForItems: string[] })
);

// export const fetchOrdersHistories;

// export const fetchActiveOrders = getMongoDbCrudExecutor<
//   z.infer<typeof OrdersReadSchema>,
//   { belongsTo: string }
// >("orders", async (orders, { belongsTo }) =>
//   orders
//     .aggregate([
//       {
//         $sort: { createdAt: -1 },
//       },
//     ])
//     .toArray()
//     .then((orders) =>
//       OrdersReadSchema.parse(
//         orders.map((order) => ({ ...order, id: order._id.toString() }))
//       )
//     )
// );

export const fetchOrdersInProcess = getMongoDbCrudExecutor<
  OrdersInProcessInTable[]
>("orders", async (orders) =>
  orders
    .aggregate([
      {
        $match: {
          status: { $in: ["در انتظار تایید", "تایید شده و در حال ارسال"] },
        },
      },
      {
        $addFields: {
          id: { $toString: "$_id" },
        },
      },
    ])
    .toArray()
    .then((r) => r as OrdersInProcessInTable[])
);

export async function cancelOrder(id: string, redirectTo: string) {
  const _cancelOrder = getMongoDbCrudExecutor<boolean, string>(
    "orders",
    async (orders, id) =>
      orders
        .updateOne(
          { _id: new ObjectId(id) },
          { $set: { status: "لغو شده توسط ادمین", canceledAt: new Date() } }
        )
        .then((r) => r.modifiedCount > 0)
  );

  if (await _cancelOrder(id)) {
    revalidatePath(redirectTo);
    redirect(redirectTo);
  }

  return {
    msg: "خطا در لغو سفارش",
  };
}
