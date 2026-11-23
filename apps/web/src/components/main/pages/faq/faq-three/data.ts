import { FaqThreeItem } from "./types";

export const defaultFaqThreeData: FaqThreeItem[] = [
  {
    title: "Do I get free updates?",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et nunc ut risus imperdiet lacinia.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    title: "Which license type is suitable for me?",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    title: 'What are the "Seats" mentioned on pricing plans?',
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et nunc ut risus imperdiet lacinia.",
  },
  {
    title: "Can I Customize TailAdmin to suit my needs?",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et nunc ut risus imperdiet lacinia.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    title: 'What does "Unlimited Projects" mean?',
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec quis magna ac nibh malesuada consectetur at vitae ipsum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam fermentum, leo et lacinia accumsan, ligula ante hendrerit nisi, eget vulputate ante justo et justo.",
  },
];

export const defaultLeftFaqItems: FaqThreeItem[] = defaultFaqThreeData.slice(0, 3);
export const defaultRightFaqItems: FaqThreeItem[] = defaultFaqThreeData.slice(3);

