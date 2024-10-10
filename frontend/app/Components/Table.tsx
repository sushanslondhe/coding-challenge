import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Sample data generator
const generateData = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    category: ["Electronics", "Clothing", "Books", "Home", "Sports"][
      Math.floor(Math.random() * 5)
    ],
    quantity: Math.floor(Math.random() * 100),
    price: (Math.random() * 100).toFixed(2),
  }));

export default function ModernDashboardPage() {
  const data = generateData(50); // Generate 50 items for demonstration
  const itemsPerPage = 10;
  //   const totalPages = Math.ceil(data.length / itemsPerPage)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[100px] font-semibold text-gray-600">
                    ID
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Name
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Category
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-600">
                    Quantity
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-600">
                    Price
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.slice(0, itemsPerPage).map((item, index) => (
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
                    <TableCell className="text-gray-700">{item.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-gray-700">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right font-medium text-gray-900">
                      ${item.price}
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
