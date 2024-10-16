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
import { Search } from "lucide-react";

interface DataItem {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  sold: number;
  image?: string;
}

const url = "http://localhost:3010/api/stats/data";

export default function DashboardTable({ month }: { month: string }) {
  const [search, setSearch] = useState<string>("");
  const [data, setData] = useState<DataItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<{ transactions: DataItem[] }>(
          `${url}?month=${month}`,
          {
            params: {
              search: search || undefined, // Only include search if it's not empty
            },
          }
        );
        setData(response.data.transactions);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [month, search]);

  return (
    <div className="p-8">
      <div className="flex justify-center items-center mb-5">
        <div className="relative w-[400px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for data"
            className="pl-10"
          />
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No results found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item, index) => (
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
