export type PortfolioPeriod = "monthly" | "quarterly" | "annually";

export interface TabItem {
  id: PortfolioPeriod;
  labelKey: "monthly" | "quarterly" | "annually";
}

export const portfolioTabs: TabItem[] = [
  { id: "monthly", labelKey: "monthly" },
  { id: "quarterly", labelKey: "quarterly" },
  { id: "annually", labelKey: "annually" },
];

export const milestoneDates = [
  "May 26",
  "Jun 02",
  "Jun 09",
  "Jun 16",
  "Jun 23",
  "Jun 30",
  "Jul 07",
  "Jul 14",
  "Jul 21",
  "Jul 28",
  "Aug 04",
  "Aug 11",
  "Aug 18",
  "Aug 25",
];

export const categoriesMonthly = [
  "May 26", "May 27", "May 28", "May 29", "May 30", "May 31", "Jun 01",
  "Jun 02", "Jun 03", "Jun 04", "Jun 05", "Jun 06", "Jun 07", "Jun 08",
  "Jun 09", "Jun 10", "Jun 11", "Jun 12", "Jun 13", "Jun 14", "Jun 15",
  "Jun 16", "Jun 17", "Jun 18", "Jun 19", "Jun 20", "Jun 21", "Jun 22",
  "Jun 23", "Jun 24", "Jun 25", "Jun 26", "Jun 27", "Jun 28", "Jun 29",
  "Jun 30", "Jul 01", "Jul 02", "Jul 03", "Jul 04", "Jul 05", "Jul 06",
  "Jul 07", "Jul 08", "Jul 09", "Jul 10", "Jul 11", "Jul 12", "Jul 13",
  "Jul 14", "Jul 15", "Jul 16", "Jul 17", "Jul 18", "Jul 19", "Jul 20",
  "Jul 21", "Jul 22", "Jul 23", "Jul 24", "Jul 25", "Jul 26", "Jul 27",
  "Jul 28", "Jul 29", "Jul 30", "Jul 31", "Aug 01", "Aug 02", "Aug 03",
  "Aug 04", "Aug 05", "Aug 06", "Aug 07", "Aug 08", "Aug 09", "Aug 10",
  "Aug 11", "Aug 12", "Aug 13", "Aug 14", "Aug 15", "Aug 16", "Aug 17",
  "Aug 18", "Aug 19", "Aug 20", "Aug 21", "Aug 22", "Aug 23", "Aug 24",
  "Aug 25",
];

export const dataMonthly = [
  1200, 1215, 1240, 1220, 1210, 1230, 1255,
  1268, 1262, 1275, 1282, 1270, 1276, 1292,
  1308, 1322, 1314, 1330, 1344, 1336, 1350,
  1382, 1368, 1362, 1378, 1370, 1380, 1385,
  1412, 1398, 1392, 1410, 1428, 1420, 1435,
  1410, 1392, 1368, 1415, 1405, 1445, 1432,
  1440, 1475, 1515, 1500, 1492, 1480, 1495,
  1528, 1548, 1552, 1530, 1572, 1590, 1565,
  1555, 1562, 1560, 1568, 1570, 1545, 1595,
  1645, 1660, 1652, 1682, 1720, 1702, 1748,
  1845, 1795, 1782, 1770, 1768, 1485, 1575,
  1395, 1468, 1510, 1532, 1625, 1638, 1600,
  1578, 1592, 1712, 1668, 1590, 1538, 1552, 1568,
];

export const categoriesQuarterly = [
  "Q1 2023",
  "Q2 2023",
  "Q3 2023",
  "Q4 2023",
  "Q1 2024",
  "Q2 2024",
  "Q3 2024",
  "Q4 2024",
  "Q1 2025",
  "Q2 2025",
  "Q3 2025",
  "Q4 2025",
];

export const dataQuarterly = [
  1240, 1310, 1285, 1360, 1420, 1390, 1480, 1550, 1620, 1580, 1720, 1850,
];

export const categoriesAnnually = [
  "2018",
  "2019",
  "2020",
  "2021",
  "2022",
  "2023",
  "2024",
  "2025",
];

export const dataAnnually = [
  1220, 1290, 1380, 1450, 1410, 1580, 1740, 1920,
];

export const getPortfolioData = (
  period: PortfolioPeriod,
  seriesName: string,
) => {
  switch (period) {
    case "quarterly":
      return {
        series: [
          {
            name: seriesName,
            data: dataQuarterly,
          },
        ],
        categories: categoriesQuarterly,
      };
    case "annually":
      return {
        series: [
          {
            name: seriesName,
            data: dataAnnually,
          },
        ],
        categories: categoriesAnnually,
      };
    case "monthly":
    default:
      return {
        series: [
          {
            name: seriesName,
            data: dataMonthly,
          },
        ],
        categories: categoriesMonthly,
      };
  }
};
