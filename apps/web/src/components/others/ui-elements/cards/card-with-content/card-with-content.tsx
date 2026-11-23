import CardOne from "./card-one";
import CardTwo from "./card-two";

export default function CardWithContent() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <CardOne />
      <div>
        <CardTwo />
      </div>
    </div>
  );
}
