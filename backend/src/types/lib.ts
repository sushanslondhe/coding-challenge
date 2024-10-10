export interface ITransaction extends Document {
  title: string;
  description: string;
  price: number;
  dateOfSale: Date;
}

export interface QueryParams {
  month?: string;
  search?: string;
  page?: string;
  perPage?: string;
  sortField?: string;
  sortDirection?: string;
}

export interface Filter {
  $expr: {
    $eq: [
      {
        $month: {
          $dateFromString: {
            dateString: { $toString: string };
            format: string;
          };
        };
      },
      number
    ];
  };
  $or?: Array<{
    price?: number;
    title?: { $regex: RegExp };
    description?: { $regex: RegExp };
  }>;
}

export interface ApiResponse {
  transactions: ITransaction[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  sortField: string;
  sortDirection: string;
}
