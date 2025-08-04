import React from "react";
import { useQuery } from "@tanstack/react-query";
import FoodCard from "./FoodCard";
import { SERVER_URL } from "./utils/constants";

const foodTypes = ["burger", "pizza", "sandwich"];

const FoodList = ({ selected, hidden = "" }) => {
    const selectedType = foodTypes[selected];

    const { data, isLoading, error } = useQuery({
        queryKey: ["productsData", selectedType],
        queryFn: async () => {
            const response = await fetch(`${SERVER_URL}/search`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: selectedType })
            });

            if (!response.ok) {
                throw new Error("Failed to fetch food data");
            }

            return response.json();
        }
    });

    if (isLoading) return <p className="p-4">Loading...</p>;
    if (error) return <p className="p-4 text-red-600">Error loading data</p>;
    if (!data) return <p className="p-4">No data available</p>;

    // Determine chunk size based on screen size
    // Default to 3, use 4 for medium screens and up
    let chunkSize = 3;


    // Split data into rows of chunkSize
    let chunked = [];
    function splitChunks(data, chunkSize) {
        const chunked = [];

        for (let i = 0; i < data.length; i += chunkSize) {
            let remaining = data.length - i;

            // If remaining items would leave a last chunk of 1 or 2, adjust the current chunk size
            if (remaining <= 2 && chunked.length > 0) {
                // Merge the remaining with the previous chunk
                const last = chunked.pop();
                chunked.push([...last, ...data.slice(i)]);
                break;
            }

            if (remaining === 1 || remaining === 2) {
                // If this is the first and only chunk, just return one big chunk
                chunked.push(data.slice(i));
                break;
            }

            chunked.push(data.slice(i, i + chunkSize));
        }

        return chunked;
    }

    chunked = splitChunks(data, chunkSize)
    return (
        <>
            {chunked.map((row, rowIndex) => (
                <div
                    key={rowIndex}
                    className={"flex overflow-x-auto space-x-4 px-2 py-2 md:hidden"}
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
            <div className={`hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 px-2 py-2 md:mt-4 ${hidden}`}>
                {data.map((item, idx) => (
                    <div key={idx} className="flex flex-col space-y-2">
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
        </>
    );
};

export default FoodList;
