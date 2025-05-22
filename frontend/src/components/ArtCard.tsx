"use client";

export default function ArtCard({ imageUrl, title }: { imageUrl: string; title: string }) {
  return (
    <div className="border rounded-lg shadow-lg p-4 max-w-md">
      <img src={imageUrl} alt={title} className="w-full h-auto rounded-lg" />
      <h3 className="mt-2 text-lg font-bold text-center">{title}</h3>
    </div>
  );
}
