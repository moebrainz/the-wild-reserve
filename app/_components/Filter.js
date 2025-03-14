"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

function Filter() {
  //get all the url string parameters to this client component
  const searchParams = useSearchParams();

  //use userouter to navigate the search params
  const router = useRouter();

  //get the path from the searchbar
  const pathname = usePathname();

  function handleFilter(filter) {
    //searching for a particular parameter from the url using url search params
    const params = new URLSearchParams(searchParams);

    //set capacity to the filter term
    params.set("capacity", filter);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }
  const activeFilter = searchParams.get("capacity") ?? "all";
  return (
    <div className="border border-primary-800 flex">
      <Button
        filter={"all"}
        handleFilter={handleFilter}
        activeFilter={activeFilter}
      >
        All cabins
      </Button>
      <Button
        filter={"small"}
        handleFilter={handleFilter}
        activeFilter={activeFilter}
      >
        1&mdash;3 guests
      </Button>
      <Button
        filter={"medium"}
        handleFilter={handleFilter}
        activeFilter={activeFilter}
      >
        4&mdash;7 guests
      </Button>
      <Button
        filter={"large"}
        handleFilter={handleFilter}
        activeFilter={activeFilter}
      >
        8&mdash;12 guests
      </Button>
    </div>
  );
}

function Button({ filter, handleFilter, activeFilter, children }) {
  return (
    <button
      className={`${
        filter === activeFilter ? "bg-primary-700" : " text-primary-50"
      } px-5 py-2 hover:bg-primary-700`}
      onClick={() => handleFilter(filter)}
    >
      {children}
    </button>
  );
}
export default Filter;
