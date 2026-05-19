import { BenchmarkBar } from "./BenchmarkBar";

const data = [
  {
    name: "Seed",
    cost: 105.5,
    benchmark: 99.38,
  },
  {
    name: "Fertilizer",
    cost: 195.0,
    benchmark: 187.01,
  },
];

export function PeerSnapshot() {
  return (
    <div className="space-y-4">
      {data.map((item) => (
        <BenchmarkBar
          key={item.name}
          label={item.name}
          farmCost={item.cost}
          benchmarkCost={item.benchmark}
        />
      ))}
    </div>
  );
}
