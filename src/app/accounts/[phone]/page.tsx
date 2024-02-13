import { getMongoDbCrudExecutor } from "@/lib/data";

export default async function Page({
  params: { phone },
}: {
  params: { phone: string };
}) {
  const accDetails = await getMongoDbCrudExecutor(
    "accounts",
    async (accounts) => accounts.findOne({ phone: phone })
  )();

  return (
    <fieldset className="w-[95%] mx-6 my-12 md:w-max[760px] border border-gray-300 rounded-md p-4 ">
      <legend className="font-bold">اطلاعات حساب</legend>
      <div className="grid grid-cols-2 text-gray-600">
        <p>
          نام و نام خانوادگی:{" "}
          <span className="font-bold">{accDetails?.fullname}</span>
        </p>
        <p>
          شماره همراه: <span className="font-bold">{accDetails?.phone}</span>
        </p>
        <p>
          نوع خدمات تعمیرگاه:{" "}
          <span className="font-bold">{accDetails?.profession}</span>
        </p>
        <p>
          تاریخ ساخت حساب:{" "}
          <span className="font-bold">
            {new Date(accDetails?.createdAt).toLocaleString("fa-IR")}
          </span>
        </p>
        <p className="col-span-2">
          آدرس: <span className="font-bold">{accDetails?.address}</span>
        </p>
      </div>
    </fieldset>
  );
}
