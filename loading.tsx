export default function Loading() {
  return (
    <div className="space-y-3">
      <div className="h-10 skeleton rounded-xl" />
      <div className="card p-3">
        {Array.from({length: 8}).map((_,i)=>(
          <div key={i} className="grid grid-cols-[120px_120px_110px_140px_120px_140px_100px] gap-3 h-10 mb-2">
            {Array.from({length:7}).map((__,j)=>(
              <div key={j} className="skeleton rounded-md" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
