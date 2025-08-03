import React from "react";
import { useQuery } from "@tanstack/react-query";
import FoodCard from "./FoodCard";
import { SERVER_URL } from "./utils/constants";

const foodTypes = ["burger", "pizza", "sandwich"];



const FoodList = ({ selected }) => {
  const selectedType = foodTypes[selected];
  

  const { data, isLoading, error } = useQuery({
    queryKey: ["productsData", selectedType],
    queryFn: async () => {
      const response = await fetch(`${SERVER_URL}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name:selectedType })
      });

      if (!response.ok) {
        throw new Error("Failed to fetch food data");
      }

      return response.json(); // Assumes backend returns a list of food objects
    }
  });

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-600">Error loading data</p>;
  if (!data) return <p className="p-4">No data available</p>;

  // Split data into rows of 3
  const chunked = [];
  for (let i = 0; i < data.length; i += 3) {
    chunked.push(data.slice(i, i + 3));
  }

  return (
    <>
      {chunked.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex overflow-x-auto space-x-4 px-2 py-2"
        >
          {row.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col space-y-2 min-w-[150px]"
            >
              <FoodCard
                image={item.image_url}
                name={item.name}
                description={item.description}
                note={item.note}
                price={item.price}
              />
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

export default FoodList;
