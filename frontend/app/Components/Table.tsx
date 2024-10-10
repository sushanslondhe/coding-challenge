import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import axios from "axios";

// Define the interface for your data items
interface DataItem {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  sold: number;
  image?: string; // Made optional since it seems empty in your table
}

const url = "http://localhost:3010/api/stats/data";

export default function DashboardTable() {
  // Properly type the state
  const [data, setData] = useState<DataItem[]>([]);

  useEffect(() => {
    async function getData() {
      try {
        const response = await axios.get<{ transactions: DataItem[] }>(url);
        setData(response.data.transactions);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    getData();
  }, []);

  return (
    <div className="p-8">
      <Card className="mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-600">
                    Id
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Image
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Title
                  </TableHead>
                  <TableHead className="text-start font-semibold text-gray-600">
                    Description
                  </TableHead>
                  <TableHead className="text-start font-semibold text-gray-600">
                    Category
                  </TableHead>
                  <TableHead className="text-start font-semibold text-gray-600">
                    Price
                  </TableHead>
                  <TableHead className="text-start font-semibold text-gray-600">
                    Sold
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className={`
                      transition-colors hover:bg-gray-50
                      ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    `}
                  >
                    <TableCell className="font-medium text-gray-900">
                      {item.id}
                    </TableCell>
                    <TableCell className="text-gray-700 h-[20px] w-[20px]">
                      {item.image}
                    </TableCell>
                    <TableCell className="font-semibold text-gray-800 line-clamp-3 w-[250px]">
                      {item.title}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-300 line-clamp-2 w-[400px]">
                        {item.description}
                      </span>
                    </TableCell>
                    <TableCell className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                      {item.category}
                    </TableCell>
                    <TableCell className="border text-right font-medium text-gray-900">
                      ${item.price}
                    </TableCell>
                    <TableCell className="text-right font-medium text-gray-900">
                      {item.sold}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
