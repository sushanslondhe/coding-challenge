"use client";
import { useState } from "react";
import RangeBarChart from "./Components/BarChart";
import { DropDown } from "./Components/DropdownMenu";
import CategoryPieChart from "./Components/PieChart";
import StatsTable from "./Components/Stats";
import DashboardTable from "./Components/Table";

export default function Page() {
  const [month, setMonth] = useState("March");
  function handleDropDown(data: string) {
    setMonth(data);
  }
  return (
    <div className="flex flex-col justify-center items-center gap-5">
      <div className=" absolute top-8 right-44 ">
        <DropDown onDataUpdate={handleDropDown} />
      </div>
      <div className=" w-full">
        <DashboardTable month={month} />
      </div>
      <div>
        <StatsTable month={month} />
      </div>
      <div className="w-full">
        <RangeBarChart month={month} />
      </div>
      <div className="w-full">
        <CategoryPieChart month={month} />
      </div>
    </div>
  );
}
