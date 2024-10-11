import { Card, CardContent, CardHeader } from "@/components/ui/card";
import axios from "axios";
import { useEffect, useState } from "react";

export default function StatsTable({ month }: { month: string }) {
  //   const month = "June";
  const url = `http://localhost:3010/api/stats/total?month=${month}`;

  const [data, setData] = useState({});
  useEffect(() => {
    async function getData() {
      try {
        const response = await axios.get(url);
        setData(response.data);
        // console.log(response.data.totalSaleAmount);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    getData();
  }, [month]);

  return (
    <div className=" flex justify-center">
      <Card className=" w-[600px] ">
        <CardHeader>Statistics of {month}</CardHeader>
        <CardContent className="">
          <div className="border w-full">
            <div className="flex gap-5">
              <p>Total Sale value of Sold Items</p>${data.totalSaleAmount}
            </div>
            <div className="flex gap-5">
              <p className="">Count of Items sold</p>
              {data.NumberOfItemsSold}
            </div>
            <div className="flex gap-5">
              <p>Count of Unsold Items</p>
              {data.unsoldItems}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
