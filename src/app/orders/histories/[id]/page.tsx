"use server";

import DataTable from "@/components/data-table";
import {
  PartOrderedDetailsColumnDef,
  PartOrderedDetailsInTable,
} from "./column-def";
import { getMongoDbCrudExecutor } from "@/lib/data";
import { ObjectId } from "mongodb";
import { Table } from "@/components/ui/table";

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  const fetchPartOrderedDetails = getMongoDbCrudExecutor<{
    belongsTo: string;
    items: PartOrderedDetailsInTable[];
    createdAt: Date;
  }>("orders", async (orders) =>
    orders
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id),
          },
        },
        {
          $unwind: "$items",
        },
        {
          $lookup: {
            from: "parts",
            let: {
              partId: { $toObjectId: "$items.partId" },
              quantity: "$items.quantity",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$partId"],
                  },
                },
              },
              {
                $addFields: {
                  id: { $toString: "$_id" },
                },
              },
              {
                $project: {
                  _id: 0,
                  name: {
                    $reduce: {
                      input: {
                        $concatArrays: [
                          {
                            $split: [
                              {
                                $concat: [
                                  {
                                    $cond: {
                                      if: {
                                        $gt: [{ $size: "$model" }, 0],
                                      },
                                      then: {
                                        $first: "$model",
                                      },
                                      else: "",
                                    },
                                  },
                                  " ",
                                ],
                              },
                              "nonexistentSeparator",
                            ],
                          },
                          {
                            $cond: {
                              if: { $ne: ["$properties", ""] },
                              then: {
                                $split: [
                                  {
                                    $concat: ["$properties", " "],
                                  },
                                  "nonexistentSeparator",
                                ],
                              },
                              else: {
                                $split: ["", "nonexistentSeparator"],
                              },
                            },
                          },
                          {
                            $split: [
                              {
                                $concat: [
                                  {
                                    $cond: {
                                      if: {
                                        $gt: [{ $size: "$usedFor" }, 0],
                                      },
                                      then: {
                                        $first: "$usedFor",
                                      },
                                      else: "",
                                    },
                                  },
                                  " ",
                                ],
                              },
                              "nonexistentSeparator",
                            ],
                          },
                          {
                            $cond: {
                              if: { $ne: ["$brand", ""] },
                              then: {
                                $split: [
                                  { $concat: ["$brand", " "] },
                                  "nonexistentSeparator",
                                ],
                              },
                              else: {
                                $split: ["", "nonexistentSeparator"],
                              },
                            },
                          },
                        ],
                      },
                      initialValue: "",
                      in: { $concat: ["$$value", "$$this"] },
                    },
                  },
                  imageUrl: { $first: "$imageUrls" },
                  stock: "$warehouse.stock",
                  quantity: "$$quantity",
                  price: {
                    $multiply: ["$sale.buyPrice", { $sum: [1, "$sale.vat"] }],
                  },
                  totalPrice: {
                    $multiply: [
                      "$sale.buyPrice",
                      { $sum: [1, "$sale.vat"] },
                      "$$quantity",
                    ],
                  },
                  address: "$warehouse.address",
                },
              },
            ],
            as: "orderedPartDetails",
          },
        },
        {
          $unwind: "$orderedPartDetails",
        },
        {
          $group: {
            _id: "$_id",
            belongsTo: { $first: "$belongsTo" },
            items: {
              $push: "$$ROOT.orderedPartDetails",
            },
            createdAt: { $first: "$createdAt" },
          },
        },
      ])
      .next()
      .then(
        (r) =>
          r as {
            belongsTo: string;
            items: PartOrderedDetailsInTable[];
            createdAt: Date;
          }
      )
  );

  const {
    belongsTo,
    createdAt,
    items: orderedPartDetailsList,
  } = await fetchPartOrderedDetails();

  const fetchAccountDetails = getMongoDbCrudExecutor<{
    fullname: string;
    phone: string;
    profession: string;
    address: string;
  }>("accounts", async (acc) =>
    acc.findOne({ phone: belongsTo }).then(
      (r) =>
        r as unknown as {
          fullname: string;
          phone: string;
          profession: string;
          address: string;
        }
    )
  );

  const accountDetails = await fetchAccountDetails();
  return (
    <div className="my-12">
      <fieldset className="border-2 border-gray-200 p-8 rounded-lg text-sm text-slate-600">
        <legend className="font-bold text-lg">مشخصات سفارش کننده</legend>
        <div className="grid grid-cols-3 gap-4">
          <div>
            نام و نام خانوادگی:{" "}
            <span className="font-bold text-base">
              {accountDetails.fullname}
            </span>
          </div>
          <div>
            شماره همراه:{" "}
            <span className="font-bold text-base">{accountDetails.phone}</span>
          </div>
          <div>
            تاریخ ثبت سفارش:{" "}
            <span className="font-bold text-base">
              {createdAt.toLocaleString("fa-IR")}
            </span>
          </div>
          <div className="col-span-2">
            آدرس:{" "}
            <span className="font-bold text-base">
              {accountDetails.address}
            </span>
          </div>
          <div>
            نوع خدمات تعمیرکار:{" "}
            <span className="font-bold text-base">
              {accountDetails.profession}
            </span>
          </div>
        </div>
      </fieldset>
      <p className="font-bold text-lg m-3">جزئیات سفارش:</p>
      <DataTable
        columns={PartOrderedDetailsColumnDef}
        data={orderedPartDetailsList}
        limitItems={[]}
      />
    </div>
  );
}
