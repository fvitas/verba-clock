type Swatch = { id: string; name: string; surface: string };

type SwatchRowProps = {
  swatches: Swatch[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function SwatchRow({ swatches, selectedId, onSelect }: SwatchRowProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {swatches.map((swatch) => (
        <button
          key={swatch.id}
          aria-label={swatch.name}
          title={swatch.name}
          className={`size-6 rounded-full border border-white/20 ${
            swatch.id === selectedId ? 'outline-2 outline-offset-2 outline-white' : ''
          }`}
          style={{ background: swatch.surface }}
          onClick={() => onSelect(swatch.id)}
        />
      ))}
    </div>
  );
}
