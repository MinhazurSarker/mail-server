import CardOne from "./card-one";
import CardTwo from "./card-two";

export default function CardWithIcon() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <div>
        <CardOne />
      </div>

      <CardTwo />
    </div>
  );
}
