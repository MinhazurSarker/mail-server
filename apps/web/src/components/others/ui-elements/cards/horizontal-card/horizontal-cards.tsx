import CardOne from "./card-one";
import CardTwo from "./card-two";

export default function HorizontalCards() {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <CardOne />
      <CardTwo />
    </div>
  );
}
