export type CandidateStatus = "Hired" | "In Progress" | "Pending";

export interface CandidateUser {
  name: string;
  email: string;
}

export interface Candidate {
  id: string | number;
  user: CandidateUser;
  position: string;
  salary: string;
  office: string;
  status: CandidateStatus;
}

export interface TableThreeProps {
  data?: Candidate[];
  className?: string;
  onDownload?: () => void;
  onDelete?: (id: string | number) => void;
  onEdit?: (candidate: Candidate) => void;
}
