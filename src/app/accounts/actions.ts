"use server";
import { getMongoDbCrudExecutor } from "@/lib/data";
import { UserSchema } from "@/lib/definition";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// server action to add account to system
export async function addAccount(acc: z.infer<typeof UserSchema>) {
  "use server";
  //  check the fields is valid
  const validatedFields = UserSchema.safeParse(acc);
  if (!validatedFields.success) return { msg: "فیلد های غیر معتبر." };
  const { fullname, phone, address, profession } = validatedFields.data;

  //  check the phone is registered in system
  const isPhoneRegistered = await getMongoDbCrudExecutor<boolean>(
    "accounts",
    async (accounts) => accounts.findOne({ phone: phone }).then((res) => !!res)
  )();

  if (isPhoneRegistered) return { msg: "شماره تلفن قبلا ثبت شده است." };

  // add account to system
  if (
    !(
      await getMongoDbCrudExecutor("accounts", async (accounts) =>
        accounts.insertOne({
          fullname,
          phone,
          address,
          profession,
          createdAt: new Date(),
        })
      )()
    ).insertedId
  )
    return { msg: "خطا در ثبت اطلاعات." };

  const smsBody = JSON.stringify({
    to: phone,
    text: `سلام آقای ${fullname}, حساب جدیدی با شماره ${phone} در سیستم ماه یدک ساخته شد و شما قادر به ورود به سایت و از خدمات ماه یدک بهره ببرید.`,
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

  return { msg: "ثبت نام با موفقیت انجام شد." };
}

export async function deleteAccount(phone: string) {
  //  check the phone is registered in system
  const isPhoneRegistered = await getMongoDbCrudExecutor<boolean>(
    "accounts",
    async (accounts) => accounts.findOne({ phone: phone }).then((res) => !!res)
  )();

  if (!isPhoneRegistered) return { msg: "شماره تلفن در سیستم ثبت نشده است." };

  // delete account from system
  if (
    !(
      await getMongoDbCrudExecutor("accounts", async (accounts) =>
        accounts.deleteOne({ phone: phone })
      )()
    ).deletedCount
  )
    return { msg: "خطا در حذف حساب." };

  revalidatePath("/accounts");
  redirect("/accounts");
}
