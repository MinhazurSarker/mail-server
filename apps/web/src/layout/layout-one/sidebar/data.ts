import {
  AiIcon,
  CalendarIcon,
  CartIcon,
  LayoutGridIcon,
  ListIcon,
  PageIcon,
  TableIcon,
  TaskIcon,
  UserCircleIcon,
} from "@/icons";
import type { SidebarOneMenuItem } from "./types";

export const sidebarOneItems: SidebarOneMenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutGridIcon,
    items: [
      { key: "ecommerce", label: "Ecommerce", path: "#" },
      { key: "analytics", label: "Analytics", path: "#" },
      { key: "marketing", label: "Marketing", path: "#" },
      {
        key: "crm",
        label: "CRM",
        items: [
          { key: "inventory", label: "Inventory Management", path: "#" },
          {
            key: "productDevelopment",
            label: "Product Development",
            path: "#",
          },
          { key: "finance", label: "Finance", path: "#" },
          { key: "humanResources", label: "Human Resources", path: "#" },
          { key: "supplyChain", label: "Supply Chain", path: "#" },
        ],
      },
      { key: "stocks", label: "Stocks", path: "#", badge: "New" },
      { key: "saas", label: "SaaS", path: "#" },
      { key: "logistics", label: "Logistics", path: "#" },
      { key: "sales", label: "Sales", path: "/sales" },
      { key: "aiDashboard", label: "AI", path: "/ai" },
    ],
  },
  {
    key: "ai",
    label: "AI Assistant",
    icon: AiIcon,
    items: [
      { key: "textGenerator", label: "Text Generator", path: "#" },
      { key: "imageGenerator", label: "Image Generator", path: "#" },
      { key: "codeGenerator", label: "Code Generator", path: "#" },
      { key: "videoGenerator", label: "Video Generator", path: "#" },
    ],
  },
  {
    key: "ecommerceMenu",
    label: "E-commerce",
    icon: CartIcon,
    items: [
      { key: "products", label: "Products", path: "#" },
      { key: "addProduct", label: "Add Product", path: "#" },
      { key: "billing", label: "Billing", path: "#" },
      {
        key: "invoices",
        label: "Invoices",
        items: [
          { key: "invoiceList", label: "Invoices List", path: "#" },
          { key: "singleInvoice", label: "Single Invoice", path: "#" },
          { key: "createInvoice", label: "Create Invoice", path: "#" },
        ],
      },
      { key: "transactions", label: "Transactions", path: "#" },
      { key: "singleTransaction", label: "Single Transaction", path: "#" },
    ],
  },
  { key: "calendar", label: "Calendar", icon: CalendarIcon, path: "#" },
  { key: "profile", label: "User Profile", icon: UserCircleIcon, path: "#" },
  {
    key: "task",
    label: "Task",
    icon: TaskIcon,
    items: [
      { key: "taskList", label: "List", path: "#" },
      { key: "taskKanban", label: "Kanban", path: "#" },
    ],
  },
  {
    key: "forms",
    label: "Forms",
    icon: ListIcon,
    items: [
      { key: "formElements", label: "Form Elements", path: "#" },
      { key: "formLayout", label: "Form Layout", path: "#" },
    ],
  },
  {
    key: "tables",
    label: "Tables",
    icon: TableIcon,
    items: [
      { key: "basicTables", label: "Basic Tables", path: "#" },
      { key: "dataTables", label: "Data Tables", path: "#" },
    ],
  },
  {
    key: "pages",
    label: "Pages",
    icon: PageIcon,
    items: [
      { key: "fileManager", label: "File Manager", path: "#" },
      { key: "pricingTables", label: "Pricing Tables", path: "#" },
      { key: "faq", label: "FAQ", path: "#" },
      { key: "apiKeys", label: "API Keys", path: "#", badge: "New" },
      { key: "integrations", label: "Integrations", path: "#", badge: "New" },
      { key: "blank", label: "Blank Page", path: "#" },
      {
        key: "errorPages",
        label: "Error Pages",
        items: [
          { key: "error404", label: "404 Error", path: "#" },
          { key: "error500", label: "500 Error", path: "#" },
          { key: "error503", label: "503 Error", path: "#" },
        ],
      },
      { key: "comingSoon", label: "Coming Soon", path: "#" },
      { key: "maintenance", label: "Maintenance", path: "#" },
      { key: "success", label: "Success", path: "#" },
    ],
  },
];
