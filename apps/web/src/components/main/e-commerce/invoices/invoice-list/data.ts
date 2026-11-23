import { Invoice } from "./types";

export const initialInvoicesData: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "#323534",
    customer: "Lindsey Curtis",
    createdDate: "August 7, 2028",
    dueDate: "February 28, 2028",
    total: "$999",
    status: "Paid",
  },
  {
    id: "2",
    invoiceNumber: "#323534",
    customer: "Kaiya George",
    createdDate: "August 2, 2028",
    dueDate: "February 29, 2028",
    total: "$485",
    status: "Overdue",
  },
  {
    id: "3",
    invoiceNumber: "#323534",
    customer: "Zain Geidt",
    createdDate: "May 12, 2028",
    dueDate: "December 2, 2028",
    total: "$935",
    status: "Pending",
  },
  {
    id: "4",
    invoiceNumber: "#323534",
    customer: "Abram Schleifer",
    createdDate: "May 6, 2028",
    dueDate: "August 24, 2028",
    total: "$840",
    status: "Paid",
  },
  {
    id: "5",
    invoiceNumber: "#323534",
    customer: "Carla George",
    createdDate: "October 24, 2028",
    dueDate: "August 2, 2028",
    total: "$290",
    status: "Paid",
  },
  {
    id: "6",
    invoiceNumber: "#323534",
    customer: "Emery Culhane",
    createdDate: "July 14, 2028",
    dueDate: "May 12, 2028",
    total: "$560",
    status: "Paid",
  },
  {
    id: "7",
    invoiceNumber: "#323534",
    customer: "Livia Donin",
    createdDate: "December 29, 2028",
    dueDate: "July 14, 2028",
    total: "$680",
    status: "Draft",
  },
  {
    id: "8",
    invoiceNumber: "#323534",
    customer: "Miracle Bator",
    createdDate: "March 13, 2028",
    dueDate: "May 6, 2028",
    total: "$295",
    status: "Paid",
  },
  {
    id: "9",
    invoiceNumber: "#323534",
    customer: "Lincoln Herwitz",
    createdDate: "December 19, 2028",
    dueDate: "May 29, 2028",
    total: "$1,230",
    status: "Overdue",
  },
  {
    id: "10",
    invoiceNumber: "#323534",
    customer: "Ekstrom Bothman",
    createdDate: "November 16, 2028",
    dueDate: "September 9, 2028",
    total: "$1,920",
    status: "Paid",
  },
];

// Helper to generate up to 114 total records matching the Figma total counter
const generateExtendedInvoices = (): Invoice[] => {
  const result: Invoice[] = [...initialInvoicesData];
  const templates = [
    { customer: "Sophia Martinez", total: "$750", status: "Paid" as const },
    { customer: "Ethan Reynolds", total: "$1,120", status: "Pending" as const },
    { customer: "Chloe Bennett", total: "$430", status: "Overdue" as const },
    { customer: "Liam Jenkins", total: "$890", status: "Draft" as const },
    { customer: "Ava Robinson", total: "$620", status: "Paid" as const },
    { customer: "Noah Clark", total: "$1,450", status: "Paid" as const },
    { customer: "Isabella Lewis", total: "$310", status: "Pending" as const },
    { customer: "Mason Walker", total: "$980", status: "Overdue" as const },
  ];

  for (let i = 11; i <= 114; i++) {
    const template = templates[(i - 11) % templates.length];
    result.push({
      id: `${i}`,
      invoiceNumber: "#323534",
      customer: template.customer,
      createdDate: "October 10, 2028",
      dueDate: "November 10, 2028",
      total: template.total,
      status: template.status,
    });
  }

  return result;
};

export const extendedInvoicesData: Invoice[] = generateExtendedInvoices();
