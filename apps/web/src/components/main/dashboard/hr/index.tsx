import AttendanceOverview from "./attendance-overview";
import EmployeeByDepartment from "./employee-by-department";
import EmployeeDirectory from "./employee-directory";
import EmployeeGrowth from "./employee-growth";
import HrHeader from "./header";
import InterviewAndMeetings from "./interview-and-meetings";
import JobStatistics from "./job-statistics";
import QuickStats from "./quick-stats";

export default function HrDashboard() {
  return (
    <div className="space-y-4 md:space-y-6">
      <HrHeader />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-4 md:space-y-6 xl:col-span-7">
          <QuickStats />
          <AttendanceOverview />
          <EmployeeByDepartment />
        </div>

        <div className="col-span-12 space-y-4 md:space-y-6 xl:col-span-5">
          <InterviewAndMeetings />
          <JobStatistics />
          <EmployeeGrowth />
        </div>
      </div>

      <EmployeeDirectory />
    </div>
  );
}
