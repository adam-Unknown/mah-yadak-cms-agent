import { getMongoDbCrudExecutor } from "@/lib/data";
import { OrdersInProcessColumnDef, OrdersInProcessInTable } from "./column-def";
import DataTable from "@/components/data-table";
import { NotfiyUpdateEventWithSound } from "@/components/notfiy-update-event";

export default async function Page() {
  const fetchOrdersInProcess = getMongoDbCrudExecutor<OrdersInProcessInTable[]>(
    "orders",
    async (orders) =>
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

  const orders = await fetchOrdersInProcess();

  return (
    <div className="my-6 p-3">
      <h2 className="font-bold m-2">سفارشات در حال پردازش</h2>
      <DataTable
        columns={OrdersInProcessColumnDef}
        data={orders}
        limitItems={[]}
      />
      <NotfiyUpdateEventWithSound
        d1={orders.map((order) => ({ status: order.status }))}
        d2={orders.length}
      />
    </div>
  );
}
