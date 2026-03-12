export default function PositionBar({ gk, def, mid, att }) {
  const total = gk + def + mid + att;

  return (
    <div className="flex h-4 w-full rounded overflow-hidden">

      <div
        className="bg-blue-500"
        style={{ width: `${(gk / total) * 100}%` }}
      />

      <div
        className="bg-green-500"
        style={{ width: `${(def / total) * 100}%` }}
      />

      <div
        className="bg-yellow-500"
        style={{ width: `${(mid / total) * 100}%` }}
      />

      <div
        className="bg-red-500"
        style={{ width: `${(att / total) * 100}%` }}
      />

    </div>
  );
}