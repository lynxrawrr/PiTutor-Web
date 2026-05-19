import { Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

type PageToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  filterLabel?: string;
};

export function PageToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filterLabel = "Filter",
}: PageToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <label className="flex h-12 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm sm:min-w-72">
        <Search className="size-5 text-slate-400" aria-hidden="true" />
        <span className="sr-only">{searchPlaceholder}</span>
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full bg-transparent outline-none placeholder:text-slate-400"
          placeholder={searchPlaceholder}
        />
      </label>
      <Button variant="secondary">
        <Filter className="size-4" aria-hidden="true" />
        {filterLabel}
      </Button>
    </div>
  );
}
