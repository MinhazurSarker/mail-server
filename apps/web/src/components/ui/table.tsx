import React, { ReactNode } from "react";

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children?: ReactNode;
  className?: string;
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children?: ReactNode;
  className?: string;
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children?: ReactNode;
  className?: string;
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children?: ReactNode;
  className?: string;
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
  isHeader?: boolean;
  className?: string;
}

const Table: React.FC<TableProps> = ({ children, className = "", ...props }) => {
  return (
    <table className={`min-w-full ${className}`} {...props}>
      {children}
    </table>
  );
};

const TableHeader: React.FC<TableHeaderProps> = ({ children, className = "", ...props }) => {
  return (
    <thead className={className} {...props}>
      {children}
    </thead>
  );
};

const TableBody: React.FC<TableBodyProps> = ({ children, className = "", ...props }) => {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
};

const TableRow: React.FC<TableRowProps> = ({ children, className = "", ...props }) => {
  return (
    <tr className={className} {...props}>
      {children}
    </tr>
  );
};

const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className = "",
  ...props
}) => {
  const CellTag = isHeader ? "th" : "td";
  return (
    <CellTag className={` ${className}`} {...props}>
      {children}
    </CellTag>
  );
};

const TableHead: React.FC<TableCellProps> = (props) => (
  <TableCell isHeader {...props} />
);

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
