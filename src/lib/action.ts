"use server";
import { agentSession, sessionOptions } from "@/session.config";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getMongoDbCrudExecutor } from "./data";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "./definition";

export async function login(password: string) {
  if (password !== process.env.LOGGIN_PASSWORD!) return false;

  const session = await getIronSession<agentSession>(cookies(), sessionOptions);

  session.verified = true;

  await session.save();

  redirect("/");
}

export async function deleteOrder(id: string) {
  const _deleteOrder = getMongoDbCrudExecutor<boolean, string>(
    "orders",
    async (orders, id) =>
      orders
        .deleteOne({ _id: new ObjectId(id) })
        .then((r) => r.deletedCount > 0)
  );

  if (await _deleteOrder(id)) {
    revalidatePath("/orders/histories");
    redirect("/orders/histories");
  }

  return {
    msg: "خطا در حذف سفارش",
  };
}

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

  const phone = await getMongoDbCrudExecutor<string, string>(
    "orders",
    async (orders, id) =>
      orders
        .findOne(
          { _id: new ObjectId(id) },
          { projection: { _id: 0, belongsTo: 1 } }
        )
        .then((r) => r?.phone as string)
  )(id);

  if (await _cancelOrder(id)) {
    const smsBody = JSON.stringify({
      to: phone,
      text: `سفارش شما لغو بنابر دلایلی توسط ادمین رد شد. لطفا با پشتیبانی تماس بگیرید و یا سفارش جدیدی ثبت کنید. با تشکر از همراهی شما با ماه یدک.`,
    });

    await fetch(
      "https://console.melipayamak.com/api/send/simple/723526f21e484e6591bd4c2dd3dcf95c",
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: smsBody,
      }
    );
    revalidatePath(redirectTo);
    redirect(redirectTo);
  }

  return {
    msg: "خطا در لغو سفارش",
  };
}

export async function acceptOrder(id: string) {
  const _acceptOrder = getMongoDbCrudExecutor<boolean, string>(
    "orders",
    async (orders, id) =>
      orders
        .updateOne(
          { _id: new ObjectId(id) },
          {
            $set: { status: "تایید شده و در حال ارسال", updatedAt: new Date() },
          }
        )
        .then((r) => r.modifiedCount > 0)
  );

  const phone = await getMongoDbCrudExecutor<string, string>(
    "orders",
    async (orders, id) =>
      orders
        .findOne(
          { _id: new ObjectId(id) },
          { projection: { _id: 0, belongsTo: 1 } }
        )
        .then((r) => r?.phone as string)
  )(id);

  if (await _acceptOrder(id)) {
    const smsBody = JSON.stringify({
      to: phone,
      text: `سفارش شما تایید شد و در حال ارسال است.`,
    });

    await fetch(
      "https://console.melipayamak.com/api/send/simple/723526f21e484e6591bd4c2dd3dcf95c",
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: smsBody,
      }
    );
    revalidatePath("/");
    redirect("/");
  }

  return {
    msg: "خطا در تکمیل سفارش",
  };
}

export async function completeOrder(id: string) {
  const _completeOrder = getMongoDbCrudExecutor<any, string>(
    "orders",
    async (orders, id) =>
      orders
        .updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              status: OrderStatus.Values["تکمیل شده"],
              updatedAt: new Date(),
            },
          }
        )
        .then(async (r) => {
          if (r.modifiedCount < 1)
            return {
              msg: "خطا در تکمیل سفارش",
            };

          const items = await getMongoDbCrudExecutor("orders", async (orders) =>
            orders
              .findOne(
                { _id: new ObjectId(id) },
                { projection: { _id: 0, items: 1 } }
              )
              .then((r) => r?.items as { partId: string; quantity: number }[])
          )();

          if (!items)
            return {
              msg: "خطا در بروزرسانی موجودی انبار",
            };

          const _updateStock = await getMongoDbCrudExecutor<
            boolean,
            { partId: string; quantity: number }[]
          >("parts", async (parts, items) =>
            parts
              .bulkWrite(
                items.map((item) => ({
                  updateOne: {
                    filter: { _id: new ObjectId(item.partId) },
                    update: {
                      $inc: { "warehouse.stock": -item.quantity },
                    },
                  },
                }))
              )
              .then((r) => r.modifiedCount === items.length)
          )(items);

          if (!_updateStock)
            return {
              msg: "خطا در بروزرسانی موجودی انبار",
            };

          revalidatePath("/");
          redirect("/");
        })
  );

  return await _completeOrder(id);
}
