"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";

const checkboxItems = [
  "Lorem ipsum dolor sit amet",
  "It is a long established fact reader",
  "Lorem ipsum dolor sit amet",
  "Lorem ipsum dolor sit amet",
  "Lorem ipsum dolor sit amet",
];

export default function ListWithCheckbox() {
  // State to manage individual checkbox values
  const [checkedItems, setCheckedItems] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
  ]);

  // Handler to toggle individual checkboxes
  const handleCheckboxChange = (index: number, value: boolean) => {
    const updatedCheckedItems = [...checkedItems];
    updatedCheckedItems[index] = value;
    setCheckedItems(updatedCheckedItems);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white sm:w-fit dark:border-gray-800 dark:bg-white/3">
      <ul className="flex flex-col">
        {checkboxItems.map((item, index) => {
          const id = `listCheckbox${index}`; // Unique ID for each checkbox
          return (
            <li
              key={index}
              className="border-b border-gray-200 px-3 py-2.5 last:border-b-0 dark:border-gray-800"
            >
              <Field orientation="horizontal">
                <Checkbox
                  id={id}
                  checked={checkedItems[index]}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(index, checked)
                  }
                />
                <Label
                  htmlFor={id}
                  className="cursor-pointer font-normal text-gray-500 dark:text-gray-400"
                >
                  {item}
                </Label>
              </Field>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

