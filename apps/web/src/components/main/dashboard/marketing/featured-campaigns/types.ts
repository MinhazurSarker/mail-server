export type CampaignStatus = "success" | "pending" | "failed";

export type CampaignNameKey =
  | "growBrand"
  | "betterIdeas"
  | "increaseTraffic";

export interface CampaignCreator {
  image: string;
  name: string;
}

export interface CampaignDetails {
  image: string;
  nameKey: CampaignNameKey;
}

export interface Campaign {
  id: number;
  creator: CampaignCreator;
  campaign: CampaignDetails;
  status: CampaignStatus;
}
